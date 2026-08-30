# 🏔️ Northeast India Logistics Resilience Platform (NER-LRP)
## *AI & GIS-Driven Regional Logistics Control Tower for Northeast India*

[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Leaflet GIS](https://img.shields.io/badge/Leaflet_GIS-199900?style=for-the-badge&logo=leaflet&logoColor=white)](https://leafletjs.com/)
[![Scikit-Learn](https://img.shields.io/badge/Scikit--Learn_ML-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white)](https://scikit-learn.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

---

## 📌 1. Problem Statement Alignment

The **Northeast Region (NER) of India** is characterized by steep mountainous topography (>70% hilly), extreme monsoon precipitation, frequent flash floods, landslides, and single-artery transport links. Disruption of key corridors (e.g. NH-10 in Sikkim, NH-6 in Meghalaya, NH-29 in Nagaland, NH-306 in Mizoram) paralyzes essential supply deliveries and inflates local commodity costs by **over 20%**.

**NER-LRP** provides an end-to-end **Sense–Predict–Decide–Act** decision-support system:
- **Sense:** Integrates live real-world weather feeds (Open-Meteo / IMD), real SRTM terrain slope gradients, and OpenStreetMap (OSM) highway geometries.
- **Predict:** Machine Learning Gradient Boosting models calculate explainable 0–100 Hazard Risk Scores with feature importance attributions.
- **Decide:** Multi-Objective Cost Routing prioritizing life-saving medical supplies vs general cargo.
- **Act:** Real-time disruption simulation, offline-first PWA field reporting with sync queue, and 6-language regional emergency alert broadcasting.

---

## ⚡ 2. Key Architecture & Features

### 📡 2.1 Live Real Data Ingestion
- **Open-Meteo Meteorological API:** Queries real-time precipitation, 48h cumulative rainfall, wind speed, and humidity for 13+ NER stations (Guwahati, Shillong, Silchar, Aizawl, Kohima, Imphal, Gangtok, Itanagar, Agartala, Siliguri, Dimapur, Haflong, Jowai).
- **SRTM DEM Slope Profiles:** Real elevation and slope angles (0° to 45°+) calculated for critical hill stretches.
- **GSI / NDMA Historical Disaster Hotspots:** Pre-indexed zones (Sonapur Tunnel, 29th Mile NH-10, Chumukedima, Jatinga Valley, Harangajao).

### 🤖 2.2 Explainable AI Hazard Risk Engine
- **Multi-Factor Model:** Gradient Boosting Regressor trained on 48h rainfall, rain intensity, slope angle, soil saturation, historical vulnerability, and active field damage reports.
- **Explainability:** Feature percentage breakdown explaining why a corridor is classified (Safe, Watch, Warning, Blocked).

### 🚑 2.3 Cargo Criticality Routing Engine
- **Multi-Objective Cost Optimization:**
  - **Medical Oxygen / Vaccines:** Diverts around moderate-to-high risk zones even if +45 mins longer.
  - **Relief Rations:** Balanced safety and deadline weighting.
  - **Commercial Goods:** Shortest travel time unless road is physically blocked.

### 📱 2.4 Offline-First Field Officer PWA Module
- Works completely offline in remote zero-network zones.
- Captures GPS coordinates, geo-tagged photos, and damage severity (1–10).
- IndexedDB / LocalStorage sync queue with "⏳ Sync Pending" that seamlessly batch-syncs to "🟢 Synced" upon reconnection.

### 🌐 2.5 Multilingual Emergency Alert Hub
- Automatically translates alerts into 6 regional languages:
  - 🇬🇧 English
  - 🇮🇳 Hindi (हिन्दी)
  - 🌿 Assamese (অসমীয়া)
  - 🏔️ Mizo (Mizo ṭawng)
  - 🌸 Manipuri (মৈতৈলোন্)
  - 🌊 Bengali (বাংলা)
- Web Speech API integration for live synthesized voice audio playback.
- WhatsApp & SMS dispatch payload generator.

---

## 🚀 3. Quick Start Guide

### Option 1: 1-Click Master Launcher (Recommended)
```powershell
python run_all.py
```
This automatically installs backend and frontend dependencies, starts FastAPI on `http://localhost:8000`, starts Vite React on `http://localhost:5173`, and opens the dashboard in your browser.

### Option 2: Running Services Individually

#### Start Backend:
```powershell
cd backend
python -m pip install -r requirements.txt
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
API Documentation available at: `http://localhost:8000/docs`

#### Start Frontend:
```powershell
cd frontend
npm install
npm run dev
```
Dashboard available at: `http://localhost:5173`

---

## 🧪 4. Running Backend Tests
```powershell
cd backend
pytest tests/test_backend.py -v
```

---

## 🏆 5. Live Evaluator Demo Flow
1. **Explore GIS Control Tower:** View color-coded corridors across Northeast India, weather radar overlays, and live critical shipments.
2. **Click Disruption Simulator:** Select "⚡ NH-6 Sonapur Landslide" or "⚡ NH-10 Kalijhora Flash Flood". Watch the highway turn RED and observe the Medical Cargo truck automatically calculate a safe bypass corridor with delta ETA (+2h 15m).
3. **Open Field Officer Module:** Toggle "Simulate Offline Mode", submit a damage report with photo and severity 8/10. Notice the "⏳ Sync Pending" badge. Toggle offline mode OFF to watch it instantly sync and appear on the Command Tower map.
4. **Open Multilingual Broadcast:** Switch between Assamese, Mizo, Manipuri, Bengali, Hindi, and English. Click **🔊 Listen Audio** to hear real-time voice speech synthesis of the emergency bulletin.
