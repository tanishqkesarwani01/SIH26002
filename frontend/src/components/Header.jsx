import React, { useState, useEffect } from "react";
import { useLogistics } from "../context/LogisticsContext";
import {
  Activity,
  Radio,
  Clock,
  Wifi,
  WifiOff,
  AlertTriangle,
  Truck,
  ShieldCheck,
  Compass,
  Layers,
  Sparkles,
  CloudRain,
  Volume2,
} from "lucide-react";

export const Header = () => {
  const {
    averageRisk,
    criticalShipmentsCount,
    activeAlertsCount,
    isOfflineSimulated,
    toggleOfflineMode,
    pendingQueueCount,
    isSyncing,
    setActiveTab,
    activeTab,
  } = useLogistics();

  const [currentTime, setCurrentTime] = useState("");

  // Live IST Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options = {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        day: "2-digit",
        month: "short",
        year: "numeric",
      };
      setCurrentTime(new Intl.DateTimeFormat("en-IN", options).format(now));
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="border-b border-slate-800/80 bg-[#0b1120]">
      {/* Top Banner Bar */}
      <div className="max-w-[1720px] mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Left: Brand & Telemetry */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Compass className="w-5 h-5 animate-spin-slow" />
              <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-ping"></div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold tracking-tight text-slate-100 text-sm sm:text-base">
                  NER-LRP
                </h1>
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px] font-mono font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  LIVE GRID
                </span>
                <span className="hidden md:inline-block text-slate-500 font-mono text-[11px]">
                  v2.4-PROD
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Northeast India Logistics Resilience & Dynamic Corridor Rerouting
              </p>
            </div>
          </div>
        </div>

        {/* Center: Live Data Feeds */}
        <div className="hidden lg:flex items-center gap-4 text-slate-400">
          <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 px-2.5 py-1 rounded-md">
            <CloudRain className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>IMD Doppler Feed:</span>
            <span className="text-cyan-300 font-mono font-medium">REAL-TIME</span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 px-2.5 py-1 rounded-md">
            <Radio className="w-3.5 h-3.5 text-emerald-400" />
            <span>NavIC Constellation:</span>
            <span className="text-emerald-300 font-mono font-medium">9 SATS LOCKED</span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 px-2.5 py-1 rounded-md">
            <Activity className="w-3.5 h-3.5 text-amber-400" />
            <span>Telemetry Latency:</span>
            <span className="text-amber-300 font-mono font-medium">18ms</span>
          </div>
        </div>

        {/* Right: Clock & Offline Mode Simulator Toggle */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 text-slate-300 font-mono bg-slate-900/90 border border-slate-800 px-3 py-1 rounded-md">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{currentTime || "IST Live"}</span>
          </div>

          {/* Offline Mode Toggle Button */}
          <button
            onClick={toggleOfflineMode}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium text-xs transition-all border ${
              isOfflineSimulated
                ? "bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-neon-amber"
                : "bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-600"
            }`}
            title="Simulate remote terrain disconnection to test field PWA IndexedDB sync"
          >
            {isOfflineSimulated ? (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
                <span>Simulated Offline</span>
                {pendingQueueCount > 0 && (
                  <span className="bg-amber-400 text-slate-950 font-mono px-1.5 py-0.2 rounded-full text-[10px] font-bold">
                    {pendingQueueCount}
                  </span>
                )}
              </>
            ) : (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                <span>Field Grid Online</span>
                {isSyncing && (
                  <span className="text-cyan-300 text-[10px] animate-pulse">Syncing...</span>
                )}
              </>
            )}
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="max-w-[1720px] mx-auto px-4 sm:px-6 py-3 border-t border-slate-800/60 bg-slate-950/60">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Card 1: Monitored Corridors */}
          <div
            onClick={() => setActiveTab("map")}
            className="cursor-pointer group bg-[#0f172a]/90 hover:bg-[#1e293b]/90 border border-slate-800/90 hover:border-emerald-500/40 p-3 rounded-xl transition-all shadow-sm"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-slate-400 text-[11px] font-medium uppercase tracking-wider">
                Monitored Corridors
              </span>
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
                <Compass className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-bold font-mono text-slate-100">
                4,820
              </span>
              <span className="text-xs text-slate-400">KM Total</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-emerald-400">
              <ShieldCheck className="w-3 h-3" />
              <span>8 Northeast States · 7 Arteries</span>
            </div>
          </div>

          {/* Card 2: Disruption Risk Index */}
          <div
            onClick={() => setActiveTab("simulator")}
            className="cursor-pointer group bg-[#0f172a]/90 hover:bg-[#1e293b]/90 border border-slate-800/90 hover:border-amber-500/40 p-3 rounded-xl transition-all shadow-sm"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-slate-400 text-[11px] font-medium uppercase tracking-wider">
                Disruption Risk Index
              </span>
              <div
                className={`p-1.5 rounded-lg transition-transform group-hover:scale-110 ${
                  averageRisk > 60
                    ? "bg-red-500/20 text-red-400"
                    : averageRisk > 35
                    ? "bg-amber-500/20 text-amber-400"
                    : "bg-emerald-500/20 text-emerald-400"
                }`}
              >
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span
                className={`text-xl sm:text-2xl font-bold font-mono ${
                  averageRisk > 60
                    ? "text-red-400"
                    : averageRisk > 35
                    ? "text-amber-400"
                    : "text-emerald-400"
                }`}
              >
                {averageRisk}%
              </span>
              <span className="text-xs text-slate-400">
                {averageRisk > 60 ? "CRITICAL" : averageRisk > 35 ? "ELEVATED" : "OPTIMAL"}
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className={`h-full transition-all duration-700 ${
                  averageRisk > 60
                    ? "bg-red-500"
                    : averageRisk > 35
                    ? "bg-amber-500"
                    : "bg-emerald-500"
                }`}
                style={{ width: `${averageRisk}%` }}
              ></div>
            </div>
          </div>

          {/* Card 3: Critical Shipments in Transit */}
          <div
            onClick={() => setActiveTab("fleet")}
            className="cursor-pointer group bg-[#0f172a]/90 hover:bg-[#1e293b]/90 border border-slate-800/90 hover:border-cyan-500/40 p-3 rounded-xl transition-all shadow-sm"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-slate-400 text-[11px] font-medium uppercase tracking-wider">
                Critical Medical Fleet
              </span>
              <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 group-hover:scale-110 transition-transform">
                <Truck className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-bold font-mono text-cyan-300">
                {criticalShipmentsCount}
              </span>
              <span className="text-xs text-slate-400">Active High-Priority</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-cyan-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
              <span>Oxygen Cryo & Vaccine Carriers</span>
            </div>
          </div>

          {/* Card 4: Active Disruption Alerts */}
          <div
            onClick={() => setActiveTab("broadcast")}
            className="cursor-pointer group bg-[#0f172a]/90 hover:bg-[#1e293b]/90 border border-slate-800/90 hover:border-red-500/40 p-3 rounded-xl transition-all shadow-sm"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-slate-400 text-[11px] font-medium uppercase tracking-wider">
                Active Incidents
              </span>
              <div
                className={`p-1.5 rounded-lg transition-transform group-hover:scale-110 ${
                  activeAlertsCount > 0
                    ? "bg-red-500/20 text-red-400"
                    : "bg-emerald-500/20 text-emerald-400"
                }`}
              >
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span
                className={`text-xl sm:text-2xl font-bold font-mono ${
                  activeAlertsCount > 0 ? "text-red-400" : "text-emerald-400"
                }`}
              >
                {activeAlertsCount}
              </span>
              <span className="text-xs text-slate-400">
                {activeAlertsCount > 0 ? "Alerts Broadcast" : "Clear Passage"}
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-400">
              <Volume2 className="w-3 h-3 text-red-400" />
              <span>6 Regional Voice Broadcasts Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="max-w-[1720px] mx-auto px-4 sm:px-6 flex items-center justify-between border-t border-slate-800/40 overflow-x-auto no-scrollbar">
        <div className="flex items-center space-x-1 py-1.5">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === "dashboard"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-neon-emerald"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Command Tower Grid</span>
          </button>

          <button
            onClick={() => setActiveTab("map")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === "map"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-neon-emerald"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Interactive GIS Map</span>
          </button>

          <button
            onClick={() => setActiveTab("simulator")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === "simulator"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-neon-amber"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Disruption Simulator</span>
          </button>

          <button
            onClick={() => setActiveTab("fleet")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === "fleet"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-neon-cyan"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Cargo Prioritization & Fleet</span>
          </button>

          <button
            onClick={() => setActiveTab("field-reporter")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === "field-reporter"
                ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Field Officer PWA (Offline)</span>
            {pendingQueueCount > 0 && (
              <span className="bg-amber-400 text-slate-950 font-mono px-1 rounded-full text-[9px] font-bold">
                {pendingQueueCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("broadcast")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === "broadcast"
                ? "bg-red-500/20 text-red-300 border border-red-500/40 shadow-neon-crimson"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Multilingual Broadcast (6 Langs)</span>
          </button>
        </div>
      </div>
    </header>
  );
};
