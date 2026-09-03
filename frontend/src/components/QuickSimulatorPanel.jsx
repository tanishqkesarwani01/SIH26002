import React from "react";
import { useLogistics } from "../context/LogisticsContext";
import {
  Zap,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

export const QuickSimulatorPanel = () => {
  const {
    activeSimulation,
    simulationToast,
    triggerScenario,
    resetCorridors,
    setActiveTab,
  } = useLogistics();

  const scenarios = [
    {
      id: "sonapur-landslide",
      title: "NH-6 Sonapur Landslide",
      badge: "CRITICAL BLOCK",
      badgeColor: "bg-red-500/20 text-red-400 border-red-500/40",
      location: "East Jaintia Hills, Meghalaya",
      shortDesc: "3,800m³ slide blocks Barak lifeline. AI diverts Medical Oxygen via NH-27 Haflong bypass (+55m).",
      rerouteDelta: "+55 Mins",
      safetyGain: "+76% Safety",
    },
    {
      id: "kalijhora-flash-flood",
      title: "NH-10 Kalijhora Flood",
      badge: "EXTREME SURGE",
      badgeColor: "bg-red-500/20 text-red-400 border-red-500/40",
      location: "Teesta Gorge, Sikkim Border",
      shortDesc: "Teesta overtopping cuts off Gangtok artery. NDRF relief kits diverted via Lava-Gorubathan ridge.",
      rerouteDelta: "+90 Mins",
      safetyGain: "+91% Safety",
    },
    {
      id: "chumukedima-mudslide",
      title: "NH-29 Chumukedima Mudslide",
      badge: "RESTRICTED",
      badgeColor: "bg-amber-500/20 text-amber-400 border-amber-500/40",
      location: "Chumukedima, Nagaland",
      shortDesc: "Disang shale mudflow restricts traffic. Grain convoys diverted via Bokajan-Wokha ridge.",
      rerouteDelta: "+105 Mins",
      safetyGain: "+68% Safety",
    },
    {
      id: "monsoon-48h-inundation",
      title: "48h Regional Monsoon Surge",
      badge: "RED ALERT",
      badgeColor: "bg-red-600/20 text-red-300 border-red-500/60",
      location: "NER-Wide (Cherrapunji, Kalijhora)",
      shortDesc: "180-250mm torrential rain escalates hazard scores across all 7 state highway gateways.",
      rerouteDelta: "+2.5 to +4 Hours",
      safetyGain: "High Vigilance",
    },
  ];

  return (
    <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col justify-between h-[680px] lg:h-[720px]">
      {/* Panel Header */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-sm">
                1-Click Disruption Triggers
              </h3>
              <p className="text-[11px] text-slate-400">
                Simulate mountain hazards & watch real-time AI rerouting
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab("simulator")}
            className="text-amber-400 hover:text-amber-300 text-xs font-semibold flex items-center gap-1 hover:underline"
          >
            <span>Full Studio</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Live Active Simulation Banner (if triggered) */}
        {simulationToast && (
          <div className="mt-3 p-3 rounded-xl bg-gradient-to-r from-red-950/70 to-slate-900 border border-red-500/50 shadow-lg text-xs space-y-1.5 animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="font-bold text-red-400 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 animate-bounce" />
                {simulationToast.title}
              </span>
              <span className="bg-red-500/20 text-red-300 font-mono text-[10px] px-1.5 py-0.5 rounded font-bold">
                SIMULATION ACTIVE
              </span>
            </div>
            <p className="text-slate-300 text-[11px] leading-tight">
              {simulationToast.message}
            </p>
            <div className="flex items-center gap-2 pt-1 font-mono text-[10px] text-emerald-400">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>{simulationToast.action}</span>
            </div>
          </div>
        )}
      </div>

      {/* Scenario Trigger Cards List */}
      <div className="my-3 space-y-2.5 overflow-y-auto pr-1 flex-1 custom-scrollbar">
        {scenarios.map((sc) => {
          const isTriggered = activeSimulation === sc.id;
          return (
            <div
              key={sc.id}
              className={`p-3 rounded-xl border transition-all ${
                isTriggered
                  ? "bg-slate-800/90 border-amber-500/60 shadow-md shadow-amber-950/30"
                  : "bg-slate-900/80 hover:bg-slate-800/80 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="font-semibold text-slate-100 text-xs flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  <span>{sc.title}</span>
                </div>
                <span
                  className={`text-[9px] font-bold font-mono px-1.5 py-0.5 rounded border whitespace-nowrap ${sc.badgeColor}`}
                >
                  {sc.badge}
                </span>
              </div>

              <div className="text-[10px] text-slate-400 mb-1.5 font-mono">
                📍 {sc.location}
              </div>

              <p className="text-[11px] text-slate-300 leading-snug mb-2">
                {sc.shortDesc}
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[10px]">
                <div className="flex items-center gap-2 font-mono text-slate-400">
                  <span className="text-amber-300 font-semibold">{sc.rerouteDelta}</span>
                  <span>·</span>
                  <span className="text-emerald-400 font-semibold">{sc.safetyGain}</span>
                </div>

                <button
                  onClick={() => triggerScenario(sc.id)}
                  disabled={isTriggered}
                  className={`px-3 py-1 rounded-lg font-semibold text-xs transition-all flex items-center gap-1 shadow-sm ${
                    isTriggered
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default"
                      : "bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold hover:shadow-neon-amber"
                  }`}
                >
                  {isTriggered ? (
                    <>
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Triggered</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-3 h-3" />
                      <span>Trigger Event</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Panel Footer: Reset Controls */}
      <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
        <span className="text-[11px] text-slate-400 font-mono">
          Status: {activeSimulation ? "⚡ Disrupted" : "🟢 Normal Monitoring"}
        </span>

        <button
          onClick={resetCorridors}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Grid</span>
        </button>
      </div>
    </div>
  );
};
