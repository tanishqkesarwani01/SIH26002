"""
Database Management and Pre-seeding for Northeast India Logistics Resilience Platform.
Uses SQLite for zero-configuration, lightning-fast ACID persistence.
"""

import sqlite3
import json
import time
import uuid
import logging
from typing import Dict, List, Any, Optional
from services.data_fetcher import CORRIDOR_GEO_REGISTRY, NER_STATIONS
from services.ml_risk_engine import risk_engine
from services.routing_engine import routing_engine
from services.multilingual_service import multilingual_service
from models import CargoType, CorridorStatus, HazardLevel, ShipmentStatus, DamageType, SyncStatus, AlertSeverity

logger = logging.getLogger("ner_lrp.database")
DB_PATH = "ner_lrp.db"


def get_db_connection():
    """Create a connection with Row dictionary factory."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Create all required tables and populate seed data."""
    conn = get_db_connection()
    cursor = conn.cursor()

    # Corridors Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS corridors (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        highway_code TEXT NOT NULL,
        start_node TEXT NOT NULL,
        end_node TEXT NOT NULL,
        length_km REAL NOT NULL,
        normal_time_mins INTEGER NOT NULL,
        current_time_mins INTEGER NOT NULL,
        slope_deg REAL NOT NULL,
        elevation_min_m INTEGER NOT NULL,
        elevation_max_m INTEGER NOT NULL,
        historical_vulnerability REAL NOT NULL,
        historical_risk_level TEXT NOT NULL,
        current_hazard_score REAL NOT NULL,
        hazard_classification TEXT NOT NULL,
        status TEXT NOT NULL,
        geometry_json TEXT NOT NULL,
        weather_snapshot_json TEXT,
        risk_breakdown_json TEXT,
        gsi_hotspots_json TEXT,
        srtm_profile_json TEXT,
        active_incidents_count INTEGER DEFAULT 0
    )
    """)

    # Shipments Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS shipments (
        id TEXT PRIMARY KEY,
        tracking_code TEXT UNIQUE NOT NULL,
        cargo_type TEXT NOT NULL,
        cargo_name TEXT NOT NULL,
        origin TEXT NOT NULL,
        destination TEXT NOT NULL,
        current_lat REAL NOT NULL,
        current_lng REAL NOT NULL,
        current_corridor_id TEXT,
        initial_eta_mins INTEGER NOT NULL,
        current_eta_mins INTEGER NOT NULL,
        status TEXT NOT NULL,
        priority_level INTEGER NOT NULL,
        assigned_route_json TEXT NOT NULL,
        alternative_routes_json TEXT,
        last_updated TEXT NOT NULL
    )
    """)

    # Field Reports Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS field_reports (
        id TEXT PRIMARY KEY,
        report_code TEXT UNIQUE NOT NULL,
        reporter_name TEXT NOT NULL,
        reporter_role TEXT NOT NULL,
        corridor_id TEXT NOT NULL,
        location_name TEXT NOT NULL,
        lat REAL NOT NULL,
        lng REAL NOT NULL,
        damage_type TEXT NOT NULL,
        severity_1_to_10 INTEGER NOT NULL,
        description TEXT NOT NULL,
        road_passable INTEGER NOT NULL,
        estimated_clearance_hours REAL,
        photo_data_base64 TEXT,
        timestamp TEXT NOT NULL,
        sync_status TEXT NOT NULL,
        verified INTEGER DEFAULT 0
    )
    """)

    # Alerts Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS alerts (
        id TEXT PRIMARY KEY,
        corridor_id TEXT,
        corridor_name TEXT,
        severity TEXT NOT NULL,
        title TEXT NOT NULL,
        incident_type TEXT NOT NULL,
        location_name TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        active INTEGER DEFAULT 1,
        translations_json TEXT NOT NULL,
        recommended_action TEXT NOT NULL
    )
    """)

    conn.commit()

    # Check if corridors already populated
    cursor.execute("SELECT COUNT(*) as cnt FROM corridors")
    count = cursor.fetchone()["cnt"]
    if count == 0:
        logger.info("Seeding corridors and initial dataset into SQLite...")
        seed_corridors_and_data(conn)

    conn.close()


