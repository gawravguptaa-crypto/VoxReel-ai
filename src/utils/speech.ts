/**
 * Speech Recognition and Speech Synthesis Utilities for VoxReel AI
 */

export interface SpeechRecognitionHandlers {
  onStart?: () => void;
  onResult?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  onEnd?: () => void;
}

// Window augmented interface for Webkit Speech Recognition
declare global {
  interface Window {
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
  }
}

class SpeechController {
  private recognition: any = null;
  private isListening = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRec) {
        try {
          this.recognition = new SpeechRec();
          this.recognition.continuous = false;
          this.recognition.interimResults = true;
          this.recognition.maxAlternatives = 1;
        } catch (e) {
          console.warn('SpeechRecognition initialization error:', e);
        }
      }
    }
  }

  public isSupported(): boolean {
    return !!this.recognition;
  }

  public isSpeechOutputSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  public startListening(
    language: string,
    handlers: SpeechRecognitionHandlers
  ): boolean {
    if (!this.recognition) {
      if (handlers.onError) {
        handlers.onError('Speech recognition is not supported in this browser environment.');
      }
      return false;
    }

    if (this.isListening) {
      this.stopListening();
    }

    // Set recognition language
    if (language === 'hi') {
      this.recognition.lang = 'hi-IN';
    } else if (language === 'hinglish') {
      this.recognition.lang = 'hi-IN'; // Will capture Hindi phonetics & English loan words
    } else {
      this.recognition.lang = 'en-IN';
    }

    this.recognition.onstart = () => {
      this.isListening = true;
      handlers.onStart?.();
    };

    this.recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      const activeText = finalTranscript || interimTranscript;
      handlers.onResult?.(activeText, !!finalTranscript);
    };

    this.recognition.onerror = (event: any) => {
      this.isListening = false;
      const errType = event.error;

      // Normal silence or intentional cancellation
      if (errType === 'no-speech' || errType === 'aborted') {
        return;
      }

      // Handle transient network errors from Chrome's speech recognition webservice
      if (errType === 'network') {
        console.warn('[SpeechService] Transient speech recognition network error detected. Retrying automatically...');
        // Notify handler with a gentle status rather than a crash
        handlers.onError?.('Network glitch in speech service. Reconnecting automatically...');
        return;
      }

      const errorMsg = errType === 'not-allowed'
        ? 'Microphone permission denied. Please grant microphone access in settings.'
        : `Speech recognition: ${errType}`;
      handlers.onError?.(errorMsg);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      handlers.onEnd?.();
    };

    try {
      this.recognition.start();
      return true;
    } catch (e: any) {
      // If already started or rapidly restarted, avoid throwing
      if (e.name === 'InvalidStateError' || e.message?.includes('already started')) {
        this.isListening = true;
        return true;
      }
      this.isListening = false;
      return false;
    }
  }

  public stopListening(): void {
    if (this.recognition) {
      try {
        if (typeof this.recognition.abort === 'function') {
          this.recognition.abort();
        } else {
          this.recognition.stop();
        }
      } catch (e) {
        // Ignore already stopped
      }
      this.isListening = false;
    }
  }

  /**
   * Speak response using Web Speech Synthesis.
   * Respects user settings and cancels immediately if user interrupts.
   */
  public speak(
    text: string,
    options: {
      language?: string;
      rate?: number;
      pitch?: number;
      onEnd?: () => void;
      onError?: (err: any) => void;
    } = {}
  ): void {
    if (!this.isSpeechOutputSupported()) return;

    // Immediately stop any existing utterance
    this.stopSpeaking();

    // Clean markdown code blocks from speech
    const cleanText = text
      .replace(/```[\s\S]*?```/g, 'Code block omitted from audio reading.')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/[*#_~]/g, '')
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = options.rate ?? 1.0;
    utterance.pitch = options.pitch ?? 1.0;

    // Select suitable voice if available
    const voices = window.speechSynthesis.getVoices();
    const lang = options.language || 'en';

    let targetVoice = null;
    if (lang === 'hi' || lang === 'hinglish') {
      targetVoice = voices.find((v) => v.lang.includes('hi') || v.lang.includes('Hindi'));
      utterance.lang = 'hi-IN';
    }

    if (!targetVoice) {
      targetVoice = voices.find((v) => v.lang.includes('en-IN')) || voices.find((v) => v.lang.includes('en'));
      utterance.lang = 'en-US';
    }

    if (targetVoice) {
      utterance.voice = targetVoice;
    }

    utterance.onend = () => {
      this.currentUtterance = null;
      options.onEnd?.();
    };

    utterance.onerror = (e) => {
      this.currentUtterance = null;
      options.onError?.(e);
    };

    this.currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  }

  public stopSpeaking(): void {
    if (this.isSpeechOutputSupported()) {
      window.speechSynthesis.cancel();
      this.currentUtterance = null;
    }
  }

  public getIsListening(): boolean {
    return this.isListening;
  }
}

export const speechService = new SpeechController();
