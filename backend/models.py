"""
Data Models and Pydantic Schemas for Northeast India Logistics Resilience Platform (NER-LRP).
"""

from enum import Enum
from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field, ConfigDict


class CargoType(str, Enum):
    CRITICAL_MEDICAL = "CRITICAL_MEDICAL"
    RELIEF_SUPPLIES = "RELIEF_SUPPLIES"
    COMMERCIAL_BULK = "COMMERCIAL_BULK"


class CorridorStatus(str, Enum):
    OPEN = "OPEN"
    WATCH = "WATCH"
    WARNING = "WARNING"
    BLOCKED = "BLOCKED"


class ShipmentStatus(str, Enum):
    IN_TRANSIT = "IN_TRANSIT"
    REROUTED = "REROUTED"
    ARRIVED = "ARRIVED"
    DELAYED = "DELAYED"


class HazardLevel(str, Enum):
    SAFE = "SAFE"
    WATCH = "WATCH"
    WARNING = "WARNING"
    BLOCKED = "BLOCKED"


class DamageType(str, Enum):
    LANDSLIDE = "LANDSLIDE"
    FLASH_FLOOD = "FLASH_FLOOD"
    MUDSLIP = "MUDSLIP"
    ROAD_BREACH = "ROAD_BREACH"
    ROCKFALL = "ROCKFALL"
    SUBSIDENCE = "SUBSIDENCE"
    BRIDGE_DAMAGE = "BRIDGE_DAMAGE"
    WATERLOGGING = "WATERLOGGING"


class SyncStatus(str, Enum):
    SYNCED = "SYNCED"
    PENDING_VERIFICATION = "PENDING_VERIFICATION"


# -------------------------------------------------------------
# Weather Models
# -------------------------------------------------------------

class WeatherData(BaseModel):
    station_name: str
    latitude: float
    longitude: float
    elevation_m: float
    precipitation_mm: float = 0.0
    precipitation_probability: float = 0.0
    rain_mm: float = 0.0
    wind_speed_10m: float = 0.0
    weather_code: int = 0
    weather_description: str = "Clear / Fair"
    rainfall_48h_mm: float = 0.0
    soil_moisture: float = 0.35
    temperature_c: float = 24.0
    is_live: bool = False
    timestamp: str = ""


class LiveWeatherResponse(BaseModel):
    timestamp: str
    total_stations: int
    data_source: str
    stations: List[WeatherData]


# -------------------------------------------------------------
# Corridor & Hazard Models
# -------------------------------------------------------------

class RiskFactorBreakdown(BaseModel):
    rainfall_48h_contrib: float = Field(..., description="Percentage contribution of 48h rainfall")
    rain_intensity_contrib: float = Field(..., description="Percentage contribution of current rain intensity")
    slope_angle_contrib: float = Field(..., description="Percentage contribution of slope gradient")
    soil_saturation_contrib: float = Field(..., description="Percentage contribution of soil moisture saturation")
    historical_vulnerability_contrib: float = Field(..., description="Percentage contribution of GSI/NDMA history")
    active_reports_contrib: float = Field(..., description="Percentage contribution of active field damage reports")
    primary_driver: str = Field(..., description="Human readable primary risk driver statement")
    explanation_text: str = Field(..., description="Explainable AI assessment string")


class GeoJSONGeometry(BaseModel):
    type: str = "LineString"
    coordinates: List[List[float]] = Field(..., description="List of [lng, lat] coordinates")


class CorridorResponse(BaseModel):
    id: str
    name: str
    highway_code: str
    start_node: str
    end_node: str
    length_km: float
    normal_time_mins: int
    current_time_mins: int
    slope_deg: float
    elevation_range_m: List[int]
    historical_risk_level: str
    current_hazard_score: float
    hazard_classification: HazardLevel
    status: CorridorStatus
    geometry: GeoJSONGeometry
    weather_summary: Optional[Dict[str, Any]] = None
    risk_breakdown: Optional[RiskFactorBreakdown] = None
    active_incidents_count: int = 0


class CorridorDetailResponse(CorridorResponse):
    srtm_elevation_profile: List[Dict[str, Any]] = []
    gsi_hazard_hotspots: List[Dict[str, Any]] = []
    recent_field_reports: List[Dict[str, Any]] = []


# -------------------------------------------------------------
# Routing & Shipment Models
# -------------------------------------------------------------

class RouteSegment(BaseModel):
    corridor_id: str
    highway_code: str
    name: str
    from_node: str
    to_node: str
    distance_km: float
    estimated_time_mins: int
    hazard_score: float
    hazard_status: CorridorStatus
    geometry: List[List[float]]


