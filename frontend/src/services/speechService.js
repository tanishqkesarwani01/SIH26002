// Robust Multilingual Speech Synthesis & Native Regional Audio Service
// Supports: English, Hindi (हिन्दी), Assamese (অসমীয়া), Bengali (বাংলা), Mizo, Manipuri

class SpeechService {
  constructor() {
    this.synth = typeof window !== "undefined" ? window.speechSynthesis : null;
    this.currentUtterance = null;
    this.audioElement = null;
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

  // Find best regional voice matching script & language
  findBestVoice(langCode, langKey) {
    const allVoices = this.getAvailableVoices();
    if (!allVoices || allVoices.length === 0) return null;

    // 1. Exact language tag match (e.g. "hi-IN", "bn-IN", "as-IN", "en-IN")
    let match = allVoices.find(
      (v) => v.lang.toLowerCase() === langCode.toLowerCase() || v.lang.replace("_", "-").toLowerCase() === langCode.toLowerCase()
    );
    if (match) return match;

    // 2. Language prefix match (e.g. "hi", "bn", "as", "en")
    const prefix = langCode.slice(0, 2).toLowerCase();
    match = allVoices.find((v) => v.lang.toLowerCase().startsWith(prefix));
    if (match) return match;

    // 3. Name-based match for Indian voices (Microsoft / Google / Apple)
    if (langKey === "hi" || langCode.startsWith("hi")) {
      match = allVoices.find((v) => /hindi|swara|madhav|heera|kalpana/i.test(v.name));
      if (match) return match;
    }

    if (langKey === "bn" || langKey === "as" || langKey === "mni" || langCode.startsWith("bn") || langCode.startsWith("as")) {
      match = allVoices.find((v) => /bengali|bangla|bashkar|tanishaa/i.test(v.name));
      if (match) return match;
    }

    // 4. Any Indian Accent Voice fallback
    match = allVoices.find((v) => /india|indian|-in|_in/i.test(v.lang) || /india/i.test(v.name));
    if (match) return match;

    return allVoices[0] || null;
  }

  speak(text, langCode = "en-IN", langKey = "en", onEndCallback = null) {
    this.stop();

    // Mapping for Google Public TTS stream (supports authentic native pronunciations)
    const ttsLangMap = {
      en: "en-IN",
      hi: "hi",
      as: "bn",   // Assamese in Eastern Nagari phonetic stream
      bn: "bn",   // Bengali stream
      mni: "bn",  // Manipuri in Eastern Nagari stream
      mz: "hi"    // Mizo Indian-phonetic stream
    };

    const targetTtsLang = ttsLangMap[langKey] || (langCode ? langCode.slice(0, 2) : "en");

    // Try Native Web Speech API first if suitable regional voice exists
    const bestVoice = this.findBestVoice(langCode, langKey);
    const hasNativeRegionalVoice =
      bestVoice &&
      (bestVoice.lang.toLowerCase().includes(langCode.slice(0, 2).toLowerCase()) ||
       /hindi|bengali|bangla|india/i.test(bestVoice.name) ||
       /hi|bn|as/i.test(bestVoice.lang));

    if (this.synth && (hasNativeRegionalVoice || langKey === "en")) {
      try {
        const utterance = new SpeechSynthesisUtterance(text);
        this.currentUtterance = utterance;

        if (bestVoice) {
          utterance.voice = bestVoice;
          utterance.lang = bestVoice.lang;
        } else {
          utterance.lang = langCode;
        }

        utterance.rate = langKey === "en" ? 0.95 : 0.9;
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

        utterance.onerror = (e) => {
          console.warn("Web Speech API encountered an issue, falling back to audio stream:", e);
          this.fallbackAudioStream(text, targetTtsLang, onEndCallback);
        };

        this.synth.speak(utterance);
        return true;
      } catch (err) {
        console.warn("Web Speech exception, trying stream fallback:", err);
      }
    }

    // Fallback: High-Definition Regional Audio Stream
    return this.fallbackAudioStream(text, targetTtsLang, onEndCallback);
  }

  fallbackAudioStream(text, ttsLang, onEndCallback) {
    try {
      this.stop();

      // Trim text to first 200 chars for safe HTTP query URL encoding
      const cleanSnippet = text.length > 200 ? text.substring(0, 195) + "..." : text;
      const streamUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${encodeURIComponent(ttsLang)}&q=${encodeURIComponent(cleanSnippet)}`;

      const audio = new Audio(streamUrl);
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

      audio.onerror = () => {
        // If external audio fails, try synth with whatever default voice is available
        if (this.synth) {
          const fallbackUtterance = new SpeechSynthesisUtterance(text);
          fallbackUtterance.rate = 0.9;
          fallbackUtterance.onend = () => {
            this.isSpeaking = false;
            this.isPaused = false;
            if (this.onStateChange) this.onStateChange({ isSpeaking: false, isPaused: false });
            if (onEndCallback) onEndCallback();
          };
          this.synth.speak(fallbackUtterance);
        } else {
          this.isSpeaking = false;
          this.isPaused = false;
          if (this.onStateChange) this.onStateChange({ isSpeaking: false, isPaused: false });
        }
      };

      audio.play().catch(() => {
        // Auto-play policy catch: fallback to synth
        if (this.synth) {
          const fallbackUtterance = new SpeechSynthesisUtterance(text);
          this.synth.speak(fallbackUtterance);
        }
      });

      return true;
    } catch (err) {
      console.warn("Audio stream fallback error:", err);
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
