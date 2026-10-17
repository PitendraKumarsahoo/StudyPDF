/**
 * Web Speech API Text-to-Speech (TTS) Service
 * Provides natural, pleasant voice reading for selected text or the entire document.
 */

export interface TTSVoiceOption {
  voice: SpeechSynthesisVoice;
  name: string;
  lang: string;
}

class TTSService {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private selectedVoice: SpeechSynthesisVoice | null = null;
  private isSpeaking: boolean = false;
  private isPaused: boolean = false;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.initVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.initVoices();
      }
    }
  }

  private initVoices() {
    if (!this.synth) return;
    this.voices = this.synth.getVoices();
    this.selectedVoice = this.pickCuteVoice(this.voices);
  }

  /**
   * Selects a cute, friendly, natural female English voice if available,
   * falling back to the highest quality system English voice.
   */
  private pickCuteVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
    if (!voices || voices.length === 0) return null;

    // Preferred pleasant / cute female voice names
    const preferredNames = [
      'Google US English',
      'Samantha',
      'Victoria',
      'Karen',
      'Tessa',
      'Fiona',
      'Moira',
      'Zira',
      'Jenny',
      'Ava',
      'Siri',
    ];

    for (const name of preferredNames) {
      const match = voices.find(
        (v) => v.name.toLowerCase().includes(name.toLowerCase()) && v.lang.startsWith('en')
      );
      if (match) return match;
    }

    // Secondary: Any English female voice (often identified by name)
    const femaleEnglish = voices.find(
      (v) =>
        v.lang.startsWith('en') &&
        (v.name.toLowerCase().includes('female') ||
          v.name.toLowerCase().includes('girl') ||
          v.name.toLowerCase().includes('woman'))
    );
    if (femaleEnglish) return femaleEnglish;

    // Fallback: Any English voice
    const anyEnglish = voices.find((v) => v.lang.startsWith('en'));
    if (anyEnglish) return anyEnglish;

    // Ultimate fallback: First available voice
    return voices[0] || null;
  }

  /**
   * Speaks a specific piece of text (e.g. selected word, line, or paragraph)
   * with a cute, clear, friendly voice and automatically calls onEnd when finished.
   */
  public speakText(
    text: string,
    options: {
      rate?: number;
      pitch?: number;
      onStart?: () => void;
      onEnd?: () => void;
      onError?: () => void;
    } = {}
  ): void {
    if (!this.synth) {
      options.onError?.();
      return;
    }

    // Cancel any previous utterance immediately
    this.stop();

    const cleanText = text.replace(/\s+/g, ' ').trim();
    if (!cleanText) {
      options.onEnd?.();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);

    // Cute voice tuning: slightly elevated pitch (1.18) and natural tempo (0.98)
    utterance.pitch = options.pitch ?? 1.18;
    utterance.rate = options.rate ?? 0.98;
    utterance.volume = 1.0;

    if (!this.selectedVoice) {
      this.initVoices();
    }
    if (this.selectedVoice) {
      utterance.voice = this.selectedVoice;
    }

    utterance.onstart = () => {
      this.isSpeaking = true;
      this.isPaused = false;
      options.onStart?.();
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      this.isPaused = false;
      this.currentUtterance = null;
      options.onEnd?.();
    };

    utterance.onerror = (e) => {
      // Ignore normal canceled events
      if (e.error !== 'canceled' && e.error !== 'interrupted') {
        console.warn('Speech synthesis error:', e);
      }
      this.isSpeaking = false;
      this.isPaused = false;
      this.currentUtterance = null;
      options.onError?.();
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  /**
   * Immediately stops all audio output
   */
  public stop(): void {
    if (this.synth) {
      this.synth.cancel();
    }
    this.isSpeaking = false;
    this.isPaused = false;
    this.currentUtterance = null;
  }

  /**
   * Pauses current playback
   */
  public pause(): void {
    if (this.synth && this.isSpeaking && !this.isPaused) {
      this.synth.pause();
      this.isPaused = true;
    }
  }

  /**
   * Resumes paused playback
   */
  public resume(): void {
    if (this.synth && this.isPaused) {
      this.synth.resume();
      this.isPaused = false;
    }
  }

  public getIsSpeaking(): boolean {
    return this.isSpeaking && !this.isPaused;
  }

  public getIsPaused(): boolean {
    return this.isPaused;
  }
}

export const ttsService = new TTSService();
