import React, { useState, useEffect, useRef } from "react";
import { useLogistics } from "../context/LogisticsContext";
import {
  Camera,
  MapPin,
  AlertTriangle,
  Upload,
  Wifi,
  WifiOff,
  CheckCircle,
  Clock,
  Shield,
  Send,
  Sparkles,
  RefreshCw,
  Image as ImageIcon,
  CheckCircle2,
  Trash2,
} from "lucide-react";

export const FieldReporter = () => {
  const {
    submitIncidentReport,
    isOfflineSimulated,
    toggleOfflineMode,
    pendingQueueCount,
    isSyncing,
    incidents,
    corridors,
  } = useLogistics();

  // Form State
  const [title, setTitle] = useState("Landslide & Slope Debris on Highway");
  const [corridorId, setCorridorId] = useState("nh-6-meghalaya-barak");
  const [chainage, setChainage] = useState("KM 141.2 (Sonapur Tunnel Section)");
  const [lat, setLat] = useState("25.1167");
  const [lng, setLng] = useState("92.3556");
  const [severity, setSeverity] = useState(8);
  const [hazardType, setHazardType] = useState("Landslide");
  const [officerName, setOfficerName] = useState("Maj. Vikramaditya Das");
  const [agency, setAgency] = useState("Border Roads Organisation (Project Pushpak)");
  const [description, setDescription] = useState(
    "Heavy soil and boulder detachment across both carriageway lanes following continuous downpour. Excavator team alerted."
  );
  const [photoPreview, setPhotoPreview] = useState(
    "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  const fileInputRef = useRef(null);

  // Quick Preset Locations
  const locationPresets = [
    {
      name: "Sonapur Tunnel (NH-6)",
      lat: "25.1167",
      lng: "92.3556",
      corridor: "nh-6-meghalaya-barak",
      chainage: "KM 141.2",
    },
    {
      name: "Kalijhora Teesta (NH-10)",
      lat: "26.9292",
      lng: "88.4697",
      corridor: "nh-10-sikkim-artery",
      chainage: "KM 26.5",
    },
    {
      name: "Chumukedima Pass (NH-29)",
      lat: "25.7950",
      lng: "93.7750",
      corridor: "nh-29-nagaland-corridor",
      chainage: "KM 82.3",
    },
    {
      name: "Bhalukpong Gate (NH-13)",
      lat: "27.0100",
      lng: "92.6500",
      corridor: "nh-15-arunachal-foothills",
      chainage: "KM 54.0",
    },
  ];

  // Quick Photo Presets
  const photoPresets = [
    {
      label: "Mudslide / Scree",
      url: "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80",
    },
    {
      label: "Flood Inundation",
      url: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80",
    },
    {
      label: "Rockfall Debris",
      url: "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=800&q=80",
    },
  ];

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUseCurrentGps = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLat(pos.coords.latitude.toFixed(4));
          setLng(pos.coords.longitude.toFixed(4));
          setFeedbackMessage({
            type: "success",
            text: `📍 GPS Fixed: [${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}]`,
          });
        },
        () => {
          // Fallback to Sonapur
          setLat("25.1167");
          setLng("92.3556");
          setFeedbackMessage({
            type: "info",
            text: "GPS simulated to Sonapur Tunnel Pass (KM 141.2)",
          });
        }
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const report = {
      id: `INC-FIELD-${Date.now()}`,
      title,
      corridorId,
      corridorCode: corridors.find((c) => c.id === corridorId)?.code || "NH-6",
      chainage,
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      severity: parseInt(severity, 10),
      hazardType,
      officerName,
      agency,
      description,
      photoUrl: photoPreview,
      debrisVolumeCubicM: severity * 400,
      blockageLengthM: severity * 15,
      estimatedClearanceHours: (severity * 0.7).toFixed(1),
      isBlockageActive: severity >= 7,
      equipmentDeployed: ["1x Patrol Excavator", "1x Safety Response Unit"],
    };

    const res = await submitIncidentReport(report);

    setIsSubmitting(false);

    if (res.offline) {
      setFeedbackMessage({
        type: "warning",
        text: "⏳ Saved to IndexedDB Offline Queue! When online is restored, report will auto-sync to Command Tower.",
      });
    } else {
      setFeedbackMessage({
        type: "success",
        text: "🟢 Incident Logged & Broadcast to Command Tower in Real-Time!",
      });
    }

    setTimeout(() => {
      setFeedbackMessage(null);
    }, 6000);
  };

  const getSeverityLabel = (val) => {
    if (val <= 3) return "Minor Surface Damage / Puddle";
    if (val <= 6) return "Moderate Debris / Single-Lane Passable";
    if (val <= 8) return "Severe Obstruction / Heavy Debris";
    return "CRITICAL HIGHWAY SEVERANCE (Complete Blockage)";
  };

  return (
    <div className="space-y-6">
      {/* PWA Status Bar */}
      <div className="bg-[#0b1120] border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">
                Offline-First Field Officer PWA Dispatch
              </h2>
              <p className="text-xs text-slate-400">
                Resilient telemetry logging with camera photo capture, GPS coordinate lock, and zero-loss IndexedDB offline sync.
              </p>
            </div>
          </div>
        </div>

        {/* Offline Mode Switcher */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-[11px] text-slate-400">Local DB Storage</div>
            <div className="text-xs font-mono font-bold text-slate-200">
              {pendingQueueCount} Pending Reports
            </div>
          </div>

          <button
            onClick={toggleOfflineMode}
            className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all border shadow-md ${
              isOfflineSimulated
                ? "bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-neon-amber"
                : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-neon-emerald"
            }`}
          >
            {isOfflineSimulated ? (
              <>
                <WifiOff className="w-4 h-4 text-amber-400 animate-pulse" />
                <span>Simulating Offline Mode</span>
              </>
            ) : (
              <>
                <Wifi className="w-4 h-4 text-emerald-400" />
                <span>Field Grid Online</span>
                {isSyncing && <RefreshCw className="w-3.5 h-3.5 text-cyan-400 animate-spin" />}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Grid: Form + Reports List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Field Report Creation (7 cols) */}
        <div className="lg:col-span-7 bg-[#0f172a] border border-slate-800 rounded-2xl p-5 shadow-xl">
          <h3 className="text-base font-bold text-slate-100 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Log Field Incident / Damage Survey</span>
          </h3>

          {feedbackMessage && (
            <div
              className={`mb-4 p-3 rounded-xl border text-xs font-medium flex items-center gap-2 ${
                feedbackMessage.type === "success"
                  ? "bg-emerald-950/50 border-emerald-500/50 text-emerald-300"
                  : feedbackMessage.type === "warning"
                  ? "bg-amber-950/50 border-amber-500/50 text-amber-300"
                  : "bg-cyan-950/50 border-cyan-500/50 text-cyan-300"
              }`}
            >
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{feedbackMessage.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Title & Corridor */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">
                  Incident Title / Headline
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">
                  Target Highway Corridor
                </label>
                <select
                  value={corridorId}
                  onChange={(e) => setCorridorId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
                >
                  {corridors.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Location & GPS Presets */}
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  <span>GPS Coordinate Lock & Location Presets</span>
                </span>
                <button
                  type="button"
                  onClick={handleUseCurrentGps}
                  className="text-emerald-400 hover:text-emerald-300 text-[11px] font-semibold underline"
                >
                  Acquire GPS Fix
                </button>
              </div>

              {/* Quick Presets */}
              <div className="flex flex-wrap gap-1.5">
                {locationPresets.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setLat(p.lat);
                      setLng(p.lng);
                      setCorridorId(p.corridor);
                      setChainage(p.chainage);
                    }}
                    className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-mono border border-slate-700"
                  >
                    {p.name}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-500 text-[10px]">Chainage</label>
                  <input
                    type="text"
                    value={chainage}
                    onChange={(e) => setChainage(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 text-[10px]">Latitude</label>
                  <input
                    type="text"
                    value={lat}
                    onChange={(e) => setLat(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100 font-mono text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-500 text-[10px]">Longitude</label>
                  <input
                    type="text"
                    value={lng}
                    onChange={(e) => setLng(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100 font-mono text-xs"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Hazard Type & Severity Slider */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Hazard Type</label>
                <select
                  value={hazardType}
                  onChange={(e) => setHazardType(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                >
                  <option value="Landslide">Landslide & Mudflow</option>
                  <option value="Flash Flood">Flash Flood & River Spillage</option>
                  <option value="Rockfall">Rockfall & Boulder Dislodgement</option>
                  <option value="Bridge Damage">Bridge Structural Damage / Scour</option>
                  <option value="Road Subsidence">Road Subsidence / Sinking</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">
                  Damage Severity (1 to 10):{" "}
                  <span className="text-amber-400 font-bold font-mono">{severity}</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400 mt-2"
                />
                <div className="text-[10px] text-amber-300 font-medium mt-1">
                  {getSeverityLabel(severity)}
                </div>
              </div>
            </div>

            {/* Photo Capture & Upload */}
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Field Photo Evidence</span>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-[10px] font-semibold flex items-center gap-1"
                  >
                    <Upload className="w-3 h-3" />
                    <span>Upload Photo</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Photo Preview & Sample Selection */}
              <div className="flex flex-col sm:flex-row gap-3 items-center">
                {photoPreview ? (
                  <div className="relative w-full sm:w-48 h-28 rounded-xl overflow-hidden border border-slate-700 bg-slate-900 flex-shrink-0">
                    <img
                      src={photoPreview}
                      alt="Incident preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setPhotoPreview("")}
                      className="absolute top-1 right-1 p-1 rounded-md bg-red-950/80 text-red-300 hover:bg-red-900"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="w-full sm:w-48 h-28 rounded-xl border border-dashed border-slate-700 flex flex-col items-center justify-center text-slate-500 text-[10px]">
                    <ImageIcon className="w-6 h-6 mb-1 text-slate-600" />
                    <span>No Photo Attached</span>
                  </div>
                )}

                <div className="flex-1 space-y-1 text-[11px]">
                  <div className="text-slate-400">Select Sample Damage Capture:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {photoPresets.map((pr, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setPhotoPreview(pr.url)}
                        className="px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] border border-slate-700"
                      >
                        {pr.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Officer Details & Description */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Reporting Officer</label>
                <input
                  type="text"
                  value={officerName}
                  onChange={(e) => setOfficerName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">
                  Agency / Border Unit
                </label>
                <input
                  type="text"
                  value={agency}
                  onChange={(e) => setAgency(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-semibold">
                Technical Field Assessment & Machinery Deployment
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-slate-100 focus:outline-none focus:border-emerald-500"
              ></textarea>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg active:scale-98 ${
                isOfflineSimulated
                  ? "bg-amber-500 text-slate-950 shadow-neon-amber"
                  : "bg-emerald-500 text-slate-950 shadow-neon-emerald"
              }`}
            >
              <Send className="w-4 h-4" />
              <span>
                {isSubmitting
                  ? "Buffering..."
                  : isOfflineSimulated
                  ? "Save to IndexedDB Queue (Offline Mode)"
                  : "Submit Live Field Incident Report"}
              </span>
            </button>
          </form>
        </div>

        {/* Right Column: Logged Incident Feed (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span>Field Dispatch Queue</span>
              </h3>
              <span className="font-mono text-xs text-slate-400">
                {incidents.length} Verified Reports
              </span>
            </div>

            <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
              {incidents.map((incident) => {
                const isPending = incident.status === "PENDING_OFFLINE_BUFFER";

                return (
                  <div
                    key={incident.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      isPending
                        ? "bg-amber-950/30 border-amber-500/50 shadow-neon-amber"
                        : "bg-slate-900/90 border-slate-800"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="font-bold text-slate-200 text-xs">{incident.title}</div>
                      {isPending ? (
                        <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse flex-shrink-0">
                          ⏳ SYNC PENDING
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex-shrink-0">
                          🟢 SYNCED
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 mb-2">
                      <span>📍 {incident.chainage}</span>
                      <span>·</span>
                      <span className="text-amber-400">Severity {incident.severity}/10</span>
                    </div>

                    {incident.photoUrl && (
                      <div className="h-24 w-full rounded-lg overflow-hidden border border-slate-800 mb-2">
                        <img
                          src={incident.photoUrl}
                          alt="Thumbnail"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <p className="text-[11px] text-slate-300 leading-relaxed line-clamp-2">
                      {incident.description}
                    </p>

                    <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500">
                      <span>👮 {incident.officerName}</span>
                      <span className="font-mono">
                        {new Date(incident.timestamp || Date.now()).toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