class RouteOption(BaseModel):
    route_id: str
    cargo_type: CargoType
    total_distance_km: float
    total_time_mins: int
    eta_hours: float
    average_hazard_score: float
    max_hazard_score: float
    safety_score: float  # 0 - 100 (100 is safest)
    segments: List[RouteSegment]
    is_recommended: bool = True
    bottlenecks: List[str] = []
    reroute_reason: Optional[str] = None


class ShipmentResponse(BaseModel):
    id: str
    tracking_code: str
    cargo_type: CargoType
    cargo_name: str
    origin: str
    destination: str
    current_lat: float
    current_lng: float
    current_corridor_id: Optional[str] = None
    initial_eta_mins: int
    current_eta_mins: int
    eta_delta_mins: int
    status: ShipmentStatus
    priority_level: int
    assigned_route: RouteOption
    alternative_routes: List[RouteOption] = []
    requires_reroute: bool = False
    last_updated: str


class RerouteRequest(BaseModel):
    shipment_id: str
    cargo_type: Optional[CargoType] = None
    avoid_corridor_ids: Optional[List[str]] = None
    custom_risk_penalty: Optional[float] = None


class RerouteResponse(BaseModel):
    shipment_id: str
    tracking_code: str
    cargo_type: CargoType
    previous_route_id: str
    new_route: RouteOption
    eta_delta_mins: int
    reroute_triggered: bool
    explanation: str
    alternative_options: List[RouteOption] = []


# -------------------------------------------------------------
# Field Reports & Offline Sync Models
# -------------------------------------------------------------

class FieldReportCreate(BaseModel):
    report_code: Optional[str] = None
    reporter_name: str
    reporter_role: str = "FIELD_SCOUT"  # DRIVER, LOCAL_ADMIN, BRO, SCOUT
    corridor_id: str
    location_name: str
    lat: float
    lng: float
    damage_type: DamageType
    severity_1_to_10: int = Field(..., ge=1, le=10)
    description: str
    road_passable: bool = False
    estimated_clearance_hours: Optional[float] = None
    photo_data_base64: Optional[str] = None
    offline_created_at: Optional[str] = None


class FieldReportResponse(BaseModel):
    id: str
    report_code: str
    reporter_name: str
    reporter_role: str
    corridor_id: str
    corridor_name: str
    location_name: str
    lat: float
    lng: float
    damage_type: DamageType
    severity_1_to_10: int
    description: str
    road_passable: bool
    estimated_clearance_hours: Optional[float]
    photo_data_base64: Optional[str]
    timestamp: str
    sync_status: SyncStatus
    verified: bool = False


class FieldReportBatchSync(BaseModel):
    reports: List[FieldReportCreate]
    client_device_id: Optional[str] = None


# -------------------------------------------------------------
# Multilingual Alert Models
# -------------------------------------------------------------

class AlertSeverity(str, Enum):
    INFO = "INFO"
    WATCH = "WATCH"
    WARNING = "WARNING"
    CRITICAL = "CRITICAL"


class MultilingualText(BaseModel):
    en: str  # English
    hi: str  # Hindi
    as_: str = Field(..., alias="as")  # Assamese (অসমীয়া)
    mz: str  # Mizo (Mizo ṭawng)
    mn: str  # Manipuri (মৈতৈলোন্)
    bn: str  # Bengali (বাংলা)

    model_config = ConfigDict(populate_by_name=True)


class AlertResponse(BaseModel):
    id: str
    corridor_id: Optional[str] = None
    corridor_name: Optional[str] = None
    severity: AlertSeverity
    title: str
    incident_type: str
    location_name: str
    timestamp: str
    active: bool = True
    translations: MultilingualText
    recommended_action: str


class BroadcastAlertRequest(BaseModel):
    corridor_id: str
    severity: AlertSeverity
    damage_type: DamageType
    location_name: str
    details: str
    recommended_action: Optional[str] = None


# -------------------------------------------------------------
# Simulation Models
# -------------------------------------------------------------

class SimulationTriggerRequest(BaseModel):
    corridor_id: str
    disruption_type: DamageType = DamageType.LANDSLIDE
    severity: int = Field(8, ge=1, le=10, description="Severity 1-10")
    custom_hazard_score: Optional[float] = Field(None, ge=0.0, le=100.0)
    set_blocked: bool = True
    rainfall_surge_mm: float = 75.0
    location_desc: Optional[str] = None


class SimulationResponse(BaseModel):
    success: bool
    message: str
    affected_corridor_id: str
    affected_corridor_name: str
    new_corridor_status: CorridorStatus
    new_hazard_score: float
    affected_shipments_count: int
    rerouted_shipments: List[Dict[str, Any]]
    broadcasted_alert: Optional[AlertResponse] = None


class SimulationResetResponse(BaseModel):
    success: bool
    message: str
    corridors_reset_count: int
    shipments_reset_count: int
