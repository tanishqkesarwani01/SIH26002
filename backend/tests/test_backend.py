"""
Comprehensive Test Suite for Northeast India Logistics Resilience Platform (NER-LRP).
Covers Weather Ingestion, ML Hazard Prediction, Cargo-Criticality Routing,
Disruption Simulation, Multilingual Translation, and FastAPI Endpoints.
"""

import os
import asyncio
import pytest
from fastapi.testclient import TestClient

from main import app
from database import init_db, DBManager
from services.data_fetcher import DataFetcherService, NER_STATIONS, CORRIDOR_GEO_REGISTRY
from services.ml_risk_engine import risk_engine
from services.routing_engine import routing_engine
from services.multilingual_service import multilingual_service
from models import CargoType, AlertSeverity, DamageType


@pytest.fixture(scope="session", autouse=True)
def setup_database():
    """Ensure clean database initialization for test session."""
    init_db()
    corridors = DBManager.get_all_corridors()
    routing_engine.build_network_graph(corridors)
    yield


@pytest.fixture
def client():
    """FastAPI TestClient instance."""
    with TestClient(app) as test_client:
        yield test_client


# -------------------------------------------------------------
# 1. Weather Data Ingestion Tests
# -------------------------------------------------------------

def test_weather_fetcher_single_station():
    """Verify live/fallback weather query for Guwahati."""
    weather = asyncio.run(DataFetcherService.fetch_station_weather_async("Guwahati"))
    assert weather is not None
    assert weather["station_name"] == "Guwahati"
    assert weather["latitude"] == 26.1445
    assert weather["longitude"] == 91.7362
    assert "rainfall_48h_mm" in weather
    assert weather["rainfall_48h_mm"] >= 0.0
    assert "soil_moisture" in weather
    assert 0.0 <= weather["soil_moisture"] <= 1.0


def test_weather_fetcher_all_stations():
    """Verify weather fetching for all 13+ NER key stations."""
    all_weather = asyncio.run(DataFetcherService.fetch_all_stations_weather())
    assert len(all_weather) >= len(NER_STATIONS)
    station_names = [w["station_name"] for w in all_weather]
    assert "Guwahati" in station_names
    assert "Shillong" in station_names
    assert "Silchar" in station_names
    assert "Aizawl" in station_names
    assert "Kohima" in station_names
    assert "Imphal" in station_names
    assert "Gangtok" in station_names
    assert "Itanagar" in station_names
    assert "Siliguri" in station_names


def test_corridor_geo_registry_and_srtm():
    """Verify SRTM slope and GSI disaster profiles are correctly registered."""
    nh10 = CORRIDOR_GEO_REGISTRY.get("CORR-NH10-SLG-GTK")
    assert nh10 is not None
    assert nh10["slope_deg"] > 35.0
    assert len(nh10["gsi_hazard_hotspots"]) >= 2
    assert len(nh10["srtm_profile"]) >= 4

    nh6 = CORRIDOR_GEO_REGISTRY.get("CORR-NH06-JOW-SIL")
    assert nh6 is not None
    assert nh6["historical_vulnerability"] > 0.9
    assert any("Sonapur" in h["name"] for h in nh6["gsi_hazard_hotspots"])


# -------------------------------------------------------------
# 2. Machine Learning Hazard & Risk Engine Tests
# -------------------------------------------------------------

def test_ml_risk_engine_trained():
    """Verify ML model is trained and has required feature names."""
    assert risk_engine.is_trained is True
    assert len(risk_engine.FEATURE_NAMES) == 6


def test_ml_risk_prediction_safe_conditions():
    """Under dry weather and gentle slope, score must be LOW / SAFE."""
    res = risk_engine.predict_risk(
        rainfall_48h=5.0,
        rain_intensity=0.0,
        slope_deg=8.0,
        soil_saturation=0.25,
        historical_vulnerability=0.2,
        active_damage_reports=0.0
    )
    assert 0.0 <= res["hazard_score"] <= 40.0
    assert res["hazard_classification"] in ["SAFE", "WATCH"]
    assert res["status"] in ["OPEN", "WATCH"]
    assert "breakdown" in res
    assert "rainfall_48h_contrib" in res["breakdown"]


def test_ml_risk_prediction_extreme_landslide_conditions():
    """Under heavy monsoon downpour, steep slope and high vulnerability, score must be HIGH / BLOCKED."""
    res = risk_engine.predict_risk(
        rainfall_48h=165.0,
        rain_intensity=28.0,
        slope_deg=42.0,
        soil_saturation=0.95,
        historical_vulnerability=0.95,
        active_damage_reports=8.0
    )
    assert res["hazard_score"] >= 75.0
    assert res["hazard_classification"] in ["WARNING", "BLOCKED"]
    assert res["status"] in ["WARNING", "BLOCKED"]
    assert "Steep Himalayan slope" in res["breakdown"]["explanation_text"]


