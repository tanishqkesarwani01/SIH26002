import React, { createContext, useContext, useState, useEffect } from "react";
import { NER_CORRIDORS } from "../data/corridorsData";
import { INITIAL_SHIPMENTS } from "../data/shipmentsData";
import { INITIAL_FIELD_INCIDENTS } from "../data/fieldIncidentsData";
import { WEATHER_HOTSPOTS } from "../data/weatherRadarData";
import { offlineStorage } from "../services/offlineDb";
import { apiService } from "../services/api";

const LogisticsContext = createContext(null);

export const LogisticsProvider = ({ children }) => {
  const [corridors, setCorridors] = useState(NER_CORRIDORS);
  const [shipments, setShipments] = useState(INITIAL_SHIPMENTS);
  const [incidents, setIncidents] = useState(INITIAL_FIELD_INCIDENTS);
  const [weatherHotspots, setWeatherHotspots] = useState(WEATHER_HOTSPOTS);

  // Active Simulation state
  const [activeSimulation, setActiveSimulation] = useState(null);
  const [simulationToast, setSimulationToast] = useState(null);

  // Offline Mode State for Field Operations
  const [isOfflineSimulated, setIsOfflineSimulated] = useState(false);
  const [pendingQueueCount, setPendingQueueCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  // Selected Corridor for Explainable AI Drawer
  const [selectedCorridor, setSelectedCorridor] = useState(null);

  // Map Filter Layers
  const [mapLayers, setMapLayers] = useState({
    weatherRadar: true,
    activeShipments: true,
    incidents: true,
    alternateRoutes: true,
    terrainRiskHeatmap: true,
  });

  // Selected active tab for views
  const [activeTab, setActiveTab] = useState("dashboard"); // dashboard, map, simulator, fleet, field-reporter, broadcast

  // Backend connection status
  const [backendStatus, setBackendStatus] = useState("CHECKING"); // ONLINE, OFFLINE, LOCAL_FALLBACK

  // Check backend health on mount
  useEffect(() => {
    const checkApi = async () => {
      const res = await apiService.checkHealth();
      setBackendStatus(res.isOnline ? "ONLINE" : "LOCAL_FALLBACK");
    };
    checkApi();
  }, []);

  // Update pending offline queue count
  const refreshPendingCount = async () => {
    const pending = await offlineStorage.getPendingQueue();
    setPendingQueueCount(pending.length);
  };

  useEffect(() => {
    refreshPendingCount();
  }, []);

  // Calculate Overall Disruption Risk Index
  const averageRisk = Math.round(
    corridors.reduce((sum, c) => sum + (c.riskScore || 0), 0) / corridors.length
  );

  const criticalShipmentsCount = shipments.filter(
    (s) => s.priority === "CRITICAL_MEDICAL"
  ).length;

  const activeAlertsCount = corridors.filter(
    (c) => c.status === "blocked" || c.status === "warning"
  ).length + incidents.filter((i) => i.isBlockageActive).length;

  // 1-Click Simulation Trigger
  const triggerScenario = (scenarioKey) => {
    setActiveSimulation(scenarioKey);

    if (scenarioKey === "sonapur-landslide") {
      // 1. Mark NH-6 as blocked
      setCorridors((prev) =>
        prev.map((c) => {
          if (c.id === "nh-6-meghalaya-barak") {
            return {
              ...c,
              status: "blocked",
              riskScore: 96,
              blockageReason: "Major Landslide at Sonapur Tunnel (KM 141)",
              explanation: {
                ...c.explanation,
                rainfall48h: 310,
                soilMoisture: 98,
              },
            };
          }
          if (c.id === "nh-27-haflong-bypass") {
            return { ...c, status: "safe", isElevatedTraffic: true };
          }
          return c;
        })
      );

      // 2. Automatically pivot critical medical shipments
      setShipments((prev) =>
        prev.map((s) => {
          if (s.corridorId === "nh-6-meghalaya-barak") {
            return {
              ...s,
              status: "REROUTED_ACTIVE",
              etaMinutes: s.etaOriginalMinutes + s.rerouteInfo.deltaEtaMinutes,
              activeRouteName: s.rerouteInfo.alternateCorridorName,
              notice: "AI Re-routing Activated: Diverting via NH-27 Haflong Expressway (+55 min)",
            };
          }
          return s;
        })
      );

      // 3. Add fresh active incident
      const newInc = {
        id: `INC-SIM-SONAPUR-${Date.now()}`,
        corridorId: "nh-6-meghalaya-barak",
        corridorCode: "NH-6",
        title: "⚡ SIMULATION: Sonapur Tunnel Landslide Blockage (KM 141.2)",
        chainage: "KM 141.2",
        lat: 25.1167,
        lng: 92.3556,
        severity: 10,
        hazardType: "Landslide",
        timestamp: new Date().toISOString(),
        officerName: "Command Tower AI Simulator",
        agency: "NER-LRP Automated Grid",
        officerBadge: "AI-SIM-01",
        description: "Simulated 3,800m³ scree avalanche. Highway blocked. Reroute protocols triggered.",
        debrisVolumeCubicM: 3800,
        blockageLengthM: 140,
        estimatedClearanceHours: 5.5,
        status: "SYNCED",
        isBlockageActive: true,
        photoUrl: "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80",
        alternateAdvice: "NH-27 Haflong East-West bypass active for all critical medical & relief convoys.",
      };

      setIncidents((prev) => [newInc, ...prev.filter((i) => !i.id.startsWith("INC-SIM"))]);

      setSimulationToast({
        title: "⚡ NH-6 Sonapur Landslide Triggered!",
        description: "Corridor blocked. AI rerouted 2 Critical Medical consignments via NH-27 bypass (+55m ETA, +76% safety factor).",
        type: "danger",
      });
    } else if (scenarioKey === "kalijhora-flash-flood") {
      setCorridors((prev) =>
        prev.map((c) => {
          if (c.id === "nh-10-sikkim-artery") {
            return {
              ...c,
              status: "blocked",
              riskScore: 94,
              blockageReason: "Teesta River Flood Inundation at Kalijhora",
              explanation: {
                ...c.explanation,
                rainfall48h: 290,
                soilMoisture: 95,
              },
            };
          }
          return c;
        })
      );

      setShipments((prev) =>
        prev.map((s) => {
          if (s.corridorId === "nh-10-sikkim-artery") {
            return {
              ...s,
              status: "REROUTED_ACTIVE",
              etaMinutes: s.etaOriginalMinutes + s.rerouteInfo.deltaEtaMinutes,
              activeRouteName: s.rerouteInfo.alternateCorridorName,
              notice: "AI Re-routing Activated: Diverting via Lava-Gorubathan Ridge Road (+90 min)",
            };
          }
          return s;
        })
      );

      setSimulationToast({
        title: "⚡ NH-10 Kalijhora Flash Flood Triggered!",
        description: "Teesta basin overflowed. Sikkim lifeline diverted to Lava-Gorubathan crest route.",
        type: "danger",
      });
    } else if (scenarioKey === "chumukedima-mudslide") {
      setCorridors((prev) =>
        prev.map((c) => {
          if (c.id === "nh-29-nagaland-corridor") {
            return {
              ...c,
              status: "warning",
              riskScore: 82,
              blockageReason: "Chumukedima Mudslide & Rockfall (Single-lane restricted)",
            };
          }
          return c;
        })
      );

      setShipments((prev) =>
        prev.map((s) => {
          if (s.corridorId === "nh-29-nagaland-corridor" && s.priority === "PRIORITY_RELIEF") {
            return {
              ...s,
              status: "REROUTED_ACTIVE",
              etaMinutes: s.etaOriginalMinutes + s.rerouteInfo.deltaEtaMinutes,
              activeRouteName: s.rerouteInfo.alternateCorridorName,
            };
          }
          return s;
        })
      );

      setSimulationToast({
        title: "⚡ NH-29 Chumukedima Mudslide Activated!",
        description: "Nagaland artery placed on Warning status. Multi-axle FCI grain trucks rerouted to Bokajan-Wokha ridge.",
        type: "warning",
      });
    } else if (scenarioKey === "monsoon-48h-inundation") {
      setCorridors((prev) =>
        prev.map((c) => ({
          ...c,
          status: c.id === "nh-6-meghalaya-barak" || c.id === "nh-10-sikkim-artery" ? "blocked" : "warning",
          riskScore: Math.min(98, c.riskScore + 45),
        }))
      );

      setWeatherHotspots((prev) =>
        prev.map((w) => ({
          ...w,
          rainfall24h: Math.round(w.rainfall24h * 1.6),
          landslideRisk: Math.min(99, w.landslideRisk + 18),
        }))
      );

      setShipments((prev) =>
        prev.map((s) => ({
          ...s,
          status: "REROUTED_ACTIVE",
          etaMinutes: s.etaOriginalMinutes + (s.rerouteInfo ? s.rerouteInfo.deltaEtaMinutes : 45),
          notice: "Regional Monsoon Red Alert: Priority Emergency Speed Enforced",
        }))
      );

      setSimulationToast({
        title: "⚡ NER-Wide 48h Monsoon Inundation Simulated!",
        description: "Precipitation surged by 160%. 4 key corridors escalated to Critical / Warning. All fleet units placed on high-alert reroute.",
        type: "danger",
      });
    }
  };

  // Reset all corridors & normalize
  const resetCorridors = () => {
    setActiveSimulation(null);
    setCorridors(NER_CORRIDORS);
    setShipments(INITIAL_SHIPMENTS);
    setIncidents(INITIAL_FIELD_INCIDENTS);
    setWeatherHotspots(WEATHER_HOTSPOTS);
    setSimulationToast({
      title: "🔄 Network Normalized",
      description: "All highway corridors, weather feeds, and shipment schedules reset to standard operational telemetry.",
      type: "success",
    });
  };

  // Manual Reroute Trigger for a specific shipment
  const manualRerouteShipment = (shipmentId) => {
    setShipments((prev) =>
      prev.map((s) => {
        if (s.id === shipmentId) {
          const isCurrentlyRerouted = s.status === "REROUTED_ACTIVE";
          return {
            ...s,
            status: isCurrentlyRerouted ? "ON_PRIMARY_ROUTE" : "REROUTED_ACTIVE",
            etaMinutes: isCurrentlyRerouted
              ? s.etaOriginalMinutes
              : s.etaOriginalMinutes + (s.rerouteInfo?.deltaEtaMinutes || 45),
            activeRouteName: isCurrentlyRerouted ? s.corridorName : s.rerouteInfo?.alternateCorridorName,
          };
        }
        return s;
      })
    );
  };

  // Field Officer: Submit new incident (handles offline buffer vs online sync)
  const submitIncidentReport = async (reportData) => {
    if (isOfflineSimulated) {
      // Buffer offline
      const buffered = await offlineStorage.queueIncident(reportData);
      setIncidents((prev) => [buffered, ...prev]);
      await refreshPendingCount();
      return { success: true, offline: true, item: buffered };
    } else {
      // Submit directly online
      const liveItem = {
        ...reportData,
        id: reportData.id || `INC-${Date.now()}`,
        status: "SYNCED",
        timestamp: new Date().toISOString(),
      };
      await apiService.submitIncident(liveItem);
      setIncidents((prev) => [liveItem, ...prev]);
      return { success: true, offline: false, item: liveItem };
    }
  };

  // Toggle Simulated Offline Mode & Trigger Auto-Sync when back online
  const toggleOfflineMode = async () => {
    const nextState = !isOfflineSimulated;
    setIsOfflineSimulated(nextState);

    if (!nextState) {
      // Switching from offline to online: Trigger sync
      setIsSyncing(true);
      const pendingItems = await offlineStorage.getPendingQueue();
      if (pendingItems.length > 0) {
        await apiService.syncBatchIncidents(pendingItems);
        await offlineStorage.markAllSynced();
        // Update state
        setIncidents((prev) =>
          prev.map((item) => ({ ...item, status: "SYNCED" }))
        );
        await refreshPendingCount();
      }
      setTimeout(() => {
        setIsSyncing(false);
      }, 900);
    }
  };

  return (
    <LogisticsContext.Provider
      value={{
        corridors,
        setCorridors,
        shipments,
        incidents,
        weatherHotspots,
        activeSimulation,
        simulationToast,
        setSimulationToast,
        triggerScenario,
        resetCorridors,
        manualRerouteShipment,
        isOfflineSimulated,
        toggleOfflineMode,
        pendingQueueCount,
        isSyncing,
        submitIncidentReport,
        selectedCorridor,
        setSelectedCorridor,
        mapLayers,
        setMapLayers,
        activeTab,
        setActiveTab,
        backendStatus,
        averageRisk,
        criticalShipmentsCount,
        activeAlertsCount,
      }}
    >
      {children}
    </LogisticsContext.Provider>
  );
};

export const useLogistics = () => {
  const context = useContext(LogisticsContext);
  if (!context) {
    throw new Error("useLogistics must be used within a LogisticsProvider");
  }
  return context;
};
