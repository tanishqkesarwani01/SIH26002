import React, { useState, useEffect, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Polyline,
  Circle,
  Marker,
  Popup,
  Tooltip,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import { useLogistics } from "../context/LogisticsContext";
import {
  Layers,
  CloudRain,
  Truck,
  AlertTriangle,
  Compass,
  Shield,
  Eye,
  Info,
  ExternalLink,
  ChevronRight,
  Maximize2,
  Navigation,
} from "lucide-react";

// Fix standard leaflet icon path issues
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Create custom SVG markers for Trucks
const createTruckIcon = (priority, isRerouted) => {
  const isCritical = priority === "CRITICAL_MEDICAL";
  const isRelief = priority === "PRIORITY_RELIEF";
  const color = isCritical ? "#06b6d4" : isRelief ? "#f59e0b" : "#94a3b8";
  const glow = isCritical
    ? "rgba(6, 182, 212, 0.6)"
    : isRelief
    ? "rgba(245, 158, 11, 0.5)"
    : "rgba(148, 163, 184, 0.3)";

  const svg = `
    <div style="
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: #0f172a;
      border: 2px solid ${color};
      box-shadow: 0 0 14px ${glow};
    ">
      ${
        isCritical
          ? `<div style="position: absolute; top: -3px; right: -3px; width: 10px; height: 10px; border-radius: 50%; background: #ef4444; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>`
          : ""
      }
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="1" y="3" width="15" height="13"></rect>
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
        <circle cx="5.5" cy="18.5" r="2.5"></circle>
        <circle cx="18.5" cy="18.5" r="2.5"></circle>
      </svg>
    </div>
  `;

  return L.divIcon({
    html: svg,
    className: "custom-truck-marker",
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });
};

// Create custom SVG markers for Field Incidents
const createIncidentIcon = (severity, hazardType) => {
  const isExtreme = severity >= 8;
  const color = isExtreme ? "#ef4444" : "#f97316";

  const svg = `
    <div style="
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: #180909;
      border: 2px solid ${color};
      box-shadow: 0 0 18px rgba(239, 68, 68, 0.7);
      animation: pulse 2s infinite;
    ">
      <div style="position: absolute; width: 100%; height: 100%; border-radius: 50%; border: 1.5px solid ${color}; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite; opacity: 0.75;"></div>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
        <line x1="12" y1="9" x2="12" y2="13"></line>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
      </svg>
    </div>
  `;

  return L.divIcon({
    html: svg,
    className: "custom-incident-marker",
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -19],
  });
};

// Auto center map hook
const MapViewController = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.5 });
  }, [center, zoom, map]);
  return null;
};

export const MapView = () => {
  const {
    corridors,
    shipments,
    incidents,
    weatherHotspots,
    mapLayers,
    setMapLayers,
    setSelectedCorridor,
    manualRerouteShipment,
    setActiveTab,
  } = useLogistics();

  const [basemapStyle, setBasemapStyle] = useState(
    () => localStorage.getItem("ner_basemap_style") || "esri_dark"
  );
  const [mapboxToken, setMapboxToken] = useState(
    () => localStorage.getItem("ner_mapbox_token") || ""
  );
  const [cartoKey, setCartoKey] = useState(
    () => localStorage.getItem("ner_carto_key") || ""
  );
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [tempMapboxToken, setTempMapboxToken] = useState(mapboxToken);
  const [tempCartoKey, setTempCartoKey] = useState(cartoKey);

  const saveApiKeys = () => {
    setMapboxToken(tempMapboxToken);
    setCartoKey(tempCartoKey);
    localStorage.setItem("ner_mapbox_token", tempMapboxToken);
    localStorage.setItem("ner_carto_key", tempCartoKey);
    setShowKeyModal(false);
  };

  const handleBasemapChange = (style) => {
    setBasemapStyle(style);
    localStorage.setItem("ner_basemap_style", style);
    if ((style === "mapbox" && !mapboxToken) || (style === "carto" && !cartoKey)) {
      setShowKeyModal(true);
    }
  };

  // Corridor color mapper based on risk status
  const getCorridorStyle = (corridor) => {
    if (corridor.isAlternate) {
      return {
        color: "#10b981", // Emerald Alternate bypass
        weight: 4,
        opacity: 0.85,
        dashArray: "6, 8",
      };
    }

    switch (corridor.status) {
      case "blocked":
        return {
          color: "#ef4444", // Crimson Blocked
          weight: 6,
          opacity: 0.95,
          className: "corridor-blocked-path",
        };
      case "warning":
        return {
          color: "#f97316", // Orange Warning
          weight: 5,
          opacity: 0.9,
        };
      case "watch":
        return {
          color: "#f59e0b", // Amber Watch
          weight: 4,
          opacity: 0.85,
        };
      case "safe":
      default:
        return {
          color: "#10b981", // Emerald Safe
          weight: 4,
          opacity: 0.8,
        };
    }
  };

  // Quick corridor zoom preset handler
  const focusOnCorridor = (coords, zoom = 9) => {
    if (coords && coords.length > 0) {
      const mid = coords[Math.floor(coords.length / 2)];
      setMapCenter(mid);
      setMapZoom(zoom);
    }
  };

  return (
    <div className="relative w-full h-[680px] lg:h-[760px] rounded-2xl overflow-hidden border border-slate-800 bg-[#070a13] shadow-2xl">
      {/* Map Header & Layer Controller Overlay */}
      <div className="absolute top-4 left-4 right-4 z-[1000] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Left: Quick Region Filters */}
        <div className="pointer-events-auto flex flex-wrap items-center gap-1.5 bg-[#0b1120]/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-700/80 shadow-lg text-xs">
          <div className="flex items-center gap-1.5 px-2.5 py-1 text-slate-300 font-semibold border-r border-slate-700">
            <Compass className="w-3.5 h-3.5 text-emerald-400" />
            <span>NER Grid Focus</span>
          </div>

          <button
            onClick={() => {
              setMapCenter([25.85, 92.5]);
              setMapZoom(7);
            }}
            className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white transition-all font-mono"
          >
            All 8 States
          </button>

          <button
            onClick={() => {
              setMapCenter([25.2, 92.2]);
              setMapZoom(9);
            }}
            className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white transition-all font-mono"
          >
            NH-6 Meghalaya
          </button>

          <button
            onClick={() => {
              setMapCenter([27.0, 88.5]);
              setMapZoom(9);
            }}
            className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white transition-all font-mono"
          >
            NH-10 Sikkim
          </button>

          <button
            onClick={() => {
              setMapCenter([25.8, 93.9]);
              setMapZoom(9);
            }}
            className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white transition-all font-mono"
          >
            NH-29 Nagaland
          </button>
        </div>

        {/* Right: Layer Toggles & Basemap Switcher Toolbar */}
        <div className="pointer-events-auto flex items-center gap-1.5 bg-[#0b1120]/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-700/80 shadow-lg text-xs">
          {/* Basemap Style Selector */}
          <div className="flex items-center gap-1 border-r border-slate-700 pr-1.5">
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={basemapStyle}
              onChange={(e) => handleBasemapChange(e.target.value)}
              className="bg-slate-800 text-slate-200 border border-slate-600 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-emerald-500 cursor-pointer font-mono"
            >
              <option value="esri_dark">ESRI Dark Canvas (Free)</option>
              <option value="osm_standard">OpenStreetMap Detailed (Free)</option>
              <option value="satellite">ESRI Satellite Terrain (Free)</option>
              <option value="mapbox">Mapbox Dark (API Key)</option>
              <option value="carto">CARTO Dark (API Key)</option>
            </select>

            <button
              onClick={() => setShowKeyModal(true)}
              title="Configure Mapbox / Carto API Key"
              className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-600 transition-all"
            >
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
            </button>
          </div>

          <button
            onClick={() =>
              setMapLayers((prev) => ({ ...prev, weatherRadar: !prev.weatherRadar }))
            }
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all ${
              mapLayers.weatherRadar
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/50"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <CloudRain className="w-3.5 h-3.5" />
            <span>Radar ({weatherHotspots.length})</span>
          </button>

          <button
            onClick={() =>
              setMapLayers((prev) => ({ ...prev, activeShipments: !prev.activeShipments }))
            }
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all ${
              mapLayers.activeShipments
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/50"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Fleet ({shipments.length})</span>
          </button>

          <button
            onClick={() =>
              setMapLayers((prev) => ({ ...prev, incidents: !prev.incidents }))
            }
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all ${
              mapLayers.incidents
                ? "bg-red-500/20 text-red-300 border border-red-500/50"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Incidents ({incidents.length})</span>
          </button>
        </div>
      </div>

      {/* API Key Configuration Modal */}
      {showKeyModal && (
        <div className="absolute inset-0 z-[2000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-slate-100 font-bold">
                <Shield className="w-5 h-5 text-emerald-400" />
                <span>Map Provider API Keys</span>
              </div>
              <button
                onClick={() => setShowKeyModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              You can use our built-in <strong>100% Free</strong> providers (ESRI Dark, OpenStreetMap, Satellite) without any key. 
              If you have a personal <strong>Mapbox</strong> or <strong>CARTO</strong> account, paste your key below:
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Mapbox Access Token (pk.eyJ...)
                </label>
                <input
                  type="text"
                  placeholder="e.g. pk.eyJ1Ijoi..."
                  value={tempMapboxToken}
                  onChange={(e) => setTempMapboxToken(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  CARTO Basemap API Key
                </label>
                <input
                  type="text"
                  placeholder="e.g. default_public or your carto key"
                  value={tempCartoKey}
                  onChange={(e) => setTempCartoKey(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowKeyModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={saveApiKeys}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-900/40"
              >
                Save & Apply Key
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Leaflet Map */}
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <MapViewController center={mapCenter} zoom={mapZoom} />

        {/* Dynamic Basemap Tile Layer */}
        {basemapStyle === "osm_standard" && (
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />
        )}

        {basemapStyle === "satellite" && (
          <TileLayer
            attribution='&copy; <a href="https://www.esri.com/">Esri</a>, Maxar, Earthstar Geographics'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            maxZoom={18}
          />
        )}

        {basemapStyle === "mapbox" && (
          <TileLayer
            attribution='&copy; <a href="https://www.mapbox.com/">Mapbox</a> &copy; OpenStreetMap'
            url={`https://api.mapbox.com/styles/v1/mapbox/dark-v11/tiles/256/{z}/{x}/{y}@2x?access_token=${mapboxToken || "pk.eyJ1IjoiZXhhbXBsZSIsImEiOiJjbGV4YW1wbGUifQ.example"}`}
            maxZoom={19}
            tileSize={512}
            zoomOffset={-1}
          />
        )}

        {basemapStyle === "carto" && (
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url={`https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png${cartoKey ? `?api_key=${cartoKey}` : ""}`}
            subdomains="abcd"
            maxZoom={19}
          />
        )}

        {(!["osm_standard", "satellite", "mapbox", "carto"].includes(basemapStyle) || basemapStyle === "esri_dark") && (
          <TileLayer
            attribution='&copy; <a href="https://www.esri.com/">Esri</a> & USGS | Northeast Logistics Resilience Grid'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
            maxZoom={16}
          />
        )}

        {/* 1. Highway Corridors Polylines */}
        {corridors.map((corridor) => (
          <Polyline
            key={corridor.id}
            positions={corridor.coordinates}
            pathOptions={getCorridorStyle(corridor)}
            eventHandlers={{
              click: () => {
                setSelectedCorridor(corridor);
              },
            }}
          >
            <Tooltip sticky className="bg-slate-900 text-slate-100 border border-slate-700">
              <div className="font-mono text-xs">
                <div className="font-bold text-emerald-400">{corridor.name}</div>
                <div className="text-[11px] text-slate-300 mt-0.5">
                  Status: <span className="uppercase font-bold">{corridor.status}</span> · Risk:{" "}
                  {corridor.riskScore}%
                </div>
                <div className="text-[10px] text-slate-400 italic">Click for AI Risk Explainability</div>
              </div>
            </Tooltip>
          </Polyline>
        ))}

        {/* 2. Weather Radar Precipitation Hotspots */}
        {mapLayers.weatherRadar &&
          weatherHotspots.map((spot) => (
            <Circle
              key={spot.id}
              center={[spot.lat, spot.lng]}
              radius={spot.radius}
              pathOptions={{
                color: spot.color,
                fillColor: spot.color,
                fillOpacity: 0.18,
                weight: 1.5,
                dashArray: "4, 6",
              }}
            >
              <Popup>
                <div className="p-3 bg-slate-900 text-slate-100 rounded-lg min-w-[240px] text-xs">
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                    <span className="font-bold text-cyan-400 flex items-center gap-1">
                      <CloudRain className="w-3.5 h-3.5" />
                      {spot.name}
                    </span>
                    <span className="bg-red-500/20 text-red-400 font-mono px-1.5 py-0.5 rounded text-[10px] font-bold">
                      {spot.landslideRisk}% RISK
                    </span>
                  </div>
                  <div className="space-y-1.5 mt-2 text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-400">24h Rainfall:</span>
                      <span className="font-mono font-bold text-cyan-300">
                        {spot.rainfall24h} mm
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">48h Cumulative:</span>
                      <span className="font-mono font-bold text-amber-300">
                        {spot.rainfall48h} mm
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Wind / Temp:</span>
                      <span className="font-mono">
                        {spot.windSpeedKmh} km/h · {spot.temperatureC}°C
                      </span>
                    </div>
                    <div className="mt-1.5 p-1.5 rounded bg-red-950/50 border border-red-800/50 text-[10px] text-red-300 font-medium">
                      ⚠️ {spot.imdAlert}
                    </div>
                  </div>
                </div>
              </Popup>
            </Circle>
          ))}

        {/* 3. In-Transit Shipments / Trucks */}
        {mapLayers.activeShipments &&
          shipments.map((truck) => (
            <Marker
              key={truck.id}
              position={truck.currentCoords}
              icon={createTruckIcon(truck.priority, truck.status === "REROUTED_ACTIVE")}
            >
              <Popup>
                <div className="p-3 bg-slate-900 text-slate-100 rounded-lg min-w-[280px] text-xs">
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                    <span className="font-mono font-bold text-cyan-300">{truck.vehicleNo}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        truck.priority === "CRITICAL_MEDICAL"
                          ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                          : truck.priority === "PRIORITY_RELIEF"
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                          : "bg-slate-800 text-slate-300"
                      }`}
                    >
                      {truck.priority === "CRITICAL_MEDICAL"
                        ? "CRITICAL LIFE-SUPPORT"
                        : truck.priority === "PRIORITY_RELIEF"
                        ? "PRIORITY RELIEF"
                        : "STANDARD BULK"}
                    </span>
                  </div>

                  <div className="mt-2 space-y-1.5 text-slate-300">
                    <div className="font-semibold text-slate-100">{truck.title}</div>
                    <div className="text-slate-400 text-[11px] flex items-center gap-1">
                      <span>{truck.origin}</span>
                      <ChevronRight className="w-3 h-3 text-slate-500" />
                      <span className="text-slate-200 font-medium">{truck.destination}</span>
                    </div>

                    <div className="p-2 rounded bg-slate-800/80 border border-slate-700 text-[11px] space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Current Speed:</span>
                        <span className="font-mono font-bold text-emerald-400">
                          {truck.speedKmh} km/h
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Cargo Temp:</span>
                        <span className="font-mono text-cyan-300">{truck.temperature}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Route Status:</span>
                        <span
                          className={`font-bold ${
                            truck.status === "REROUTED_ACTIVE" ? "text-amber-400" : "text-emerald-400"
                          }`}
                        >
                          {truck.status === "REROUTED_ACTIVE"
                            ? "⚠️ REROUTED via BYPASS"
                            : "🟢 PRIMARY ROUTE"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Estimated ETA:</span>
                        <span className="font-mono font-bold text-slate-100">
                          {Math.floor(truck.etaMinutes / 60)}h {truck.etaMinutes % 60}m
                        </span>
                      </div>
                    </div>

                    {/* Quick Reroute Action */}
                    <div className="pt-1.5 flex gap-2">
                      <button
                        onClick={() => manualRerouteShipment(truck.id)}
                        className="w-full py-1.5 px-2.5 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-semibold flex items-center justify-center gap-1 transition-all"
                      >
                        <Navigation className="w-3 h-3" />
                        {truck.status === "REROUTED_ACTIVE"
                          ? "Revert to Primary"
                          : "AI Safety Reroute"}
                      </button>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

        {/* 4. Clickable Incident Markers */}
        {mapLayers.incidents &&
          incidents.map((incident) => (
            <Marker
              key={incident.id}
              position={[incident.lat, incident.lng]}
              icon={createIncidentIcon(incident.severity, incident.hazardType)}
            >
              <Popup>
                <div className="p-3 bg-slate-900 text-slate-100 rounded-lg min-w-[290px] max-w-[320px] text-xs">
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                    <span className="font-bold text-red-400 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      {incident.hazardType}: {incident.corridorCode}
                    </span>
                    <span className="bg-red-500/20 text-red-300 font-mono px-1.5 py-0.5 rounded text-[10px] font-bold border border-red-500/40">
                      SEVERITY {incident.severity}/10
                    </span>
                  </div>

                  <div className="mt-2 space-y-2">
                    <div className="font-medium text-slate-200">{incident.title}</div>

                    {incident.photoUrl && (
                      <div className="relative rounded-lg overflow-hidden border border-slate-700 h-32 w-full bg-slate-950">
                        <img
                          src={incident.photoUrl}
                          alt="Field incident photo"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                        <div className="absolute bottom-1 right-1 bg-black/80 backdrop-blur px-1.5 py-0.5 rounded text-[9px] font-mono text-slate-300">
                          {incident.chainage}
                        </div>
                      </div>
                    )}

                    <div className="text-[11px] text-slate-300 leading-relaxed">
                      {incident.description}
                    </div>

                    <div className="p-2 rounded bg-slate-950/70 border border-slate-800 text-[10px] space-y-1 font-mono text-slate-400">
                      <div>
                        👮 Reported By:{" "}
                        <span className="text-slate-200 font-sans">{incident.officerName}</span>
                      </div>
                      <div>
                        ⏳ Est. Clearance:{" "}
                        <span className="text-amber-400 font-bold">
                          {incident.estimatedClearanceHours} Hours
                        </span>
                      </div>
                      <div>
                        🚜 Deployed:{" "}
                        <span className="text-cyan-300">
                          {incident.equipmentDeployed?.join(", ") || "BRO Patrol Unit"}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => setActiveTab("broadcast")}
                      className="w-full py-1.5 px-2 rounded bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 font-semibold text-[11px] flex items-center justify-center gap-1.5 transition-all"
                    >
                      <span>Broadcast Multilingual Alert</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>

      {/* Bottom Map Legend */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-[#0b1120]/90 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-700/80 shadow-lg text-[11px]">
        <div className="font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
          <Shield className="w-3 h-3 text-emerald-400" />
          <span>NER Corridor Status Legend</span>
        </div>
        <div className="flex items-center gap-3 font-mono text-[10px]">
          <div className="flex items-center gap-1">
            <span className="w-3 h-1.5 rounded-full bg-emerald-500"></span>
            <span className="text-emerald-400">Safe (&lt;30%)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-1.5 rounded-full bg-amber-500"></span>
            <span className="text-amber-400">Watch (30-50%)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-1.5 rounded-full bg-orange-500"></span>
            <span className="text-orange-400">Warning (50-75%)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
            <span className="text-red-400">Blocked (&gt;75%)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