def test_ml_risk_explainability_breakdown():
    """Verify explainability contributions sum approximately to 100%."""
    res = risk_engine.predict_risk(
        rainfall_48h=70.0,
        rain_intensity=12.0,
        slope_deg=35.0,
        soil_saturation=0.8,
        historical_vulnerability=0.85,
        active_damage_reports=2.0
    )
    b = res["breakdown"]
    total_contrib = (
        b["rainfall_48h_contrib"] +
        b["rain_intensity_contrib"] +
        b["slope_angle_contrib"] +
        b["soil_saturation_contrib"] +
        b["historical_vulnerability_contrib"] +
        b["active_reports_contrib"]
    )
    assert 98.0 <= total_contrib <= 102.0
    assert len(b["primary_driver"]) > 0


# -------------------------------------------------------------
# 3. Cargo-Criticality Routing Engine Tests
# -------------------------------------------------------------

def test_routing_engine_pathfinding():
    """Verify route computation between Guwahati and Silchar."""
    routes = routing_engine.find_routes(
        origin="Guwahati",
        destination="Silchar",
        cargo_type=CargoType.COMMERCIAL_BULK
    )
    assert len(routes) > 0
    primary = routes[0]
    assert primary.total_distance_km > 0
    assert primary.total_time_mins > 0
    assert len(primary.segments) >= 2


def test_cargo_criticality_routing_differentiation():
    """Verify medical cargo incurs higher safety penalties and routes with higher safety score."""
    # Find routes for Critical Medical vs Commercial Bulk
    med_routes = routing_engine.find_routes("Guwahati", "Silchar", CargoType.CRITICAL_MEDICAL)
    com_routes = routing_engine.find_routes("Guwahati", "Silchar", CargoType.COMMERCIAL_BULK)

    assert len(med_routes) > 0
    assert len(com_routes) > 0
    assert med_routes[0].cargo_type == CargoType.CRITICAL_MEDICAL
    assert com_routes[0].cargo_type == CargoType.COMMERCIAL_BULK


def test_routing_engine_avoid_corridor():
    """When a direct corridor is avoided, alternative path must be found."""
    # Avoid direct Jowai -> Silchar lifeline
    alt_routes = routing_engine.find_routes(
        origin="Guwahati",
        destination="Silchar",
        cargo_type=CargoType.RELIEF_SUPPLIES,
        avoid_corridors=["CORR-NH06-JOW-SIL"]
    )
    assert len(alt_routes) > 0
    # Confirm avoided corridor is not in primary route segments
    segment_ids = [s.corridor_id for s in alt_routes[0].segments]
    assert "CORR-NH06-JOW-SIL" not in segment_ids


# -------------------------------------------------------------
# 4. Multilingual Translation Service Tests
# -------------------------------------------------------------

def test_multilingual_alert_generation():
    """Verify alert generated in all 6 regional languages with proper script characters."""
    alert_text = multilingual_service.generate_multilingual_alert(
        corridor_name="NH-6 Jowai-Silchar",
        location_name="Sonapur Tunnel",
        damage_type=DamageType.LANDSLIDE,
        severity=AlertSeverity.CRITICAL,
        action_key="divert_alternate"
    )
    assert "CRITICAL" in alert_text.en
    assert "भूस्खलन" in alert_text.hi  # Hindi
    assert "ভূমিস্খলন" in alert_text.as_  # Assamese
    assert "Leimin" in alert_text.mz  # Mizo
    assert "লান্দস্লাইদ" in alert_text.mn  # Manipuri
    assert "ভূমিধস" in alert_text.bn  # Bengali


# -------------------------------------------------------------
# 5. FastAPI REST API Endpoint Tests
# -------------------------------------------------------------

def test_api_health_endpoint(client):
    """GET /api/health returns 200 and healthy status."""
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "HEALTHY"
    assert data["ml_risk_engine"]["is_trained"] is True
    assert data["database"]["active_corridors_count"] >= 10


def test_api_weather_live_endpoint(client):
    """GET /api/weather/live returns live stations with weather data."""
    res = client.get("/api/weather/live")
    assert res.status_code == 200
    data = res.json()
    assert data["total_stations"] >= len(NER_STATIONS)
    assert len(data["stations"]) > 0


def test_api_corridors_list_endpoint(client):
    """GET /api/corridors returns list of highway corridors."""
    res = client.get("/api/corridors")
    assert res.status_code == 200
    corridors = res.json()
    assert len(corridors) >= 10
    c0 = corridors[0]
    assert "id" in c0
    assert "current_hazard_score" in c0
    assert "geometry" in c0
    assert c0["geometry"]["type"] == "LineString"


def test_api_corridor_detail_endpoint(client):
    """GET /api/corridors/{id} returns details including SRTM elevation profile and GSI hotspots."""
    res = client.get("/api/corridors/CORR-NH06-JOW-SIL")
    assert res.status_code == 200
    detail = res.json()
    assert detail["id"] == "CORR-NH06-JOW-SIL"
    assert len(detail["gsi_hazard_hotspots"]) > 0
    assert len(detail["srtm_elevation_profile"]) > 0


def test_api_corridor_not_found(client):
    """GET /api/corridors/INVALID-ID returns 404."""
    res = client.get("/api/corridors/CORR-NON-EXISTENT")
    assert res.status_code == 404


