import React from "react";
import { useLogistics } from "../context/LogisticsContext";
import {
  X,
  Sparkles,
  TrendingUp,
  CloudRain,
  Mountain,
  Droplets,
  ShieldAlert,
  Compass,
  ArrowRight,
  Layers,
  CheckCircle,
} from "lucide-react";

export const RiskExplainabilityModal = () => {
  const { selectedCorridor, setSelectedCorridor, triggerScenario, setActiveTab } = useLogistics();

  if (!selectedCorridor) return null;

  const expl = selectedCorridor.explanation || {
    rainfall48h: 112,
    slopeAngle: 42.5,
    soilMoisture: 78,
    susceptibility: "Extreme High (GSI Zone V)",
    shapFactors: [
      { name: "48h Rain Intensity", value: 38, positive: true },
      { name: "Steep Slope Angle (>40°)", value: 32, positive: true },
      { name: "Overburden Saturation", value: 22, positive: true },
      { name: "Structural Reinforcement", value: 15, positive: false },
    ],
  };

  return (
    <div className="fixed inset-0 z-[2000] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0b1120] border border-slate-700/80 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in text-xs">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-start justify-between gap-4 sticky top-0 bg-[#0b1120]/95 backdrop-blur z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <Sparkles className="w-4 h-4" />
              </span>
              <h3 className="text-base font-bold text-slate-100">
                Explainable AI (XAI) Corridor Risk Breakdown
              </h3>
            </div>
            <p className="text-slate-400 text-xs mt-0.5 font-mono">
              {selectedCorridor.name} ({selectedCorridor.code})
            </p>
          </div>

          <button
            onClick={() => setSelectedCorridor(null)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 space-y-5">
          {/* Risk Score Summary Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-[#0f172a] border border-slate-800">
              <div className="text-slate-400 text-[10px] uppercase font-semibold">
                Dynamic Risk Score
              </div>
              <div
                className={`text-xl font-bold font-mono mt-1 ${
                  selectedCorridor.riskScore > 60
                    ? "text-red-400"
                    : selectedCorridor.riskScore > 30
                    ? "text-amber-400"
                    : "text-emerald-400"
                }`}
              >
                {selectedCorridor.riskScore}%
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#0f172a] border border-slate-800">
              <div className="text-slate-400 text-[10px] uppercase font-semibold flex items-center gap-1">
                <CloudRain className="w-3 h-3 text-cyan-400" />
                <span>48h Rainfall</span>
              </div>
              <div className="text-xl font-bold font-mono text-cyan-300 mt-1">
                {expl.rainfall48h} mm
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#0f172a] border border-slate-800">
              <div className="text-slate-400 text-[10px] uppercase font-semibold flex items-center gap-1">
                <Mountain className="w-3 h-3 text-amber-400" />
                <span>Slope Gradient</span>
              </div>
              <div className="text-xl font-bold font-mono text-amber-300 mt-1">
                {expl.slopeAngle}°
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#0f172a] border border-slate-800">
              <div className="text-slate-400 text-[10px] uppercase font-semibold flex items-center gap-1">
                <Droplets className="w-3 h-3 text-indigo-400" />
                <span>Soil Saturation</span>
              </div>
              <div className="text-xl font-bold font-mono text-indigo-300 mt-1">
                {expl.soilMoisture}%
              </div>
            </div>
          </div>

          {/* Geological Formation */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
            <div className="text-slate-400 font-semibold text-[11px]">
              Geological Survey of India (GSI) Susceptibility:
            </div>
            <div className="text-slate-200 font-medium">{expl.susceptibility}</div>
          </div>

          {/* SHAP Feature Contribution Bars */}
          <div className="space-y-3">
            <div className="font-bold text-slate-200 flex items-center justify-between">
              <span>SHAP Factor Attribution (AI Model Weights)</span>
              <span className="text-slate-500 font-mono text-[10px]">
                Ensemble XGBoost + InSAR Telemetry
              </span>
            </div>

            <div className="space-y-2.5">
              {expl.shapFactors?.map((factor, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-300">{factor.name}</span>
                    <span
                      className={`font-mono font-bold ${
                        factor.positive ? "text-red-400" : "text-emerald-400"
                      }`}
                    >
                      {factor.positive ? `+${factor.value}% Risk` : `-${factor.value}% Mitigation`}
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        factor.positive ? "bg-red-500" : "bg-emerald-500"
                      }`}
                      style={{ width: `${factor.value}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mitigation Protocol */}
          <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-2">
            <div className="font-bold text-emerald-300 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Recommended Logistics Resilience Protocol</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              For High-Risk trigger thresholds (&gt;50%), route critical medical oxygen and vaccine
              consignments to the designated bypass artery. Dispatch BRO spotter drones to monitor
              toe-slope erosion.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 flex justify-end gap-2 bg-[#0b1120]">
          <button
            onClick={() => setSelectedCorridor(null)}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
