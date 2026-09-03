import React, { useState } from "react";
import { useLogistics } from "../context/LogisticsContext";
import {
  Truck,
  ShieldAlert,
  Navigation,
  CheckCircle2,
  AlertCircle,
  Thermometer,
  Gauge,
  Phone,
  ArrowRight,
  Filter,
  MapPin,
  Clock,
  Radio,
  ExternalLink,
  ChevronRight,
} from "lucide-react";

export const ShipmentTracker = () => {
  const { shipments, manualRerouteShipment, setActiveTab } = useLogistics();
  const [filterPriority, setFilterPriority] = useState("ALL");
  const [expandedId, setExpandedId] = useState(null);

  const filteredShipments = shipments.filter((s) => {
    if (filterPriority === "ALL") return true;
    return s.priority === filterPriority;
  });

  const criticalCount = shipments.filter((s) => s.priority === "CRITICAL_MEDICAL").length;
  const reroutedCount = shipments.filter((s) => s.status === "REROUTED_ACTIVE").length;

  return (
    <div className="space-y-6">
      {/* Fleet Executive Summary Bar */}
      <div className="bg-[#0b1120] border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">
                Cargo Prioritization & Fleet Re-planning Grid
              </h2>
              <p className="text-xs text-slate-400">
                Dynamic algorithmic corridor rerouting prioritizing cryogenic oxygen, cold-chain vaccines & essential relief convoys.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={() => setFilterPriority("ALL")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              filterPriority === "ALL"
                ? "bg-slate-700 text-white font-bold"
                : "bg-slate-800/80 text-slate-300 hover:bg-slate-700"
            }`}
          >
            All Fleet ({shipments.length})
          </button>

          <button
            onClick={() => setFilterPriority("CRITICAL_MEDICAL")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
              filterPriority === "CRITICAL_MEDICAL"
                ? "bg-cyan-500 text-slate-950 font-bold shadow-neon-cyan"
                : "bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/20"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            Critical Medical ({criticalCount})
          </button>

          <button
            onClick={() => setFilterPriority("PRIORITY_RELIEF")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              filterPriority === "PRIORITY_RELIEF"
                ? "bg-amber-500 text-slate-950 font-bold shadow-neon-amber"
                : "bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20"
            }`}
          >
            Disaster Relief
          </button>

          <button
            onClick={() => setFilterPriority("STANDARD_BULK")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              filterPriority === "STANDARD_BULK"
                ? "bg-slate-600 text-white font-bold"
                : "bg-slate-800 text-slate-400 hover:bg-slate-700"
            }`}
          >
            Standard Bulk
          </button>
        </div>
      </div>

      {/* Shipments List */}
      <div className="space-y-3">
        {filteredShipments.map((shipment) => {
          const isCritical = shipment.priority === "CRITICAL_MEDICAL";
          const isRelief = shipment.priority === "PRIORITY_RELIEF";
          const isRerouted = shipment.status === "REROUTED_ACTIVE";
          const isExpanded = expandedId === shipment.id;

          return (
            <div
              key={shipment.id}
              className={`bg-[#0f172a] rounded-2xl border transition-all overflow-hidden ${
                isRerouted
                  ? "border-amber-500/50 shadow-neon-amber"
                  : isCritical
                  ? "border-cyan-500/40 hover:border-cyan-500/70"
                  : "border-slate-800 hover:border-slate-700"
              }`}
            >
              {/* Main Card Content */}
              <div className="p-4 sm:p-5">
                {/* 1. Header Bar: Tags & Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-bold text-xs text-slate-300 bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700">
                      {shipment.id}
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-100 bg-slate-900 px-2.5 py-1 rounded-md border border-slate-800">
                      {shipment.vehicleNo}
                    </span>

                    {/* Priority Badge */}
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase ${
                        isCritical
                          ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/50"
                          : isRelief
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/50"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {shipment.priorityLabel}
                    </span>

                    {/* Route Status Tag */}
                    {isRerouted ? (
                      <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono text-[10px] px-2.5 py-1 rounded-full font-bold flex items-center gap-1 animate-pulse">
                        <Navigation className="w-3 h-3" />
                        REROUTED (+{shipment.rerouteInfo?.deltaEtaMinutes || 45}m)
                      </span>
                    ) : (
                      <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono text-[10px] px-2.5 py-1 rounded-full font-bold">
                        PRIMARY ROUTE
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => manualRerouteShipment(shipment.id)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm ${
                        isRerouted
                          ? "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                          : "bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 shadow-neon-emerald"
                      }`}
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>{isRerouted ? "Revert Route" : "Reroute with Safety"}</span>
                    </button>

                    <button
                      onClick={() => setExpandedId(isExpanded ? null : shipment.id)}
                      className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                      title="Toggle Full Telemetry & Driver Details"
                    >
                      <ChevronRight
                        className={`w-4 h-4 transition-transform duration-200 ${
                          isExpanded ? "rotate-90 text-cyan-400" : ""
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* 2. Title & Cargo Line */}
                <div className="py-3">
                  <h3 className="text-sm sm:text-base font-bold text-slate-100 mb-1">
                    {shipment.title}
                  </h3>
                  <div className="text-xs text-slate-400 flex flex-wrap items-center gap-1.5">
                    <span className="text-slate-300 font-medium">{shipment.cargoType}</span>
                    <span>·</span>
                    <span className="text-slate-400">{shipment.carrier}</span>
                  </div>
                </div>

                {/* 3. Responsive Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {/* Box A: Origin & Destination */}
                  <div className="flex items-center justify-between gap-3 bg-slate-950/70 border border-slate-800/90 p-3 rounded-xl">
                    <div className="space-y-0.5 flex-1 min-w-0">
                      <div className="text-slate-500 text-[10px] font-medium uppercase tracking-wider">Origin</div>
                      <div className="font-semibold text-slate-200 truncate" title={shipment.origin}>
                        {shipment.origin}
                      </div>
                    </div>
                    <div className="p-1 rounded-full bg-slate-900 border border-slate-800 flex-shrink-0">
                      <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <div className="space-y-0.5 flex-1 min-w-0 text-right">
                      <div className="text-slate-500 text-[10px] font-medium uppercase tracking-wider">Destination</div>
                      <div className="font-semibold text-slate-200 truncate" title={shipment.destination}>
                        {shipment.destination}
                      </div>
                    </div>
                  </div>

                  {/* Box B: Telemetry (Temp, Speed, ETA) */}
                  <div className="grid grid-cols-3 gap-2 bg-slate-950/70 border border-slate-800/90 p-3 rounded-xl">
                    <div>
                      <div className="text-slate-500 text-[10px] flex items-center gap-1">
                        <Thermometer className="w-3 h-3 text-cyan-400" />
                        <span>Temp</span>
                      </div>
                      <div className="font-mono font-bold text-cyan-300 text-xs mt-0.5">
                        {shipment.temperature}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-500 text-[10px] flex items-center gap-1">
                        <Gauge className="w-3 h-3 text-amber-400" />
                        <span>Speed</span>
                      </div>
                      <div className="font-mono font-bold text-amber-300 text-xs mt-0.5">
                        {shipment.speedKmh} km/h
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-500 text-[10px] flex items-center gap-1">
                        <Clock className="w-3 h-3 text-emerald-400" />
                        <span>ETA</span>
                      </div>
                      <div className="font-mono font-bold text-emerald-300 text-xs mt-0.5">
                        {Math.floor(shipment.etaMinutes / 60)}h {shipment.etaMinutes % 60}m
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notice Alert if rerouted */}
                {shipment.notice && (
                  <div className="mt-3 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-400" />
                    <span>{shipment.notice}</span>
                  </div>
                )}
              </div>

              {/* Expanded Detailed Diagnostics Drawer */}
              {isExpanded && (
                <div className="border-t border-slate-800/80 bg-slate-950/70 p-4 sm:p-5 text-xs grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Column 1: Driver & Dispatch */}
                  <div className="space-y-2">
                    <div className="font-semibold text-slate-300 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Driver Telephony & NavIC</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Driver:</span>
                        <span className="font-semibold text-slate-200">{shipment.driverName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Phone:</span>
                        <span className="font-mono text-emerald-400">{shipment.driverPhone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Current Checkpoint:</span>
                        <span className="font-mono text-cyan-300">
                          {shipment.currentLocationName}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Column 2: Alternate Route Comparison */}
                  <div className="space-y-2">
                    <div className="font-semibold text-slate-300 flex items-center gap-1.5">
                      <Navigation className="w-3.5 h-3.5 text-cyan-400" />
                      <span>AI Corridor Optimization</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Assigned Bypass:</span>
                        <span className="font-semibold text-slate-200">
                          {shipment.rerouteInfo?.alternateCorridorName || "Standard Bypass"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Extra Distance:</span>
                        <span className="font-mono text-amber-400">
                          +{shipment.rerouteInfo?.deltaDistanceKm || 35} km
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Disruption Resilience:</span>
                        <span className="font-mono text-emerald-400 font-bold">
                          {shipment.rerouteInfo?.safetyGainScore || "+80% Hazard Free"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Column 3: Vehicle Hardware Telemetry */}
                  <div className="space-y-2">
                    <div className="font-semibold text-slate-300 flex items-center gap-1.5">
                      <Gauge className="w-3.5 h-3.5 text-amber-400" />
                      <span>CAN-Bus Telemetry</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5 font-mono">
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-sans">Fuel Level:</span>
                        <span className="text-emerald-400">
                          {shipment.telemetry?.fuelLevel || 82}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-sans">NavIC Precision:</span>
                        <span className="text-cyan-300">
                          {shipment.telemetry?.gpsAccuracyM || 2.0}m (Lock)
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-sans">Satellite Lock:</span>
                        <span className="text-slate-200">
                          {shipment.telemetry?.satelliteFix || "8 Sats"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