def seed_corridors_and_data(conn):
    """Seed initial high-fidelity real Northeast India road corridors."""
    cursor = conn.cursor()
    corridors_list = []

    for cid, cdata in CORRIDOR_GEO_REGISTRY.items():
        # Evaluate initial baseline hazard score using ML Risk Engine
        hist_v = cdata.get("historical_vulnerability", 0.5)
        slope = cdata.get("slope_deg", 15.0)

        # Baseline weather estimation for corridor
        r48 = 42.0 if hist_v > 0.8 else 18.0
        rint = 3.5 if hist_v > 0.8 else 0.5
        soil = 0.65 if hist_v > 0.8 else 0.35

        pred = risk_engine.predict_risk(
            rainfall_48h=r48,
            rain_intensity=rint,
            slope_deg=slope,
            soil_saturation=soil,
            historical_vulnerability=hist_v,
            active_damage_reports=0.0
        )

        weather_snapshot = {
            "rainfall_48h_mm": r48,
            "rain_intensity_mmh": rint,
            "soil_moisture": soil,
            "weather_condition": "Overcast / Scattered Monsoon Showers"
        }

        corridor_dict = {
            "id": cid,
            "name": cdata["name"],
            "highway_code": cdata["highway_code"],
            "start_node": cdata["start_node"],
            "end_node": cdata["end_node"],
            "length_km": cdata["length_km"],
            "normal_time_mins": cdata["normal_time_mins"],
            "current_time_mins": cdata["normal_time_mins"],
            "slope_deg": cdata["slope_deg"],
            "elevation_min_m": cdata["elevation_min_m"],
            "elevation_max_m": cdata["elevation_max_m"],
            "historical_vulnerability": cdata["historical_vulnerability"],
            "historical_risk_level": cdata["historical_risk_level"],
            "current_hazard_score": pred["hazard_score"],
            "hazard_classification": pred["hazard_classification"],
            "status": pred["status"],
            "geometry": {"type": "LineString", "coordinates": cdata["geometry"]}
        }
        corridors_list.append(corridor_dict)

        cursor.execute("""
        INSERT INTO corridors (
            id, name, highway_code, start_node, end_node, length_km,
            normal_time_mins, current_time_mins, slope_deg, elevation_min_m,
            elevation_max_m, historical_vulnerability, historical_risk_level,
            current_hazard_score, hazard_classification, status,
            geometry_json, weather_snapshot_json, risk_breakdown_json,
            gsi_hotspots_json, srtm_profile_json, active_incidents_count
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            cid,
            cdata["name"],
            cdata["highway_code"],
            cdata["start_node"],
            cdata["end_node"],
            cdata["length_km"],
            cdata["normal_time_mins"],
            cdata["normal_time_mins"],
            cdata["slope_deg"],
            cdata["elevation_min_m"],
            cdata["elevation_max_m"],
            cdata["historical_vulnerability"],
            cdata["historical_risk_level"],
            pred["hazard_score"],
            pred["hazard_classification"],
            pred["status"],
            json.dumps({"type": "LineString", "coordinates": cdata["geometry"]}),
            json.dumps(weather_snapshot),
            json.dumps(pred["breakdown"]),
            json.dumps(cdata.get("gsi_hazard_hotspots", [])),
            json.dumps(cdata.get("srtm_profile", [])),
            0
        ))

    conn.commit()

    # Build routing graph
    routing_engine.build_network_graph(corridors_list)

    # Seed Active Shipments
    seed_shipments(cursor)

    # Seed Initial Field Reports
    seed_field_reports(cursor)

    # Seed Initial Alerts
    seed_alerts(cursor)

    conn.commit()


def seed_shipments(cursor):
    """Seed real-world active logistics shipments with routes across NER."""
    now_str = time.strftime("%Y-%m-%d %H:%M:%S")

    shipments_seed = [
        {
            "id": "SHIP-001",
            "tracking_code": "NER-MED-8910",
            "cargo_type": CargoType.CRITICAL_MEDICAL,
            "cargo_name": "Emergency Anti-Venom & Pediatric Vaccines",
            "origin": "Guwahati",
            "destination": "Silchar",
            "current_lat": 25.5788,
            "current_lng": 91.8933,
            "current_corridor_id": "CORR-NH06-GHY-SHL",
            "priority_level": 1
        },
        {
            "id": "SHIP-002",
            "tracking_code": "NER-REL-4402",
            "cargo_type": CargoType.RELIEF_SUPPLIES,
            "cargo_name": "NDRF High-Calorie Rations & Water Purification Kits",
            "origin": "Guwahati",
            "destination": "Aizawl",
            "current_lat": 25.4516,
            "current_lng": 92.2033,
            "current_corridor_id": "CORR-NH06-SHL-JOW",
            "priority_level": 2
        },
        {
            "id": "SHIP-003",
            "tracking_code": "NER-COM-1109",
            "cargo_type": CargoType.COMMERCIAL_BULK,
            "cargo_name": "Structural Steel & Hydroelectric Turbine Parts",
            "origin": "Siliguri",
            "destination": "Gangtok",
            "current_lat": 26.8910,
            "current_lng": 88.4720,
            "current_corridor_id": "CORR-NH10-SLG-GTK",
            "priority_level": 3
        },
        {
            "id": "SHIP-004",
            "tracking_code": "NER-MED-3341",
            "cargo_type": CargoType.CRITICAL_MEDICAL,
            "cargo_name": "Cryogenic Oxygen Cylinders & Surgical Equipment",
            "origin": "Dimapur",
            "destination": "Imphal",
            "current_lat": 25.7400,
            "current_lng": 93.9800,
            "current_corridor_id": "CORR-NH29-DMP-KOH",
            "priority_level": 1
        },
        {
            "id": "SHIP-005",
            "tracking_code": "NER-COM-7822",
            "cargo_type": CargoType.COMMERCIAL_BULK,
            "cargo_name": "Assam Organic Tea Consignment & Petroleum Barrels",
            "origin": "Guwahati",
            "destination": "Jorhat",
            "current_lat": 26.3400,
            "current_lng": 92.6800,
            "current_corridor_id": "CORR-NH715-GHY-JOR",
            "priority_level": 3
        }
    ]

    for s in shipments_seed:
        routes = routing_engine.find_routes(s["origin"], s["destination"], s["cargo_type"])
        assigned_route = routes[0] if routes else None
        alt_routes = routes[1:] if len(routes) > 1 else []

        init_eta = assigned_route.total_time_mins if assigned_route else 300
        assigned_json = assigned_route.model_dump_json() if assigned_route else "{}"
        alt_json = json.dumps([r.model_dump() for r in alt_routes])

        cursor.execute("""
        INSERT INTO shipments (
            id, tracking_code, cargo_type, cargo_name, origin, destination,
            current_lat, current_lng, current_corridor_id, initial_eta_mins,
            current_eta_mins, status, priority_level, assigned_route_json,
            alternative_routes_json, last_updated
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            s["id"],
            s["tracking_code"],
            s["cargo_type"].value,
            s["cargo_name"],
            s["origin"],
            s["destination"],
            s["current_lat"],
            s["current_lng"],
            s["current_corridor_id"],
            init_eta,
            init_eta,
            ShipmentStatus.IN_TRANSIT.value,
            s["priority_level"],
            assigned_json,
            alt_json,
            now_str
        ))


