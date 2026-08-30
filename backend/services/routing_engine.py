"""
Cargo-Criticality Multi-Objective Routing Engine for Northeast India Highway Network.
Calculates optimal and alternate corridors factoring in cargo priority, terrain slope,
real-time hazard scores, road blockages, and ETA deltas.
"""

import heapq
import logging
from typing import Dict, List, Any, Optional, Tuple
from models import CargoType, CorridorStatus, RouteOption, RouteSegment

logger = logging.getLogger("ner_lrp.routing_engine")


class RoutingEngine:
    """Multi-Objective Highway Network Routing Engine for NER."""

    def __init__(self):
        # Adjacency list: node -> list of outgoing corridor edge dicts
        self.adj_list: Dict[str, List[Dict[str, Any]]] = {}
        self.corridor_index: Dict[str, Dict[str, Any]] = {}

    def build_network_graph(self, corridors_data: List[Dict[str, Any]]):
        """Build or refresh graph from corridor status and metadata."""
        self.adj_list = {}
        self.corridor_index = {}

        for corr in corridors_data:
            cid = corr["id"]
            u = corr["start_node"]
            v = corr["end_node"]
            self.corridor_index[cid] = corr

            # Edge u -> v
            edge_forward = {
                "corridor_id": cid,
                "highway_code": corr.get("highway_code", "NH"),
                "name": corr.get("name", cid),
                "from_node": u,
                "to_node": v,
                "distance_km": float(corr.get("length_km", 50.0)),
                "normal_time_mins": int(corr.get("normal_time_mins", 60)),
                "slope_deg": float(corr.get("slope_deg", 10.0)),
                "hazard_score": float(corr.get("current_hazard_score", 15.0)),
                "status": corr.get("status", "OPEN"),
                "geometry": corr.get("geometry", {}).get("coordinates", [])
            }

            # Edge v -> u (reverse coordinates for geometry)
            rev_geom = list(reversed(edge_forward["geometry"])) if edge_forward["geometry"] else []
            edge_reverse = {
                "corridor_id": cid,
                "highway_code": corr.get("highway_code", "NH"),
                "name": f"{v} to {u} ({corr.get('highway_code', 'NH')})",
                "from_node": v,
                "to_node": u,
                "distance_km": float(corr.get("length_km", 50.0)),
                "normal_time_mins": int(corr.get("normal_time_mins", 60)),
                "slope_deg": float(corr.get("slope_deg", 10.0)),
                "hazard_score": float(corr.get("current_hazard_score", 15.0)),
                "status": corr.get("status", "OPEN"),
                "geometry": rev_geom
            }

            self.adj_list.setdefault(u, []).append(edge_forward)
            self.adj_list.setdefault(v, []).append(edge_reverse)

    def _calculate_edge_cost(
        self,
        edge: Dict[str, Any],
        cargo_type: CargoType,
        custom_risk_penalty: Optional[float] = None
    ) -> float:
        """
        Calculate edge traversal cost based on Cargo-Criticality multi-objective function.
        """
        time_mins = float(edge["normal_time_mins"])
        hazard = float(edge["hazard_score"])
        status = edge["status"]

        # Completely impassable / blocked roads receive near-infinite penalty
        if status == "BLOCKED" or hazard >= 85.0:
            return 1000000.0 + time_mins

        if custom_risk_penalty is not None:
            risk_multiplier = custom_risk_penalty
            cost = time_mins * (1.0 + (hazard / 100.0) ** 1.8 * risk_multiplier)
            return cost

        if cargo_type == CargoType.CRITICAL_MEDICAL:
            # High safety priority: heavy non-linear penalty for moderate-to-high risk
            # Avoids warning segments (hazard > 60) even if detour adds 1-2 hours
            risk_penalty = (hazard / 100.0) ** 2.4 * 18.0
            warning_penalty = 300.0 if status == "WARNING" else 0.0
            cost = time_mins * (1.0 + risk_penalty) + warning_penalty
            return cost

        elif cargo_type == CargoType.RELIEF_SUPPLIES:
            # Balanced priority: moderate penalty for hazard, avoids blocked
            risk_penalty = (hazard / 100.0) ** 1.6 * 6.0
            warning_penalty = 120.0 if status == "WARNING" else 0.0
            cost = time_mins * (1.0 + risk_penalty) + warning_penalty
            return cost

        else:  # COMMERCIAL_BULK
            # Low risk aversion: primarily optimizes for lowest travel time
            risk_penalty = (hazard / 100.0) * 1.5
            cost = time_mins * (1.0 + risk_penalty)
            return cost

    def find_routes(
        self,
        origin: str,
        destination: str,
        cargo_type: CargoType = CargoType.COMMERCIAL_BULK,
        avoid_corridors: Optional[List[str]] = None,
        custom_risk_penalty: Optional[float] = None,
        max_options: int = 3
    ) -> List[RouteOption]:
        """
        Compute primary optimal route and distinct alternative corridors using modified Dijkstra.
        """
        if origin not in self.adj_list or destination not in self.adj_list:
            logger.warning(f"Routing nodes {origin} or {destination} not found in graph.")
            return []

        avoid_set = set(avoid_corridors or [])
        options: List[RouteOption] = []

        # Find primary path
        primary_path = self._dijkstra_path(origin, destination, cargo_type, avoid_set, custom_risk_penalty)
        if primary_path:
            opt = self._build_route_option(f"route-primary-{cargo_type.value.lower()}", primary_path, cargo_type, is_recommended=True)
            options.append(opt)

        # Find alternative backup paths (by temporarily penalizing edges of previously found paths)
        seen_path_keys = set()
        if primary_path:
            seen_path_keys.add(tuple(e["corridor_id"] for e in primary_path))

        for i in range(1, max_options):
            if not primary_path:
                break
            # Penalize edges from previous options to find alternative corridors
            edges_to_avoid = set(avoid_set)
            # Avoid the most critical corridor of the previous route
            if primary_path and len(primary_path) > 0:
                # Avoid corridor at index (i - 1) % len(primary_path)
                corr_to_ban = primary_path[min(i - 1, len(primary_path) - 1)]["corridor_id"]
                edges_to_avoid.add(corr_to_ban)

            alt_path = self._dijkstra_path(origin, destination, cargo_type, edges_to_avoid, custom_risk_penalty)
            if alt_path:
                path_key = tuple(e["corridor_id"] for e in alt_path)
                if path_key not in seen_path_keys:
                    seen_path_keys.add(path_key)
                    opt = self._build_route_option(
                        f"route-alt-{i}-{cargo_type.value.lower()}",
                        alt_path,
                        cargo_type,
                        is_recommended=False,
                        reroute_reason=f"Alternative corridor avoiding {corr_to_ban}"
                    )
                    options.append(opt)

        return options

    def _dijkstra_path(
        self,
        origin: str,
        destination: str,
        cargo_type: CargoType,
        avoid_corridors: set,
        custom_risk_penalty: Optional[float]
    ) -> Optional[List[Dict[str, Any]]]:
        """Classic Dijkstra with edge cost weighting."""
        # Priority queue: (cumulative_cost, current_node, path_edges)
        pq: List[Tuple[float, str, List[Dict[str, Any]]]] = [(0.0, origin, [])]
        visited_costs: Dict[str, float] = {}

        while pq:
            curr_cost, u, path = heapq.heappop(pq)

            if u == destination:
                return path

            if u in visited_costs and visited_costs[u] <= curr_cost:
                continue
            visited_costs[u] = curr_cost

            for edge in self.adj_list.get(u, []):
                cid = edge["corridor_id"]
                if cid in avoid_corridors:
                    continue

                v = edge["to_node"]
                edge_cost = self._calculate_edge_cost(edge, cargo_type, custom_risk_penalty)

                # Skip completely blocked edges if huge cost
                if edge_cost >= 900000.0:
                    continue

                new_cost = curr_cost + edge_cost
                if v not in visited_costs or new_cost < visited_costs[v]:
                    heapq.heappush(pq, (new_cost, v, path + [edge]))

        return None

    def _build_route_option(
        self,
        route_id: str,
        path_edges: List[Dict[str, Any]],
        cargo_type: CargoType,
        is_recommended: bool = True,
        reroute_reason: Optional[str] = None
    ) -> RouteOption:
        """Construct structured RouteOption model from list of edge dicts."""
        total_dist = sum(float(e["distance_km"]) for e in path_edges)
        total_time = sum(int(e["normal_time_mins"]) for e in path_edges)
        hazards = [float(e["hazard_score"]) for e in path_edges]
        avg_hazard = round(sum(hazards) / len(hazards), 1) if hazards else 0.0
        max_hazard = round(max(hazards), 1) if hazards else 0.0
        safety_score = round(max(0.0, 100.0 - max_hazard), 1)

        bottlenecks = [
            f"{e['highway_code']} ({e['from_node']} - {e['to_node']}): Hazard {e['hazard_score']}/100 [{e['status']}]"
            for e in path_edges
            if e["hazard_score"] >= 60.0 or e["status"] in ["WARNING", "BLOCKED"]
        ]

        segments = [
            RouteSegment(
                corridor_id=e["corridor_id"],
                highway_code=e["highway_code"],
                name=e["name"],
                from_node=e["from_node"],
                to_node=e["to_node"],
                distance_km=e["distance_km"],
                estimated_time_mins=e["normal_time_mins"],
                hazard_score=e["hazard_score"],
                hazard_status=CorridorStatus(e["status"]),
                geometry=e.get("geometry", [])
            )
            for e in path_edges
        ]

        return RouteOption(
            route_id=route_id,
            cargo_type=cargo_type,
            total_distance_km=round(total_dist, 1),
            total_time_mins=total_time,
            eta_hours=round(total_time / 60.0, 2),
            average_hazard_score=avg_hazard,
            max_hazard_score=max_hazard,
            safety_score=safety_score,
            segments=segments,
            is_recommended=is_recommended,
            bottlenecks=bottlenecks,
            reroute_reason=reroute_reason
        )


# Global singleton routing engine instance
routing_engine = RoutingEngine()
