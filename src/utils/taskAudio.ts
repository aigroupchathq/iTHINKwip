/**
 * Light Web Audio feedback synthesizer for cognitive exercises.
 * Delivers gentle, non-jarring acoustic feedback to enhance scientific engagement.
 */

class TaskAudioSynthesizer {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
  }

  public isEnabled(): boolean {
    return this.soundEnabled;
  }

  /**
   * Gentle, uplifting harmonic chime for accurate responses
   */
  public playSuccess() {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Dual-tone harmonic
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now); // D5
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now);
    osc2.frequency.exponentialRampToValueAtTime(1174.66, now + 0.14); // D6

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.23);
    osc2.stop(now + 0.23);
  }

  /**
   * Soft wooden tap for natural slips (gentle, never an alarming buzz)
   */
  public playSlip() {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(130, now + 0.08);

    gain.gain.setValueAtTime(0.09, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.11);
  }

  /**
   * Clear tone for step cues
   */
  public playTone(freq: number = 440, duration: number = 0.1) {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration + 0.01);
  }

  /**
   * Ascending gentle chord for celebration
   */
  public playCompletion() {
    if (!this.soundEnabled) return;
    const notes = [440, 554.37, 659.25, 880]; // A Major
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 0.25);
      }, idx * 75);
    });
  }

  /**
   * Spoken letter for dual n-back using SpeechSynthesis or acoustic fallback
   */
  public speakLetter(letter: string) {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(letter.toLowerCase());
      utterance.rate = 1.1;
      utterance.volume = this.soundEnabled ? 0.8 : 0;
      window.speechSynthesis.speak(utterance);
    } else {
      // Fallback distinct frequencies for A, B, C, D, L, T, X
      const freqMap: Record<string, number> = {
        C: 261.63,
        D: 293.66,
        K: 329.63,
        L: 349.23,
        Q: 392.00,
        R: 440.00,
        T: 493.88,
        X: 523.25
      };
      this.playTone(freqMap[letter] || 440, 0.18);
    }
  }
}

export const taskAudio = new TaskAudioSynthesizer();
