import React, { useState, useEffect } from "react";
import { EMERGENCY_TRANSLATIONS } from "../data/translationsData";
import { speechService } from "../services/speechService";
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  Square,
  Radio,
  Send,
  MessageSquare,
  Smartphone,
  Copy,
  Check,
  Sparkles,
  Share2,
  AlertTriangle,
  Users,
} from "lucide-react";

export const MultilingualAlerts = () => {
  const [selectedLang, setSelectedLang] = useState("en");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [copiedType, setCopiedType] = useState(null);
  const [broadcastDelivered, setBroadcastDelivered] = useState(false);
  const [recipientCount, setRecipientCount] = useState(1420);

  const activeTranslation = EMERGENCY_TRANSLATIONS[selectedLang] || EMERGENCY_TRANSLATIONS.en;

  useEffect(() => {
    speechService.onStateChange = (state) => {
      setIsSpeaking(state.isSpeaking);
      setIsPaused(state.isPaused);
    };

    return () => {
      speechService.stop();
    };
  }, []);

  const handleSpeak = () => {
    if (isSpeaking && !isPaused) {
      speechService.pause();
    } else if (isSpeaking && isPaused) {
      speechService.resume();
    } else {
      speechService.speak(
        activeTranslation.alertBody,
        activeTranslation.ttsVoiceHint || activeTranslation.langCode
      );
    }
  };

  const handleStop = () => {
    speechService.stop();
  };

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2500);
  };

  const handleBroadcastPush = () => {
    setBroadcastDelivered(true);
    setTimeout(() => setBroadcastDelivered(false), 5000);
  };

  const languagesList = [
    { code: "en", name: "English", flag: "🇬🇧", region: "National Grid" },
    { code: "hi", name: "हिन्दी (Hindi)", flag: "🇮🇳", region: "National Highways" },
    { code: "as", name: "অসমীয়া (Assamese)", flag: "🌿", region: "Assam Valley" },
    { code: "mz", name: "Mizo ṭawng", flag: "🏔️", region: "Mizoram Axis" },
    { code: "mni", name: "মৈতৈলোন্ (Manipuri)", flag: "🌸", region: "Manipur & Border" },
    { code: "bn", name: "বাংলা (Bengali)", flag: "🌊", region: "Barak & Tripura" },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#0b1120] border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/30">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">
                Multilingual Emergency Broadcast Center
              </h2>
              <p className="text-xs text-slate-400">
                Generate high-priority audible speech alerts and WhatsApp / SMS driver payloads across 6 Northeast regional languages.
              </p>
            </div>
          </div>
        </div>

        {/* Live Broadcast Trigger */}
        <button
          onClick={handleBroadcastPush}
          className="px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-neon-crimson transition-all active:scale-95"
        >
          <Send className="w-4 h-4" />
          <span>Broadcast to {recipientCount.toLocaleString()} En-Route Drivers</span>
        </button>
      </div>

      {broadcastDelivered && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs flex items-center justify-between animate-fade-in shadow-neon-emerald">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="font-bold">
              Emergency Broadcast Dispatched to {recipientCount} Active Drivers & Fleet Convoys!
            </span>
          </div>
          <span className="font-mono text-[10px] text-emerald-400">
            Delivery Rate: 99.8% (NavIC & GSM Telephony)
          </span>
        </div>
      )}

      {/* Language Tabs Row */}
      <div className="flex flex-wrap gap-2">
        {languagesList.map((lang) => (
          <button
            key={lang.code}
            onClick={() => {
              speechService.stop();
              setSelectedLang(lang.code);
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all border ${
              selectedLang === lang.code
                ? "bg-slate-800 text-emerald-300 border-emerald-500/50 shadow-neon-emerald"
                : "bg-[#0f172a] text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200"
            }`}
          >
            <span className="text-base">{lang.flag}</span>
            <span>{lang.name}</span>
            <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
              ({lang.region})
            </span>
          </button>
        ))}
      </div>

      {/* Main Broadcast Workstation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Speech Synthesis Audio Console (7 cols) */}
        <div className="lg:col-span-7 bg-[#0f172a] border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xl">{activeTranslation.flag}</span>
                <div>
                  <h3 className="font-bold text-slate-100 text-sm">
                    {activeTranslation.headline}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Dialect: {activeTranslation.langName} · Region: {activeTranslation.region}
                  </p>
                </div>
              </div>

              {/* Audio Status Pill */}
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold ${
                  isSpeaking
                    ? "bg-red-500/20 text-red-300 border border-red-500/40"
                    : "bg-slate-800 text-slate-400"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isSpeaking ? "bg-red-400 animate-ping" : "bg-slate-500"
                  }`}
                ></span>
                <span>{isSpeaking ? (isPaused ? "PAUSED" : "PLAYING AUDIO") : "VOICE READY"}</span>
              </div>
            </div>

            {/* Alert Speech Script Box */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/90 text-slate-200 text-sm leading-relaxed mb-4 font-sans selection:bg-emerald-500/30">
              {activeTranslation.alertBody}
            </div>

            {/* Audio Waveform Simulator */}
            {isSpeaking && (
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center gap-1 mb-4 h-12">
                {[40, 75, 30, 90, 60, 100, 45, 80, 20, 95, 50, 85, 35, 70, 90, 30, 65, 85].map(
                  (h, i) => (
                    <div
                      key={i}
                      className="w-1 bg-emerald-400 rounded-full transition-all duration-150 animate-pulse"
                      style={{
                        height: isPaused ? "6px" : `${h}%`,
                        animationDelay: `${i * 0.08}s`,
                      }}
                    ></div>
                  )
                )}
              </div>
            )}
          </div>

          {/* Voice Controls Toolbar */}
          <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-800">
            <button
              onClick={handleSpeak}
              className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 ${
                isSpeaking && !isPaused
                  ? "bg-amber-500 text-slate-950 shadow-neon-amber"
                  : "bg-emerald-500 text-slate-950 shadow-neon-emerald"
              }`}
            >
              {isSpeaking && !isPaused ? (
                <>
                  <Pause className="w-4 h-4" />
                  <span>Pause Audio Announcement</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Speak Alert in {activeTranslation.langName}</span>
                </>
              )}
            </button>

            {isSpeaking && (
              <button
                onClick={handleStop}
                className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center gap-1.5"
              >
                <Square className="w-3.5 h-3.5 text-red-400" />
                <span>Stop</span>
              </button>
            )}

            <button
              onClick={() => handleCopy(activeTranslation.alertBody, "speech")}
              className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5"
            >
              {copiedType === "speech" ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              <span>{copiedType === "speech" ? "Copied" : "Copy Script"}</span>
            </button>
          </div>
        </div>

        {/* Right: Mock WhatsApp & SMS Driver Payloads (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* WhatsApp Card */}
          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-4 shadow-xl">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-800 mb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span>WhatsApp Driver Dispatch Payload</span>
              </div>
              <button
                onClick={() => handleCopy(activeTranslation.whatsappTemplate, "whatsapp")}
                className="text-slate-400 hover:text-white text-[11px] flex items-center gap-1"
              >
                {copiedType === "whatsapp" ? (
                  <Check className="w-3 h-3 text-emerald-400" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
                <span>Copy</span>
              </button>
            </div>

            <div className="bg-[#051c14] border border-emerald-900/60 rounded-xl p-3 text-slate-200 text-xs font-mono leading-relaxed whitespace-pre-wrap selection:bg-emerald-500/40 max-h-48 overflow-y-auto">
              {activeTranslation.whatsappTemplate}
            </div>
          </div>

          {/* SMS Card */}
          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-4 shadow-xl">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-800 mb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                <Smartphone className="w-4 h-4 text-cyan-400" />
                <span>GSM-7 Driver SMS Payload</span>
              </div>
              <button
                onClick={() => handleCopy(activeTranslation.driverSmsText, "sms")}
                className="text-slate-400 hover:text-white text-[11px] flex items-center gap-1"
              >
                {copiedType === "sms" ? (
                  <Check className="w-3 h-3 text-emerald-400" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
                <span>Copy</span>
              </button>
            </div>

            <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 text-slate-300 text-xs font-mono leading-relaxed">
              {activeTranslation.driverSmsText}
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 mt-2 font-mono">
              <span>Encoding: GSM 7-bit</span>
              <span>Length: {activeTranslation.driverSmsText.length} chars (1 SMS segment)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