def seed_field_reports(cursor):
    """Seed initial scouting field reports."""
    now_str = time.strftime("%Y-%m-%d %H:%M:%S")

    reports = [
        (
            "REP-001",
            "RPT-MEG-01",
            "Inspector L. Sangma",
            "BRO_PATROL",
            "CORR-NH06-JOW-SIL",
            "Sonapur Tunnel South Portal",
            25.1200,
            92.3800,
            DamageType.MUDSLIP.value,
            6,
            "Moderate slush and silt deposition on highway right-flank. Single lane movement active.",
            1,
            3.5,
            now_str,
            SyncStatus.SYNCED.value,
            1
        ),
        (
            "REP-002",
            "RPT-NAG-02",
            "Driver Kevichusa",
            "COMMERCIAL_DRIVER",
            "CORR-NH29-DMP-KOH",
            "Chumukedima Old Bridge Section",
            25.8100,
            93.8200,
            DamageType.ROCKFALL.value,
            5,
            "Small gravel and boulder falls near hairpin bend 4. Heavy vehicles advised caution.",
            1,
            2.0,
            now_str,
            SyncStatus.SYNCED.value,
            1
        )
    ]

    for r in reports:
        cursor.execute("""
        INSERT INTO field_reports (
            id, report_code, reporter_name, reporter_role, corridor_id,
            location_name, lat, lng, damage_type, severity_1_to_10,
            description, road_passable, estimated_clearance_hours,
            timestamp, sync_status, verified
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, r)


def seed_alerts(cursor):
    """Seed initial multilingual alert."""
    now_str = time.strftime("%Y-%m-%d %H:%M:%S")
    trans = multilingual_service.generate_multilingual_alert(
        corridor_name="NH-6 (Jowai to Silchar)",
        location_name="Sonapur Tunnel",
        damage_type=DamageType.MUDSLIP,
        severity=AlertSeverity.WATCH,
        action_key="proceed_caution",
        custom_note="Clearance teams on site."
    )

    cursor.execute("""
    INSERT INTO alerts (
        id, corridor_id, corridor_name, severity, title, incident_type,
        location_name, timestamp, active, translations_json, recommended_action
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        "ALT-001",
        "CORR-NH06-JOW-SIL",
        "Jowai to Silchar (NH-6 Meghalaya-Barak Lifeline)",
        AlertSeverity.WATCH.value,
        "Mudslip Alert at Sonapur Tunnel",
        DamageType.MUDSLIP.value,
        "Sonapur Tunnel",
        now_str,
        1,
        json.dumps(trans.model_dump(by_alias=True)),
        "Proceed at minimal speed with extreme caution. Expect heavy delays."
    ))


