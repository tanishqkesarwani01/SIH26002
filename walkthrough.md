# Walkthrough: Northeast India Logistics Resilience Platform (NER-LRP)

The **Northeast India Logistics Resilience Platform (NER-LRP)** is an end-to-end AI & GIS-Driven Regional Logistics Control Tower designed specifically for the unique terrain and hazard challenges of Northeast India.

---

## 🌟 What Was Built

```
               ┌──────────────────────────────────────────────────────────┐
               │          REAL DATA INGESTION & SENSING ENGINE            │
               ├────────────────────────────┬─────────────────────────────┤
               │  Open-Meteo & IMD Weather  │  SRTM DEM & Terrain Slope   │
               │  (Live rain, 48h mm, wind) │  (Elevation gradients 0-60°)│
               ├────────────────────────────┼─────────────────────────────┤
               │  OpenStreetMap (OSM) Graph │  GSI/NDMA Historical Zones  │
               │  (NH-10, NH-6, NH-29, 306) │  (Vulnerability hotspots)   │
               └─────────────┬──────────────────────────────┬─────────────┘
                             │                              │
                             ▼                              ▼
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                             FASTAPI BACKEND & AI RISK ENGINE                             │
├──────────────────────────────────────────────────────────────────────────────────────────┤
│  • ML Hazard Scoring Service: Gradient Boosting Regressor (0-100 hazard score)           │
│  • Multi-Objective Cost Router: Cargo-Criticality-Weighted Routing (Medical vs Bulk)     │
│  • Disruption Engine: Real-time event simulation (landslides, floods, washouts)          │
│  • Incident Sync Service: REST APIs for offline field reports & status lifecycles        │
│  • Multilingual Translation Service: 6 regional NER languages (AS, MZ, MN, BN, HI, EN)  │
└────────────────────────────────────────────┬─────────────────────────────────────────────┘
                                             │
                       ┌─────────────────────┴─────────────────────┐
                       ▼                                           ▼
┌──────────────────────────────────────────────┐ ┌────────────────────────────────────────┐
│         COMMAND TOWER DASHBOARD (REACT)      │ │      OFFLINE-FIRST FIELD PWA APP       │
├──────────────────────────────────────────────┤ ├────────────────────────────────────────┤
│ • Interactive Leaflet Dark-Mode GIS Map      │ │ • Offline IndexedDB / LocalStorage     │
│ • Color-Coded Corridors & Real-Time Hazards  │ │ • Camera Geo-photo Attachment          │
│ • Critical Cargo Prioritization Table        │ │ • GPS Coordinate Capture & Severity    │
│ • 1-Click Interactive Disruption Simulator   │ │ • Auto-Sync Badge (Pending ⏳/Synced 🟢)│
│ • Multilingual Voice/Audio Alert Broadcast   │ │ • Multilingual Regional UI             │
└──────────────────────────────────────────────┘ └────────────────────────────────────────┘
```

---

## 🚀 Key Modules & Implemented Features

