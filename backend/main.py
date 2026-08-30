"""
Northeast India Logistics Resilience Platform (NER-LRP) - FastAPI Backend Server.
Provides real-time multi-hazard risk scoring, cargo-criticality routing,
Open-Meteo live weather integration, multilingual alerts, and disruption simulation.
"""

import time
import logging
from contextlib import asynccontextmanager
from typing import List, Dict, Any, Optional

from fastapi import FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from database import init_db, DBManager
from models import (
    CorridorResponse,
    CorridorDetailResponse,
    LiveWeatherResponse,
    WeatherData,
    ShipmentResponse,
    RerouteRequest,
    RerouteResponse,
    RouteOption,
    FieldReportCreate,
    FieldReportResponse,
    FieldReportBatchSync,
    AlertResponse,
    BroadcastAlertRequest,
    SimulationTriggerRequest,
    SimulationResponse,
    SimulationResetResponse,
    CargoType,
    CorridorStatus,
    ShipmentStatus,
    AlertSeverity,
    DamageType
)
from services.data_fetcher import DataFetcherService, NER_STATIONS
from services.ml_risk_engine import risk_engine
from services.routing_engine import routing_engine
from services.multilingual_service import multilingual_service

# Logging Setup
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("ner_lrp.main")

START_TIME = time.time()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Platform startup & shutdown lifecycle."""
    logger.info("Initializing NER Logistics Resilience Platform Database and Graph...")
    init_db()
    # Pre-warm routing graph
    corridors = DBManager.get_all_corridors()
    routing_engine.build_network_graph(corridors)
    logger.info(f"Platform successfully booted with {len(corridors)} active corridors.")
    yield
    logger.info("Platform shutting down gracefully.")


app = FastAPI(
    title="Northeast India Logistics Resilience Platform (NER-LRP) API",
    description="Geospatial ML Hazard Prediction, Cargo-Criticality Routing & Multilingual Emergency Logistics Engine.",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for frontend and mobile GIS clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -------------------------------------------------------------
# 1. Health & Status Endpoints
# -------------------------------------------------------------

@app.get("/api/health", tags=["Health"])
async def get_health_status():
    """Returns platform operational health, ML model status, and uptime."""
    corridors = DBManager.get_all_corridors()
    shipments = DBManager.get_all_shipments()
    alerts = DBManager.get_all_alerts(limit=5)
    uptime_sec = round(time.time() - START_TIME, 1)

    return {
        "status": "HEALTHY",
        "platform": "Northeast India Logistics Resilience Platform (NER-LRP)",
        "version": "1.0.0",
        "uptime_seconds": uptime_sec,
        "ml_risk_engine": {
            "is_trained": risk_engine.is_trained,
            "model_type": "GradientBoostingRegressor (Multi-variable Geospatial)",
            "features": risk_engine.FEATURE_NAMES
        },
        "database": {
            "type": "SQLite ACID Store",
            "active_corridors_count": len(corridors),
            "active_shipments_count": len(shipments),
            "recent_alerts_count": len(alerts)
        },
        "geospatial": {
            "registered_stations": len(NER_STATIONS),
            "weather_provider": "Open-Meteo Real-Time Forecast API"
        }
    }


# -------------------------------------------------------------
# 2. Weather Endpoints
# -------------------------------------------------------------

@app.get("/api/weather/live", response_model=LiveWeatherResponse, tags=["Weather"])
async def get_live_weather(force_refresh: bool = Query(False, description="Bypass cache")):
    """Fetches real-time weather from Open-Meteo API for all 13+ NER station coordinates."""
    station_data = await DataFetcherService.fetch_all_stations_weather(force_refresh=force_refresh)
    stations_models = [WeatherData(**st) for st in station_data]
    now_str = time.strftime("%Y-%m-%d %H:%M:%S")

    return LiveWeatherResponse(
        timestamp=now_str,
        total_stations=len(stations_models),
        data_source="Open-Meteo API / WMO High-Resolution NWP",
        stations=stations_models
    )


# -------------------------------------------------------------
# 3. Corridors & Hazard Endpoints
# -------------------------------------------------------------

@app.get("/api/corridors", response_model=List[CorridorResponse], tags=["Corridors"])
async def list_corridors(status_filter: Optional[str] = Query(None, description="Filter by status (OPEN, WATCH, WARNING, BLOCKED)")):
    """Retrieves all Northeast highway corridors with current hazard scores, status, and geometries."""
    corridors = DBManager.get_all_corridors()
    if status_filter:
        corridors = [c for c in corridors if c["status"].upper() == status_filter.upper()]
    return corridors


@app.get("/api/corridors/{corridor_id}", response_model=CorridorDetailResponse, tags=["Corridors"])
async def get_corridor_details(corridor_id: str):
    """Retrieves detailed risk breakdown, SRTM elevation profile, GSI hotspots, and field reports."""
    corr = DBManager.get_corridor_by_id(corridor_id)
    if not corr:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Corridor '{corridor_id}' not found."
        )
    return corr


# -------------------------------------------------------------
# 4. Shipments & Cargo-Criticality Routing Endpoints
# -------------------------------------------------------------

@app.get("/api/shipments", response_model=List[ShipmentResponse], tags=["Shipments"])
async def list_shipments(cargo_type: Optional[CargoType] = Query(None, description="Filter by Cargo Type")):
    """Retrieves all active shipments with priority, assigned route, and reroute indicators."""
    shipments = DBManager.get_all_shipments()
    if cargo_type:
        shipments = [s for s in shipments if s["cargo_type"] == cargo_type.value]
    return shipments


@app.get("/api/shipments/{shipment_id}", response_model=ShipmentResponse, tags=["Shipments"])
async def get_shipment_details(shipment_id: str):
    """Retrieves single shipment by ID or tracking code."""
    shipment = DBManager.get_shipment_by_id(shipment_id)
    if not shipment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Shipment '{shipment_id}' not found."
        )
    return shipment


@app.post("/api/shipments/reroute", response_model=RerouteResponse, tags=["Shipments"])
async def reroute_shipment(req: RerouteRequest):
    """Recalculates optimal path for shipment using Cargo-Criticality multi-objective weighting."""
    shipment = DBManager.get_shipment_by_id(req.shipment_id)
    if not shipment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Shipment '{req.shipment_id}' not found."
        )

    cargo_type = req.cargo_type or CargoType(shipment["cargo_type"])
    origin = shipment["origin"]
    destination = shipment["destination"]
    avoid_list = req.avoid_corridor_ids or []

    # Refresh routing network
    corridors = DBManager.get_all_corridors()
    routing_engine.build_network_graph(corridors)

    routes = routing_engine.find_routes(
        origin=origin,
        destination=destination,
        cargo_type=cargo_type,
        avoid_corridors=avoid_list,
        custom_risk_penalty=req.custom_risk_penalty
    )

    if not routes:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"No viable route found connecting {origin} to {destination} with given constraints."
        )

    new_primary_route = routes[0]
    alt_routes = routes[1:] if len(routes) > 1 else []
    prev_route_id = shipment["assigned_route"].get("route_id", "route-original")
    initial_eta = shipment["initial_eta_mins"]
    new_eta = new_primary_route.total_time_mins
    eta_delta = new_eta - initial_eta

    # Update database
    new_status = ShipmentStatus.REROUTED.value if eta_delta != 0 else ShipmentStatus.IN_TRANSIT.value
    DBManager.update_shipment_route(
        shipment_id=shipment["id"],
        assigned_route=new_primary_route.model_dump(),
        alt_routes=[r.model_dump() for r in alt_routes],
        new_eta=new_eta,
        status=new_status
    )

    explanation = (
        f"Route recalculated for {cargo_type.value} cargo. "
        f"Avoided blocked/hazardous sectors. Total time: {new_primary_route.eta_hours}h ({new_eta} mins), "
        f"ETA Delta: {eta_delta:+d} mins."
    )

    return RerouteResponse(
        shipment_id=shipment["id"],
        tracking_code=shipment["tracking_code"],
        cargo_type=cargo_type,
        previous_route_id=prev_route_id,
        new_route=new_primary_route,
        eta_delta_mins=eta_delta,
        reroute_triggered=True,
        explanation=explanation,
        alternative_options=alt_routes
    )


# -------------------------------------------------------------
# 5. Simulation & Disruption Testing Endpoints
# -------------------------------------------------------------

@app.post("/api/simulation/trigger", response_model=SimulationResponse, tags=["Simulation"])
async def trigger_disruption_simulation(req: SimulationTriggerRequest):
    """
    Simulates a major landslide/flood event on a corridor, triggering
    instant ML risk re-scoring, corridor status updates, and automated shipment rerouting.
    """
    corr = DBManager.get_corridor_by_id(req.corridor_id)
    if not corr:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Corridor '{req.corridor_id}' not found."
        )

    # Compute new hazard score
    hist_v = corr.get("historical_vulnerability", 0.7)
    slope = corr.get("slope_deg", 25.0)
    surge_rain = req.rainfall_surge_mm
    report_severity = float(req.severity)

    pred = risk_engine.predict_risk(
        rainfall_48h=surge_rain + 80.0,
        rain_intensity=18.0,
        slope_deg=slope,
        soil_saturation=0.92,
        historical_vulnerability=hist_v,
        active_damage_reports=report_severity
    )

    if req.custom_hazard_score is not None:
        new_score = req.custom_hazard_score
    else:
        new_score = max(88.0, pred["hazard_score"]) if req.set_blocked else pred["hazard_score"]

    new_status = CorridorStatus.BLOCKED.value if (req.set_blocked or new_score >= 80.0) else pred["status"]
    new_class = "BLOCKED" if new_status == "BLOCKED" else pred["hazard_classification"]

    # Update corridor in database
    DBManager.update_corridor_status(
        corridor_id=req.corridor_id,
        hazard_score=new_score,
        status=new_status,
        hazard_classification=new_class,
        breakdown=pred["breakdown"]
    )

    # Rebuild routing graph with new state
    corridors = DBManager.get_all_corridors()
    routing_engine.build_network_graph(corridors)

    # Broadcast Multilingual Alert
    loc_desc = req.location_desc or corr["name"]
    alert_text = multilingual_service.generate_multilingual_alert(
        corridor_name=corr["name"],
        location_name=loc_desc,
        damage_type=req.disruption_type,
        severity=AlertSeverity.CRITICAL if req.set_blocked else AlertSeverity.WARNING,
        action_key="divert_alternate"
    )

    alert_id = DBManager.insert_alert({
        "corridor_id": req.corridor_id,
        "corridor_name": corr["name"],
        "severity": AlertSeverity.CRITICAL.value if req.set_blocked else AlertSeverity.WARNING.value,
        "title": f"EMERGENCY: {req.disruption_type.value} on {corr['highway_code']}",
        "incident_type": req.disruption_type.value,
        "location_name": loc_desc,
        "translations": alert_text.model_dump(by_alias=True),
        "recommended_action": "Immediate diversion to alternative corridors recommended."
    })

    # Automatically check and reroute all active shipments traveling on this corridor
    shipments = DBManager.get_all_shipments()
    rerouted_list = []

    for s in shipments:
        assigned_route = s.get("assigned_route", {})
        segments = assigned_route.get("segments", [])
        uses_blocked_corridor = any(seg.get("corridor_id") == req.corridor_id for seg in segments)

        if uses_blocked_corridor or s.get("current_corridor_id") == req.corridor_id:
            cargo_type = CargoType(s["cargo_type"])
            routes = routing_engine.find_routes(
                origin=s["origin"],
                destination=s["destination"],
                cargo_type=cargo_type,
                avoid_corridors=[req.corridor_id]
            )

            if routes:
                new_opt = routes[0]
                alt_opts = routes[1:] if len(routes) > 1 else []
                new_eta = new_opt.total_time_mins
                delta = new_eta - s["initial_eta_mins"]

                DBManager.update_shipment_route(
                    shipment_id=s["id"],
                    assigned_route=new_opt.model_dump(),
                    alt_routes=[r.model_dump() for r in alt_opts],
                    new_eta=new_eta,
                    status=ShipmentStatus.REROUTED.value
                )

                rerouted_list.append({
                    "shipment_id": s["id"],
                    "tracking_code": s["tracking_code"],
                    "cargo_type": s["cargo_type"],
                    "new_eta_mins": new_eta,
                    "eta_delta_mins": delta,
                    "rerouted_path": [seg.name for seg in new_opt.segments]
                })

    created_alert = AlertResponse(
        id=alert_id,
        corridor_id=req.corridor_id,
        corridor_name=corr["name"],
        severity=AlertSeverity.CRITICAL if req.set_blocked else AlertSeverity.WARNING,
        title=f"EMERGENCY: {req.disruption_type.value} on {corr['highway_code']}",
        incident_type=req.disruption_type.value,
        location_name=loc_desc,
        timestamp=time.strftime("%Y-%m-%d %H:%M:%S"),
        active=True,
        translations=alert_text,
        recommended_action="Immediate diversion to alternative corridors recommended."
    )

    return SimulationResponse(
        success=True,
        message=f"Disruption successfully triggered on {corr['name']}. {len(rerouted_list)} shipments automatically rerouted.",
        affected_corridor_id=req.corridor_id,
        affected_corridor_name=corr["name"],
        new_corridor_status=CorridorStatus(new_status),
        new_hazard_score=new_score,
        affected_shipments_count=len(rerouted_list),
        rerouted_shipments=rerouted_list,
        broadcasted_alert=created_alert
    )


@app.post("/api/simulation/reset", response_model=SimulationResetResponse, tags=["Simulation"])
async def reset_simulation():
    """Resets all corridors, hazard scores, shipments, and alerts back to baseline state."""
    c_cnt, s_cnt = DBManager.reset_simulation()
    return SimulationResetResponse(
        success=True,
        message="Simulation environment reset. All corridors and baseline shipments restored to normal operation.",
        corridors_reset_count=c_cnt,
        shipments_reset_count=s_cnt
    )


# -------------------------------------------------------------
# 6. Field Incident Reports & Offline Sync Endpoints
# -------------------------------------------------------------

@app.get("/api/field-reports", response_model=List[FieldReportResponse], tags=["Field Reports"])
async def list_field_reports():
    """Retrieves all crowd-sourced & patrol scout field incident reports."""
    reports = DBManager.get_all_field_reports()
    return reports


@app.post("/api/field-reports", response_model=FieldReportResponse, status_code=status.HTTP_201_CREATED, tags=["Field Reports"])
async def submit_field_report(report: FieldReportCreate):
    """Submits a new on-ground road damage/hazard report (supports offline syncing)."""
    corr = DBManager.get_corridor_by_id(report.corridor_id)
    if not corr:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Corridor '{report.corridor_id}' does not exist."
        )

    saved = DBManager.insert_field_report(report.model_dump())
    saved["corridor_name"] = corr["name"]

    # Re-evaluate corridor hazard if report is severe (>= 6/10)
    if report.severity_1_to_10 >= 6 or not report.road_passable:
        pred = risk_engine.predict_risk(
            rainfall_48h=45.0,
            rain_intensity=4.0,
            slope_deg=corr["slope_deg"],
            soil_saturation=0.75,
            historical_vulnerability=corr["historical_vulnerability"],
            active_damage_reports=float(report.severity_1_to_10)
        )
        new_status = "BLOCKED" if not report.road_passable else pred["status"]
        DBManager.update_corridor_status(
            corridor_id=report.corridor_id,
            hazard_score=max(pred["hazard_score"], 75.0 if not report.road_passable else pred["hazard_score"]),
            status=new_status,
            hazard_classification=pred["hazard_classification"],
            breakdown=pred["breakdown"]
        )

    return saved


@app.post("/api/field-reports/batch-sync", tags=["Field Reports"])
async def batch_sync_field_reports(batch: FieldReportBatchSync):
    """Batch endpoint for field scouts uploading queued reports recorded offline in remote areas."""
    synced_reports = []
    for r in batch.reports:
        corr = DBManager.get_corridor_by_id(r.corridor_id)
        if corr:
            saved = DBManager.insert_field_report(r.model_dump())
            saved["corridor_name"] = corr["name"]
            synced_reports.append(saved)

    return {
        "status": "SUCCESS",
        "synced_count": len(synced_reports),
        "client_device_id": batch.client_device_id,
        "synced_reports": synced_reports
    }


# -------------------------------------------------------------
# 7. Multilingual Alerts Endpoints
# -------------------------------------------------------------

@app.get("/api/alerts", response_model=List[AlertResponse], tags=["Alerts"])
async def list_alerts(limit: int = Query(20, ge=1, le=100)):
    """Retrieves active emergency alerts with 6 regional language translations."""
    alerts = DBManager.get_all_alerts(limit=limit)
    return alerts


@app.post("/api/alerts/broadcast", response_model=AlertResponse, status_code=status.HTTP_201_CREATED, tags=["Alerts"])
async def broadcast_alert(req: BroadcastAlertRequest):
    """Dispatches a new localized multi-language emergency alert across the NER logistics network."""
    corr = DBManager.get_corridor_by_id(req.corridor_id)
    c_name = corr["name"] if corr else req.corridor_id

    trans = multilingual_service.generate_multilingual_alert(
        corridor_name=c_name,
        location_name=req.location_name,
        damage_type=req.damage_type,
        severity=req.severity,
        action_key="divert_alternate" if req.severity in [AlertSeverity.CRITICAL, AlertSeverity.WARNING] else "proceed_caution",
        custom_note=req.details
    )

    alt_id = DBManager.insert_alert({
        "corridor_id": req.corridor_id,
        "corridor_name": c_name,
        "severity": req.severity.value,
        "title": f"{req.severity.value}: {req.damage_type.value} at {req.location_name}",
        "incident_type": req.damage_type.value,
        "location_name": req.location_name,
        "translations": trans.model_dump(by_alias=True),
        "recommended_action": req.recommended_action or "Immediate diversion to alternative corridors recommended."
    })

    return AlertResponse(
        id=alt_id,
        corridor_id=req.corridor_id,
        corridor_name=c_name,
        severity=req.severity,
        title=f"{req.severity.value}: {req.damage_type.value} at {req.location_name}",
        incident_type=req.damage_type.value,
        location_name=req.location_name,
        timestamp=time.strftime("%Y-%m-%d %H:%M:%S"),
        active=True,
        translations=trans,
        recommended_action=req.recommended_action or "Immediate diversion to alternative corridors recommended."
    )