# Refresh DB helper functions for CRUD
class DBManager:
    """Convenience CRUD queries for platform models."""

    @staticmethod
    def get_all_corridors() -> List[Dict[str, Any]]:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM corridors")
        rows = cursor.fetchall()
        result = []
        for r in rows:
            d = dict(r)
            d["geometry"] = json.loads(d["geometry_json"])
            d["elevation_range_m"] = [d["elevation_min_m"], d["elevation_max_m"]]
            d["weather_summary"] = json.loads(d["weather_snapshot_json"]) if d["weather_snapshot_json"] else None
            d["risk_breakdown"] = json.loads(d["risk_breakdown_json"]) if d["risk_breakdown_json"] else None
            d["gsi_hazard_hotspots"] = json.loads(d["gsi_hotspots_json"]) if d["gsi_hotspots_json"] else []
            d["srtm_elevation_profile"] = json.loads(d["srtm_profile_json"]) if d["srtm_profile_json"] else []
            result.append(d)
        conn.close()
        return result

    @staticmethod
    def get_corridor_by_id(corridor_id: str) -> Optional[Dict[str, Any]]:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM corridors WHERE id = ?", (corridor_id,))
        row = cursor.fetchone()
        if not row:
            conn.close()
            return None
        d = dict(row)
        d["geometry"] = json.loads(d["geometry_json"])
        d["elevation_range_m"] = [d["elevation_min_m"], d["elevation_max_m"]]
        d["weather_summary"] = json.loads(d["weather_snapshot_json"]) if d["weather_snapshot_json"] else None
        d["risk_breakdown"] = json.loads(d["risk_breakdown_json"]) if d["risk_breakdown_json"] else None
        d["gsi_hazard_hotspots"] = json.loads(d["gsi_hotspots_json"]) if d["gsi_hotspots_json"] else []
        d["srtm_elevation_profile"] = json.loads(d["srtm_profile_json"]) if d["srtm_profile_json"] else []

        # Fetch recent field reports for this corridor
        cursor.execute("SELECT * FROM field_reports WHERE corridor_id = ? ORDER BY timestamp DESC LIMIT 5", (corridor_id,))
        rep_rows = cursor.fetchall()
        d["recent_field_reports"] = [dict(rep) for rep in rep_rows]

        conn.close()
        return d

    @staticmethod
    def update_corridor_status(corridor_id: str, hazard_score: float, status: str, hazard_classification: str, breakdown: Dict[str, Any]):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
        UPDATE corridors
        SET current_hazard_score = ?,
            status = ?,
            hazard_classification = ?,
            risk_breakdown_json = ?
        WHERE id = ?
        """, (hazard_score, status, hazard_classification, json.dumps(breakdown), corridor_id))
        conn.commit()
        conn.close()

    @staticmethod
    def get_all_shipments() -> List[Dict[str, Any]]:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM shipments")
        rows = cursor.fetchall()
        result = []
        for r in rows:
            d = dict(r)
            d["assigned_route"] = json.loads(d["assigned_route_json"]) if d["assigned_route_json"] else {}
            d["alternative_routes"] = json.loads(d["alternative_routes_json"]) if d["alternative_routes_json"] else []
            d["eta_delta_mins"] = d["current_eta_mins"] - d["initial_eta_mins"]
            d["requires_reroute"] = (d["status"] == ShipmentStatus.REROUTED.value or d["eta_delta_mins"] > 45)
            result.append(d)
        conn.close()
        return result

    @staticmethod
    def get_shipment_by_id(shipment_id: str) -> Optional[Dict[str, Any]]:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM shipments WHERE id = ? OR tracking_code = ?", (shipment_id, shipment_id))
        row = cursor.fetchone()
        if not row:
            conn.close()
            return None
        d = dict(row)
        d["assigned_route"] = json.loads(d["assigned_route_json"]) if d["assigned_route_json"] else {}
        d["alternative_routes"] = json.loads(d["alternative_routes_json"]) if d["alternative_routes_json"] else []
        d["eta_delta_mins"] = d["current_eta_mins"] - d["initial_eta_mins"]
        d["requires_reroute"] = (d["status"] == ShipmentStatus.REROUTED.value or d["eta_delta_mins"] > 45)
        conn.close()
        return d

    @staticmethod
    def update_shipment_route(shipment_id: str, assigned_route: Dict[str, Any], alt_routes: List[Dict[str, Any]], new_eta: int, status: str):
        conn = get_db_connection()
        cursor = conn.cursor()
        now_str = time.strftime("%Y-%m-%d %H:%M:%S")
        cursor.execute("""
        UPDATE shipments
        SET assigned_route_json = ?,
            alternative_routes_json = ?,
            current_eta_mins = ?,
            status = ?,
            last_updated = ?
        WHERE id = ? OR tracking_code = ?
        """, (
            json.dumps(assigned_route),
            json.dumps(alt_routes),
            new_eta,
            status,
            now_str,
            shipment_id,
            shipment_id
        ))
        conn.commit()
        conn.close()

    @staticmethod
    def insert_field_report(report_data: Dict[str, Any]) -> Dict[str, Any]:
        conn = get_db_connection()
        cursor = conn.cursor()
        rep_id = f"REP-{uuid.uuid4().hex[:8].upper()}"
        rep_code = report_data.get("report_code") or f"RPT-FLD-{uuid.uuid4().hex[:6].upper()}"
        now_str = report_data.get("offline_created_at") or time.strftime("%Y-%m-%d %H:%M:%S")

        cursor.execute("""
        INSERT INTO field_reports (
            id, report_code, reporter_name, reporter_role, corridor_id,
            location_name, lat, lng, damage_type, severity_1_to_10,
            description, road_passable, estimated_clearance_hours,
            photo_data_base64, timestamp, sync_status, verified
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            rep_id,
            rep_code,
            report_data["reporter_name"],
            report_data.get("reporter_role", "SCOUT"),
            report_data["corridor_id"],
            report_data["location_name"],
            report_data["lat"],
            report_data["lng"],
            report_data["damage_type"],
            report_data["severity_1_to_10"],
            report_data["description"],
            1 if report_data.get("road_passable", False) else 0,
            report_data.get("estimated_clearance_hours"),
            report_data.get("photo_data_base64"),
            now_str,
            SyncStatus.SYNCED.value,
            1 if report_data.get("severity_1_to_10", 5) < 7 else 0
        ))

        # Update corridor incident count
        cursor.execute("UPDATE corridors SET active_incidents_count = active_incidents_count + 1 WHERE id = ?", (report_data["corridor_id"],))
        conn.commit()
        conn.close()

        report_data["id"] = rep_id
        report_data["report_code"] = rep_code
        report_data["timestamp"] = now_str
        report_data["sync_status"] = SyncStatus.SYNCED
        report_data["verified"] = True
        return report_data

    @staticmethod
    def get_all_field_reports() -> List[Dict[str, Any]]:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
        SELECT fr.*, c.name as corridor_name
        FROM field_reports fr
        LEFT JOIN corridors c ON fr.corridor_id = c.id
        ORDER BY fr.timestamp DESC
        """)
        rows = cursor.fetchall()
        result = []
        for r in rows:
            d = dict(r)
            d["road_passable"] = bool(d["road_passable"])
            d["verified"] = bool(d["verified"])
            if not d.get("corridor_name"):
                d["corridor_name"] = d["corridor_id"]
            result.append(d)
        conn.close()
        return result

    @staticmethod
    def insert_alert(alert_data: Dict[str, Any]) -> str:
        conn = get_db_connection()
        cursor = conn.cursor()
        alt_id = f"ALT-{uuid.uuid4().hex[:8].upper()}"
        now_str = time.strftime("%Y-%m-%d %H:%M:%S")

        cursor.execute("""
        INSERT INTO alerts (
            id, corridor_id, corridor_name, severity, title,
            incident_type, location_name, timestamp, active,
            translations_json, recommended_action
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            alt_id,
            alert_data.get("corridor_id"),
            alert_data.get("corridor_name"),
            alert_data["severity"],
            alert_data["title"],
            alert_data["incident_type"],
            alert_data["location_name"],
            now_str,
            1,
            json.dumps(alert_data["translations"]),
            alert_data["recommended_action"]
        ))
        conn.commit()
        conn.close()
        return alt_id

    @staticmethod
    def get_all_alerts(limit: int = 20) -> List[Dict[str, Any]]:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM alerts ORDER BY timestamp DESC LIMIT ?", (limit,))
        rows = cursor.fetchall()
        result = []
        for r in rows:
            d = dict(r)
            d["translations"] = json.loads(d["translations_json"]) if d["translations_json"] else {}
            d["active"] = bool(d["active"])
            result.append(d)
        conn.close()
        return result

    @staticmethod
    def reset_simulation() -> Tuple[int, int]:
        """Reset all corridors and shipments back to clean baseline state."""
        conn = get_db_connection()
        cursor = conn.cursor()

        # Delete database and re-seed
        cursor.execute("DELETE FROM corridors")
        cursor.execute("DELETE FROM shipments")
        cursor.execute("DELETE FROM alerts")
        cursor.execute("DELETE FROM field_reports")
        conn.commit()

        seed_corridors_and_data(conn)

        cursor.execute("SELECT COUNT(*) as c_cnt FROM corridors")
        c_cnt = cursor.fetchone()["c_cnt"]
        cursor.execute("SELECT COUNT(*) as s_cnt FROM shipments")
        s_cnt = cursor.fetchone()["s_cnt"]

        conn.close()
        return c_cnt, s_cnt
