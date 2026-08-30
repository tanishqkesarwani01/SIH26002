import React from "react";
import { LogisticsProvider, useLogistics } from "./context/LogisticsContext";
import { Header } from "./components/Header";
import { MapView } from "./components/MapView";
import { DisruptionSimulator } from "./components/DisruptionSimulator";
import { ShipmentTracker } from "./components/ShipmentTracker";
import { FieldReporter } from "./components/FieldReporter";
import { MultilingualAlerts } from "./components/MultilingualAlerts";
import { RiskExplainabilityModal } from "./components/RiskExplainabilityModal";
import {
  Compass,
  Layers,
  Sparkles,
  Truck,
  Radio,
  Volume2,
  AlertTriangle,
  ShieldCheck,
  Zap,
  ArrowRight,
  ExternalLink,
} from "lucide-react";

const MainContent = () => {
  const { activeTab, setActiveTab, activeAlertsCount, corridors, shipments } = useLogistics();

  return (
    <div className="min-h-screen bg-[#070a13] text-slate-100 flex flex-col justify-between">
      <Header />

      <main className="max-w-[1720px] mx-auto px-4 sm:px-6 py-6 w-full flex-1">
        {/* VIEW 1: COMMAND TOWER GRID (Full Executive View) */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            {/* Top Grid: GIS Map (8 cols) + Disruption Simulator Quick Controls (4 cols) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8">
                <MapView />
              </div>

              <div className="lg:col-span-4 space-y-4">
                <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 shadow-xl">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-400" />
                      <h3 className="font-bold text-slate-100 text-sm">
                        1-Click Disruption Triggers
                      </h3>
                    </div>
                    <button
                      onClick={() => setActiveTab("simulator")}
                      className="text-amber-400 hover:text-amber-300 text-[11px] font-semibold flex items-center gap-1"
                    >
                      <span>Full Studio</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>

                  <DisruptionSimulator />
                </div>
              </div>
            </div>

            {/* Bottom Grid: Cargo Fleet Prioritization + Multilingual Alert Quick Access */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7">
                <ShipmentTracker />
              </div>

              <div className="lg:col-span-5">
                <MultilingualAlerts />
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: INTERACTIVE GIS MAP VIEW */}
        {activeTab === "map" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <Compass className="w-5 h-5 text-emerald-400" />
                  <span>High-Precision GIS Logistics & Chokepoint Map</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Real-time monitored corridors, live NavIC vessel telemetry, and Doppler precipitation hotspots.
                </p>
              </div>
            </div>
            <MapView />
          </div>
        )}

        {/* VIEW 3: DISRUPTION SIMULATOR VIEW */}
        {activeTab === "simulator" && <DisruptionSimulator />}

        {/* VIEW 4: CARGO FLEET PRIORITIZATION */}
        {activeTab === "fleet" && <ShipmentTracker />}

        {/* VIEW 5: FIELD OFFICER PWA (OFFLINE-FIRST) */}
        {activeTab === "field-reporter" && <FieldReporter />}

        {/* VIEW 6: MULTILINGUAL EMERGENCY BROADCAST */}
        {activeTab === "broadcast" && <MultilingualAlerts />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#070a13] py-4 text-xs text-slate-500">
        <div className="max-w-[1720px] mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">Northeast India Logistics Resilience Platform (NER-LRP)</span>
            <span>·</span>
            <span>Ministry of Development of North Eastern Region (MDoNER) & NHIDCL</span>
          </div>
          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span className="text-emerald-400">● 9 NavIC SATS ACTIVE</span>
            <span>● IMD DOPPLER 15-MIN REFRESH</span>
          </div>
        </div>
      </footer>

      {/* Explainable AI Modal */}
      <RiskExplainabilityModal />
    </div>
  );
};

export default function App() {
  return (
    <LogisticsProvider>
      <MainContent />
    </LogisticsProvider>
  );
}