def test_api_shipments_list_and_details(client):
    """GET /api/shipments and GET /api/shipments/{id}."""
    res = client.get("/api/shipments")
    assert res.status_code == 200
    shipments = res.json()
    assert len(shipments) >= 4
    
    first_id = shipments[0]["id"]
    res_single = client.get(f"/api/shipments/{first_id}")
    assert res_single.status_code == 200
    assert res_single.json()["id"] == first_id


def test_api_shipment_reroute_endpoint(client):
    """POST /api/shipments/reroute calculates route with custom options."""
    res = client.post("/api/shipments/reroute", json={
        "shipment_id": "SHIP-001",
        "cargo_type": "CRITICAL_MEDICAL",
        "avoid_corridor_ids": ["CORR-NH06-SHL-JOW"]
    })
    assert res.status_code == 200
    data = res.json()
    assert data["shipment_id"] == "SHIP-001"
    assert data["reroute_triggered"] is True
    assert "new_route" in data
    assert data["new_route"]["total_time_mins"] > 0


def test_api_field_reports_crud_and_batch_sync(client):
    """POST /api/field-reports and POST /api/field-reports/batch-sync."""
    # Single report submission
    res = client.post("/api/field-reports", json={
        "reporter_name": "Scout B. Debbarma",
        "reporter_role": "FIELD_SCOUT",
        "corridor_id": "CORR-NH08-SIL-AGT",
        "location_name": "Longtharai Valley Km 180",
        "lat": 24.0000,
        "lng": 91.9500,
        "damage_type": "MUDSLIP",
        "severity_1_to_10": 7,
        "description": "Mudslip across both lanes following heavy overnight rain.",
        "road_passable": False,
        "estimated_clearance_hours": 6.0
    })
    assert res.status_code == 201
    created = res.json()
    assert created["corridor_id"] == "CORR-NH08-SIL-AGT"
    assert created["sync_status"] == "SYNCED"

    # Batch offline sync
    res_batch = client.post("/api/field-reports/batch-sync", json={
        "client_device_id": "TAB-SCOUT-NER-99",
        "reports": [
            {
                "reporter_name": "Driver T. Ao",
                "reporter_role": "DRIVER",
                "corridor_id": "CORR-NH29-DMP-KOH",
                "location_name": "Dzüdza Bridge",
                "lat": 25.7400,
                "lng": 93.9800,
                "damage_type": "ROCKFALL",
                "severity_1_to_10": 4,
                "description": "Small pebbles on pavement edge.",
                "road_passable": True,
                "offline_created_at": "2026-08-30 14:00:00"
            }
        ]
    })
    assert res_batch.status_code == 200
    assert res_batch.json()["synced_count"] == 1


def test_api_alerts_and_broadcast(client):
    """GET /api/alerts and POST /api/alerts/broadcast."""
    # List alerts
    res_list = client.get("/api/alerts")
    assert res_list.status_code == 200
    assert len(res_list.json()) >= 1

    # Broadcast new alert
    res_bc = client.post("/api/alerts/broadcast", json={
        "corridor_id": "CORR-NH10-SLG-GTK",
        "severity": "CRITICAL",
        "damage_type": "LANDSLIDE",
        "location_name": "29th Mile Teesta Gorge",
        "details": "Major hill collapse blocking both carriage lanes.",
        "recommended_action": "Divert via Lava-Kalimpong alternate route."
    })
    assert res_bc.status_code == 201
    alert = res_bc.json()
    assert alert["severity"] == "CRITICAL"
    assert "translations" in alert
    assert "en" in alert["translations"]
    assert "hi" in alert["translations"]
    assert "as" in alert["translations"]
    assert "mz" in alert["translations"]
    assert "mn" in alert["translations"]
    assert "bn" in alert["translations"]


def test_api_simulation_trigger_and_reset(client):
    """POST /api/simulation/trigger blocks corridor, reroutes shipments, then POST /api/simulation/reset restores."""
    # Trigger landslide simulation on Jowai-Silchar lifeline
    res_trig = client.post("/api/simulation/trigger", json={
        "corridor_id": "CORR-NH06-JOW-SIL",
        "disruption_type": "LANDSLIDE",
        "severity": 9,
        "set_blocked": True,
        "rainfall_surge_mm": 95.0,
        "location_desc": "Sonapur Tunnel North Portal"
    })
    assert res_trig.status_code == 200
    sim_data = res_trig.json()
    assert sim_data["success"] is True
    assert sim_data["new_corridor_status"] == "BLOCKED"
    assert sim_data["new_hazard_score"] >= 80.0
    assert sim_data["affected_shipments_count"] >= 1
    assert sim_data["broadcasted_alert"] is not None

    # Verify corridor status in DB is now BLOCKED
    res_corr = client.get("/api/corridors/CORR-NH06-JOW-SIL")
    assert res_corr.json()["status"] == "BLOCKED"

    # Reset simulation
    res_reset = client.post("/api/simulation/reset")
    assert res_reset.status_code == 200
    reset_data = res_reset.json()
    assert reset_data["success"] is True
    assert reset_data["corridors_reset_count"] >= 10