### 1. Real Data Ingestion & Geospatial Intelligence
- [data_fetcher.py](file:///c:/Users/Tanishq%20Kesarwani/OneDrive/Desktop/SIH26002/backend/services/data_fetcher.py):
  - Fetches live weather from **Open-Meteo API** across 13+ NER stations (Guwahati, Shillong, Silchar, Aizawl, Kohima, Imphal, Gangtok, Itanagar, Agartala, Siliguri, Dimapur, Haflong, Jowai).
  - Integrates **SRTM DEM elevation & slope profiles** (e.g. 38.5° slope on NH-10 Teesta Gorge, 36.5° on NH-6 Jowai-Silchar).
  - Integrates **Geological Survey of India (GSI) & NDMA landslide hotspots** (Sonapur Tunnel, 29th Mile NH-10, Dzüdza River Bridge, Chumukedima, Jatinga Valley).

### 2. Explainable AI Hazard Risk Engine
- [ml_risk_engine.py](file:///c:/Users/Tanishq%20Kesarwani/OneDrive/Desktop/SIH26002/backend/services/ml_risk_engine.py):
  - Machine Learning Gradient Boosting Model predicting composite 0–100 Hazard Scores based on 48h rainfall, rain intensity, slope angle, soil saturation, and historical vulnerability.
  - Transparent feature attribution breakdown explaining *why* a corridor is marked Safe, Watch, Warning, or Blocked.

### 3. Cargo-Criticality Multi-Objective Routing Engine
- [routing_engine.py](file:///c:/Users/Tanishq%20Kesarwani/OneDrive/Desktop/SIH26002/backend/services/routing_engine.py):
  - Prioritizes **Critical Medical Cargo** (safety weight $\beta = 0.85$), automatically rerouting via safe alternative highways (e.g., diverting away from NH-6 Sonapur to NH-27 Haflong bypass).
  - Calculates ETA deltas (+X mins / hours) and safety score differentials.

### 4. Offline-First Field Officer PWA Module
- [FieldReporter.jsx](file:///c:/Users/Tanishq%20Kesarwani/OneDrive/Desktop/SIH26002/frontend/src/components/FieldReporter.jsx) & [offlineDb.js](file:///c:/Users/Tanishq%20Kesarwani/OneDrive/Desktop/SIH26002/frontend/src/services/offlineDb.js):
  - Supports field reporting in zero-connectivity mountain zones.
  - Caches reports in IndexedDB/LocalStorage with `⏳ Sync Pending` status.
  - Auto-syncs to backend with instant badge update to `🟢 Synced` once network is restored.

### 5. Multilingual Alert Broadcaster with Voice Synthesis
- [MultilingualAlerts.jsx](file:///c:/Users/Tanishq%20Kesarwani/OneDrive/Desktop/SIH26002/frontend/src/components/MultilingualAlerts.jsx) & [multilingual_service.py](file:///c:/Users/Tanishq%20Kesarwani/OneDrive/Desktop/SIH26002/backend/services/multilingual_service.py):
  - Generates emergency advisories across **6 regional languages**: English, Hindi, Assamese (অসমীয়া), Mizo (Mizo ṭawng), Manipuri (মৈতৈলোন্), Bengali (বাংলা).
  - Integrated **Web Speech API** for live regional audio playback.
  - WhatsApp & GSM SMS payload generator for field drivers.

---

## 🧪 Validation & Test Results

### 1. Backend Automated Tests (`pytest`)
Ran the full backend test suite:
```
============================= test session starts =============================
platform win32 -- Python 3.14.5, pytest-9.1.1, pluggy-1.6.0
collected 21 items

tests/test_backend.py::test_weather_fetcher_single_station PASSED        [  4%]
tests/test_backend.py::test_weather_fetcher_all_stations PASSED          [  9%]
tests/test_backend.py::test_corridor_geo_registry_and_srtm PASSED        [ 14%]
tests/test_backend.py::test_ml_risk_engine_trained PASSED                [ 19%]
tests/test_backend.py::test_ml_risk_prediction_safe_conditions PASSED    [ 23%]
tests/test_backend.py::test_ml_risk_prediction_extreme_landslide_conditions PASSED [ 28%]
tests/test_backend.py::test_ml_risk_explainability_breakdown PASSED      [ 33%]
tests/test_backend.py::test_routing_engine_pathfinding PASSED            [ 38%]
tests/test_backend.py::test_cargo_criticality_routing_differentiation PASSED [ 42%]
tests/test_backend.py::test_routing_engine_avoid_corridor PASSED         [ 47%]
tests/test_backend.py::test_multilingual_alert_generation PASSED         [ 52%]
tests/test_backend.py::test_api_health_endpoint PASSED                   [ 57%]
tests/test_backend.py::test_api_weather_live_endpoint PASSED             [ 61%]
tests/test_backend.py::test_api_corridors_list_endpoint PASSED           [ 66%]
tests/test_backend.py::test_api_corridor_detail_endpoint PASSED          [ 71%]
tests/test_backend.py::test_api_corridor_not_found PASSED                [ 76%]
tests/test_backend.py::test_api_shipments_list_and_details PASSED        [ 80%]
tests/test_backend.py::test_api_shipment_reroute_endpoint PASSED         [ 85%]
tests/test_backend.py::test_api_field_reports_crud_and_batch_sync PASSED [ 90%]
tests/test_backend.py::test_api_alerts_and_broadcast PASSED              [ 95%]
tests/test_backend.py::test_api_simulation_trigger_and_reset PASSED      [100%]

======================= 21 passed, 2 warnings in 14.62s =======================
```
**Result:** **100% of tests passed (21/21 tests).**

### 2. Frontend Production Build (`npm run build`)
```
vite v5.4.21 building for production...
✓ 1890 modules transformed.
dist/index.html                   1.67 kB │ gzip:   0.88 kB
dist/assets/index-D41L414l.css   30.71 kB │ gzip:   6.07 kB
dist/assets/index-B-uxy5p0.js   425.59 kB │ gzip: 125.92 kB
✓ built in 31.43s
```
**Result:** **Clean build with 0 errors.**

---

## 🖥️ How to Run the Application

### 1-Click Master Launch:
```powershell
python run_all.py
```
This starts both the FastAPI backend on `http://localhost:8000` and the React frontend on `http://localhost:5173`, automatically launching the browser.

### Interactive Live Demo Instructions:
1. **Interactive GIS Command Tower:** View the dark GIS map with color-coded highway polylines (Green/Amber/Orange/Red), weather radar overlays, and moving convoy beacons.
2. **Disruption Simulation:** Click **"⚡ NH-6 Sonapur Landslide"**. Watch the corridor turn RED, and see the **Medical Oxygen** convoy automatically reroute via the safe NH-27 bypass with an updated ETA delta (+2h 15m).
3. **Offline Field Reporting:** Open the **Field Officer PWA** tab, toggle "Simulate Offline Mode", upload a damage photo, set severity to 8/10, and submit. Observe the `⏳ Sync Pending` status. Toggle offline mode OFF to watch it immediately sync with the backend.
4. **Multilingual Broadcast:** Open the **Multilingual Alert Hub**, toggle between Assamese, Mizo, Manipuri, Bengali, Hindi, and English, and click **🔊 Listen Audio** to hear real-time voice speech synthesis of the emergency bulletin.
