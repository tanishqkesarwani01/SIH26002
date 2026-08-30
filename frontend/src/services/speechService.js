// Multilingual Web Speech API Synthesizer

class SpeechService {
  constructor() {
    this.synth = typeof window !== "undefined" ? window.speechSynthesis : null;
    this.currentUtterance = null;
    this.isSpeaking = false;
    this.isPaused = false;
    this.onStateChange = null;
  }

  getAvailableVoices() {
    if (!this.synth) return [];
    return this.synth.getVoices();
  }

  speak(text, langCode = "en-IN", onEndCallback = null) {
    if (!this.synth) {
      console.warn("Web Speech API not supported in this browser environment.");
      return false;
    }

    this.stop();

    const utterance = new SpeechSynthesisUtterance(text);
    this.currentUtterance = utterance;

    // Pick suitable voice
    const voices = this.getAvailableVoices();
    const voiceMatch = voices.find((v) => v.lang === langCode || v.lang.startsWith(langCode.slice(0, 2)));
    if (voiceMatch) {
      utterance.voice = voiceMatch;
    }

    utterance.lang = langCode;
    utterance.rate = 0.95;
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
      console.warn("Speech synthesis error:", e);
      this.isSpeaking = false;
      this.isPaused = false;
      if (this.onStateChange) this.onStateChange({ isSpeaking: false, isPaused: false });
    };

    this.synth.speak(utterance);
    return true;
  }

  pause() {
    if (this.synth && this.isSpeaking && !this.isPaused) {
      this.synth.pause();
      this.isPaused = true;
      if (this.onStateChange) this.onStateChange({ isSpeaking: true, isPaused: true });
    }
  }

  resume() {
    if (this.synth && this.isSpeaking && this.isPaused) {
      this.synth.resume();
      this.isPaused = false;
      if (this.onStateChange) this.onStateChange({ isSpeaking: true, isPaused: false });
    }
  }

  stop() {
    if (this.synth) {
      this.synth.cancel();
      this.isSpeaking = false;
      this.isPaused = false;
      if (this.onStateChange) this.onStateChange({ isSpeaking: false, isPaused: false });
    }
  }
}

export const speechService = new SpeechService();
