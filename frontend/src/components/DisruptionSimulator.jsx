import React from "react";
import { useLogistics } from "../context/LogisticsContext";
import {
  Sparkles,
  Zap,
  RotateCcw,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  ShieldAlert,
  Clock,
  Compass,
  CheckCircle2,
  Share2,
  Volume2,
} from "lucide-react";

export const DisruptionSimulator = () => {
  const {
    activeSimulation,
    simulationToast,
    triggerScenario,
    resetCorridors,
    corridors,
    shipments,
    setActiveTab,
  } = useLogistics();

  const scenarios = [
    {
      id: "sonapur-landslide",
      title: "NH-6 Sonapur Tunnel Landslide",
      location: "East Jaintia Hills, Meghalaya (KM 141.2)",
      severity: "CRITICAL BLOCKAGE",
      badgeColor: "bg-red-500/20 text-red-400 border-red-500/40",
      description:
        "Trigger 3,800m³ landslide on NH-6 lifeline connecting Assam to Silchar, Tripura, and Mizoram. AI automatically triggers East-West NH-27 bypass via Haflong.",
      impact: {
        affectedKm: "485 km axis",
        rerouteTime: "+55 Mins ETA",
        safetyGain: "+76% Slide Avoidance",
        vesselsDiverted: "2 Medical Tankers",
      },
    },
    {
      id: "kalijhora-flash-flood",
      title: "NH-10 Kalijhora Teesta Flood Surge",
      location: "Kalijhora Gorge, WB / Sikkim Border (KM 26.5)",
      severity: "EXTREME WATER INUNDATION",
      badgeColor: "bg-red-500/20 text-red-400 border-red-500/40",
      description:
        "Simulate Teesta River overtopping carriageway. Cut off main Sikkim artery and pivot NDRF relief kits via Lava-Gorubathan ridge route.",
      impact: {
        affectedKm: "115 km axis",
        rerouteTime: "+90 Mins ETA",
        safetyGain: "+91% Ridge Elevation",
        vesselsDiverted: "1 Relief Convoy",
      },
    },
    {
      id: "chumukedima-mudslide",
      title: "NH-29 Chumukedima Escarpment Mudslide",
      location: "Chumukedima, Nagaland (KM 82.3)",
      severity: "WARNING / RESTRICTED",
      badgeColor: "bg-amber-500/20 text-amber-400 border-amber-500/40",
      description:
        "Trigger Disang shale mudflow causing single-lane restriction. Commercial multi-axle freight diverted to Bokajan-Wokha ridge bypass.",
      impact: {
        affectedKm: "210 km axis",
        rerouteTime: "+105 Mins ETA",
        safetyGain: "+68% Shale Bypass",
        vesselsDiverted: "1 Grain Fleet",
      },
    },
    {
      id: "monsoon-48h-inundation",
      title: "Simulate Heavy 48h Monsoon Inundation",
      location: "NER-Wide (Cherrapunji, Kalijhora, Pasighat)",
      severity: "REGIONAL RED ALERT",
      badgeColor: "bg-red-600/20 text-red-300 border-red-500/60",
      description:
        "Simulate regional depression with 180-250mm torrential precipitation. Escalate all 7 monitored corridors to Elevated & Critical risk tiers.",
      impact: {
        affectedKm: "4,820 km Total",
        rerouteTime: "+2.5 to +4 Hours",
        safetyGain: "High Vigilance Escort",
        vesselsDiverted: "All 5 Fleet Units",
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Simulation Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-[#131b2e] to-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30">
                <Sparkles className="w-5 h-5" />
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-slate-100">
                AI Disruption Simulation Engine & Dynamic Rerouting
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400">
              Stress-test the Northeast supply chain network against extreme monsoon disasters, active landslides, and river surges in real-time.
            </p>
          </div>

          {/* Reset Action */}
          <button
            onClick={resetCorridors}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 hover:border-slate-600 font-semibold text-xs transition-all shadow-md active:scale-95"
          >
            <RotateCcw className="w-4 h-4 text-emerald-400" />
            <span>Reset Corridors & Normalize</span>
          </button>
        </div>

        {/* Live Simulation Toast */}
        {simulationToast && (
          <div
            className={`mt-4 p-3 rounded-xl border flex items-start gap-3 animate-fade-in ${
              simulationToast.type === "danger"
                ? "bg-red-950/40 border-red-500/50 text-red-200"
                : simulationToast.type === "warning"
                ? "bg-amber-950/40 border-amber-500/50 text-amber-200"
                : "bg-emerald-950/40 border-emerald-500/50 text-emerald-200"
            }`}
          >
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1 text-xs">
              <div className="font-bold">{simulationToast.title}</div>
              <div className="mt-0.5 text-slate-300">{simulationToast.description}</div>
            </div>
            <button
              onClick={() => setActiveTab("map")}
              className="px-2.5 py-1 rounded bg-black/40 hover:bg-black/60 text-white font-mono text-[11px] flex items-center gap-1"
            >
              <span>View Map</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* 1-Click Simulation Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {scenarios.map((scenario) => {
          const isActive = activeSimulation === scenario.id;

          return (
            <div
              key={scenario.id}
              className={`relative bg-[#0f172a] rounded-2xl border p-5 transition-all flex flex-col justify-between ${
                isActive
                  ? "border-amber-500/80 shadow-neon-amber bg-[#141d33]"
                  : "border-slate-800 hover:border-slate-700"
              }`}
            >
              <div>
                {/* Card Header */}
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-100 text-sm sm:text-base">
                        {scenario.title}
                      </span>
                    </div>
                    <div className="text-slate-400 text-xs mt-0.5 font-mono">
                      📍 {scenario.location}
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${scenario.badgeColor}`}
                  >
                    {scenario.severity}
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  {scenario.description}
                </p>

                {/* Metrics Breakdown Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] mb-4">
                  <div>
                    <div className="text-slate-500 text-[10px]">Axis Length</div>
                    <div className="font-mono font-bold text-slate-200">
                      {scenario.impact.affectedKm}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500 text-[10px]">Delta ETA</div>
                    <div className="font-mono font-bold text-amber-400">
                      {scenario.impact.rerouteTime}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500 text-[10px]">Safety Gain</div>
                    <div className="font-mono font-bold text-emerald-400">
                      {scenario.impact.safetyGain}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500 text-[10px]">Target Fleet</div>
                    <div className="font-mono font-bold text-cyan-300">
                      {scenario.impact.vesselsDiverted}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => triggerScenario(scenario.id)}
                  className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-98 ${
                    isActive
                      ? "bg-amber-500 text-slate-950 shadow-neon-amber"
                      : "bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40"
                  }`}
                >
                  <Zap className="w-4 h-4" />
                  <span>
                    {isActive ? "Simulation Active (Click to Refresh)" : "Trigger 1-Click Scenario"}
                  </span>
                </button>

                {isActive && (
                  <button
                    onClick={() => setActiveTab("broadcast")}
                    className="p-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40"
                    title="Send Multilingual Emergency Broadcast"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
