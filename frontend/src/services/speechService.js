// High-Fidelity Regional Speech Service for Northeast India Logistics Platform
// Seamlessly streams authentic MP3 audio in English, Hindi, Assamese, Bengali, Mizo, and Manipuri

class SpeechService {
  constructor() {
    this.synth = typeof window !== "undefined" ? window.speechSynthesis : null;
    this.audioElement = null;
    this.currentUtterance = null;
    this.isSpeaking = false;
    this.isPaused = false;
    this.onStateChange = null;
    this.voices = [];

    if (typeof window !== "undefined" && this.synth) {
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  loadVoices() {
    if (!this.synth) return;
    this.voices = this.synth.getVoices();
  }

  getAvailableVoices() {
    if (!this.voices || this.voices.length === 0) {
      this.loadVoices();
    }
    return this.voices || [];
  }

  // Find best regional voice from browser
  findBestVoice(langCode, langKey) {
    const allVoices = this.getAvailableVoices();
    if (!allVoices || allVoices.length === 0) return null;

    // 1. Language prefix match
    if (langKey === "hi" || langCode.startsWith("hi")) {
      const match = allVoices.find((v) => /hindi|swara|madhav|heera|kalpana/i.test(v.name) || v.lang.startsWith("hi"));
      if (match) return match;
    }

    if (langKey === "bn" || langKey === "as" || langKey === "mni" || langCode.startsWith("bn") || langCode.startsWith("as")) {
      const match = allVoices.find((v) => /bengali|bangla|bashkar|tanishaa/i.test(v.name) || v.lang.startsWith("bn"));
      if (match) return match;
    }

    // 2. Any Indian voice match
    const indianMatch = allVoices.find((v) => /india|indian|-in|_in/i.test(v.lang) || /india/i.test(v.name));
    if (indianMatch) return indianMatch;

    return allVoices[0] || null;
  }

  speak(text, langCode = "en-IN", langKey = "en", onEndCallback = null) {
    this.stop();

    // Map regional code to API TTS language
    const apiLangMap = {
      en: "en",
      hi: "hi",
      as: "as",
      bn: "bn",
      mni: "mni",
      mz: "mz"
    };

    const targetLang = apiLangMap[langKey] || "en";
    const baseUrl = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") ? "http://localhost:8000" : "";
    const apiUrl = `${baseUrl}/api/tts?lang=${encodeURIComponent(targetLang)}&text=${encodeURIComponent(text.substring(0, 320))}`;

    // 1. Try High-Fidelity Backend Audio Stream first (Guaranteed authentic pronunciation)
    try {
      const audio = new Audio(apiUrl);
      this.audioElement = audio;

      audio.onplay = () => {
        this.isSpeaking = true;
        this.isPaused = false;
        if (this.onStateChange) this.onStateChange({ isSpeaking: true, isPaused: false });
      };

      audio.onended = () => {
        this.isSpeaking = false;
        this.isPaused = false;
        this.audioElement = null;
        if (this.onStateChange) this.onStateChange({ isSpeaking: false, isPaused: false });
        if (onEndCallback) onEndCallback();
      };

      audio.onerror = (err) => {
        console.warn("Backend TTS stream failed, falling back to Browser Web Speech API:", err);
        this.fallbackBrowserSynth(text, langCode, langKey, onEndCallback);
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((e) => {
          console.warn("Audio play prevented, falling back to Browser Synth:", e);
          this.fallbackBrowserSynth(text, langCode, langKey, onEndCallback);
        });
      }

      return true;
    } catch (e) {
      console.warn("Error initializing Audio element, using browser synth:", e);
      return this.fallbackBrowserSynth(text, langCode, langKey, onEndCallback);
    }
  }

  fallbackBrowserSynth(text, langCode, langKey, onEndCallback) {
    if (!this.synth) {
      this.isSpeaking = false;
      this.isPaused = false;
      if (this.onStateChange) this.onStateChange({ isSpeaking: false, isPaused: false });
      return false;
    }

    try {
      this.stop();
      const utterance = new SpeechSynthesisUtterance(text);
      this.currentUtterance = utterance;

      const bestVoice = this.findBestVoice(langCode, langKey);
      if (bestVoice) {
        utterance.voice = bestVoice;
        utterance.lang = bestVoice.lang;
      } else {
        utterance.lang = langKey === "hi" ? "hi-IN" : langKey === "bn" || langKey === "as" ? "bn-IN" : "en-IN";
      }

      utterance.rate = 0.9;
      utterance.pitch = 1.0;

      utterance.onstart = () => {
        this.isSpeaking = true;
        this.isPaused = false;
        if (this.onStateChange) this.onStateChange({ isSpeaking: true, isPaused: false });
      };

      utterance.onend = () => {
        this.isSpeaking = false;
        this.isPaused = false;
        if (this.onStateChange) this.onStateChange({ isSpeaking: false, isPaused: false });
        if (onEndCallback) onEndCallback();
      };

      utterance.onerror = () => {
        this.isSpeaking = false;
        this.isPaused = false;
        if (this.onStateChange) this.onStateChange({ isSpeaking: false, isPaused: false });
      };

      this.synth.speak(utterance);
      return true;
    } catch (err) {
      console.warn("Browser Speech Synthesis exception:", err);
      this.isSpeaking = false;
      this.isPaused = false;
      if (this.onStateChange) this.onStateChange({ isSpeaking: false, isPaused: false });
      return false;
    }
  }

  pause() {
    if (this.audioElement && !this.audioElement.paused) {
      this.audioElement.pause();
      this.isPaused = true;
      if (this.onStateChange) this.onStateChange({ isSpeaking: true, isPaused: true });
    } else if (this.synth && this.isSpeaking && !this.isPaused) {
      this.synth.pause();
      this.isPaused = true;
      if (this.onStateChange) this.onStateChange({ isSpeaking: true, isPaused: true });
    }
  }

  resume() {
    if (this.audioElement && this.audioElement.paused) {
      this.audioElement.play();
      this.isPaused = false;
      if (this.onStateChange) this.onStateChange({ isSpeaking: true, isPaused: false });
    } else if (this.synth && this.isSpeaking && this.isPaused) {
      this.synth.resume();
      this.isPaused = false;
      if (this.onStateChange) this.onStateChange({ isSpeaking: true, isPaused: false });
    }
  }

  stop() {
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
      this.audioElement = null;
    }

    if (this.synth) {
      this.synth.cancel();
    }

    this.isSpeaking = false;
    this.isPaused = false;
    if (this.onStateChange) this.onStateChange({ isSpeaking: false, isPaused: false });
  }
}

export const speechService = new SpeechService();
