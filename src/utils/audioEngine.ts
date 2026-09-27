/**
 * Web Audio Engine for Real-Time Binaural Beats & Neuro-Acoustic Stimulation
 * Synthesizes pure sine binaural frequencies and noise colors directly in browser.
 */

export type SoundMode = 'gamma' | 'alpha' | 'theta' | 'delta' | 'pink' | 'brown' | 'off';

interface SoundPreset {
  id: SoundMode;
  name: string;
  targetWave: string;
  frequencyDelta: number; // Hz difference between ears
  baseFreq: number;
  description: string;
  benefits: string;
  suggestedDuration: string;
}

export const SOUND_PRESETS: Record<Exclude<SoundMode, 'off'>, SoundPreset> = {
  gamma: {
    id: 'gamma',
    name: '40 Hz Peak Focus',
    targetWave: 'Gamma Wave (Focus)',
    frequencyDelta: 40,
    baseFreq: 216,
    description: 'A crisp, energizing rhythm that helps you stay locked into complex, demanding tasks without drifting off.',
    benefits: 'Deep study, analytical problem solving, and staying sharp on complex projects.',
    suggestedDuration: '25 – 45 min',
  },
  alpha: {
    id: 'alpha',
    name: '10 Hz Calm Flow',
    targetWave: 'Alpha Wave (Flow State)',
    frequencyDelta: 10,
    baseFreq: 220,
    description: 'Helps your mind settle into a relaxed yet alert groove—ideal when you want to create without feeling rushed.',
    benefits: 'Thoughtful writing, creative brainstorming, reading, and gentle focus.',
    suggestedDuration: '30 – 60 min',
  },
  theta: {
    id: 'theta',
    name: '6 Hz Mindful Reset',
    targetWave: 'Theta Wave (Relaxation)',
    frequencyDelta: 6,
    baseFreq: 200,
    description: 'A soothing rhythm that softens internal mental chatter and lets your nervous system unwind peacefully.',
    benefits: 'Meditation, unwinding after intense screen time, and gentle daydreaming.',
    suggestedDuration: '15 – 30 min',
  },
  delta: {
    id: 'delta',
    name: '2.5 Hz Deep Sleep Prep',
    targetWave: 'Delta Wave (Rest & Repair)',
    frequencyDelta: 2.5,
    baseFreq: 150,
    description: 'Slow, deep acoustic pulses that cue your body to release physical tension and get ready for a deep night of rest.',
    benefits: 'Evening wind-down, releasing physical stress, and restorative rest.',
    suggestedDuration: '20 – 40 min',
  },
  pink: {
    id: 'pink',
    name: 'Pink Noise (Gentle Rain)',
    targetWave: 'Natural Soundscape',
    frequencyDelta: 0,
    baseFreq: 0,
    description: 'Softer than white noise, pink noise feels like a steady summer rain that gently masks background distractions.',
    benefits: 'Masking noisy office chit-chat, soothing light sleepers, and consistent focus.',
    suggestedDuration: 'Whenever needed',
  },
  brown: {
    id: 'brown',
    name: 'Brown Noise (Deep Waterfall)',
    targetWave: 'Cozy Deep Blanket',
    frequencyDelta: 0,
    baseFreq: 0,
    description: 'A deep, warm rumble like ocean waves or heavy rain. Many people with busy or wandering minds find it instantly grounding.',
    benefits: 'Calming mental restlessness, ADHD focus support, and soothing anxiety.',
    suggestedDuration: 'Whenever needed',
  },
};

class NeuroAudioSynthesizer {
  private ctx: AudioContext | null = null;
  private leftOsc: OscillatorNode | null = null;
  private rightOsc: OscillatorNode | null = null;
  private noiseNode: AudioNode | null = null;
  private masterGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private isRunning: boolean = false;
  private currentMode: SoundMode = 'off';

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.2, this.ctx.currentTime);

      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 256;

      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  public setVolume(volume: number) {
    if (this.masterGain && this.ctx) {
      const clamped = Math.max(0, Math.min(1, volume));
      this.masterGain.gain.setTargetAtTime(clamped, this.ctx.currentTime, 0.05);
    }
  }

  public stop() {
    if (this.leftOsc) {
      try { this.leftOsc.stop(); this.leftOsc.disconnect(); } catch {}
      this.leftOsc = null;
    }
    if (this.rightOsc) {
      try { this.rightOsc.stop(); this.rightOsc.disconnect(); } catch {}
      this.rightOsc = null;
    }
    if (this.noiseNode) {
      try { (this.noiseNode as AudioBufferSourceNode).stop(); this.noiseNode.disconnect(); } catch {}
      this.noiseNode = null;
    }
    this.isRunning = false;
    this.currentMode = 'off';
  }

  public playBinaural(baseFreq: number, delta: number, mode: SoundMode) {
    this.stop();
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    // Left Ear: base frequency
    const leftOsc = this.ctx.createOscillator();
    leftOsc.type = 'sine';
    leftOsc.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);

    // Right Ear: base + delta frequency
    const rightOsc = this.ctx.createOscillator();
    rightOsc.type = 'sine';
    rightOsc.frequency.setValueAtTime(baseFreq + delta, this.ctx.currentTime);

    // Stereo Panning
    const merger = this.ctx.createChannelMerger(2);

    const leftPanner = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
    const rightPanner = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;

    if (leftPanner && rightPanner) {
      leftPanner.pan.setValueAtTime(-1, this.ctx.currentTime);
      rightPanner.pan.setValueAtTime(1, this.ctx.currentTime);

      leftOsc.connect(leftPanner);
      leftPanner.connect(this.masterGain);

      rightOsc.connect(rightPanner);
      rightPanner.connect(this.masterGain);
    } else {
      leftOsc.connect(merger, 0, 0);
      rightOsc.connect(merger, 0, 1);
      merger.connect(this.masterGain);
    }

    leftOsc.start();
    rightOsc.start();

    this.leftOsc = leftOsc;
    this.rightOsc = rightOsc;
    this.isRunning = true;
    this.currentMode = mode;
  }

  public playNoise(type: 'pink' | 'brown') {
    this.stop();
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(2, bufferSize, this.ctx.sampleRate);
    
    for (let channel = 0; channel < 2; channel++) {
      const output = noiseBuffer.getChannelData(channel);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      let lastOut = 0.0;

      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        if (type === 'pink') {
          // Paul Kellet's filtered pink noise algorithm
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.07;
          b6 = white * 0.115926;
        } else {
          // Brown noise (integrated white noise)
          lastOut = (lastOut + 0.02 * white) / 1.02;
          output[i] = lastOut * 1.6;
        }
      }
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;
    whiteNoise.connect(this.masterGain);
    whiteNoise.start();

    this.noiseNode = whiteNoise;
    this.isRunning = true;
    this.currentMode = type;
  }

  public getStatus(): { isRunning: boolean; mode: SoundMode } {
    return { isRunning: this.isRunning, mode: this.currentMode };
  }
}

export const audioEngine = new NeuroAudioSynthesizer();
