import type { SoundChannelState } from '../../types';

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private channelGains: Map<string, GainNode> = new Map();
  private isPlaying: boolean = false;
  private isInitialized: boolean = false;

  private channels: string[] = ['rain', 'brown-noise', 'ocean', 'forest', 'lofi'];

  constructor() {}

  public isAudioPlaying(): boolean {
    return this.isPlaying;
  }

  public async init(): Promise<void> {
    if (this.isInitialized && this.ctx) {
      if (this.ctx.state === 'suspended') {
        await this.ctx.resume();
      }
      return;
    }

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) {
      console.warn('[NoSleep] Web Audio API is not supported in this browser');
      return;
    }

    this.ctx = new AudioContextClass();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.8, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    // Initialize gain nodes for all channels
    for (const id of this.channels) {
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0, this.ctx.currentTime);
      gain.connect(this.masterGain);
      this.channelGains.set(id, gain);
    }

    // Build procedural synthesizers
    this.setupProceduralGenerators();

    this.isInitialized = true;
  }

  public async play(): Promise<void> {
    await this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
    this.isPlaying = true;
  }

  public pause(): void {
    if (this.ctx && this.ctx.state === 'running') {
      this.ctx.suspend();
    }
    this.isPlaying = false;
  }

  public togglePlay(): Promise<void> {
    if (this.isPlaying) {
      this.pause();
      return Promise.resolve();
    } else {
      return this.play();
    }
  }

  public setMasterVolume(volume: number): void {
    if (!this.masterGain || !this.ctx) return;
    const clamped = Math.max(0, Math.min(1, volume));
    this.masterGain.gain.linearRampToValueAtTime(clamped, this.ctx.currentTime + 0.05);
  }

  public setChannelState(state: SoundChannelState): void {
    if (!this.ctx) return;
    const gainNode = this.channelGains.get(state.soundId);
    if (!gainNode) return;

    const targetVol = state.muted ? 0 : Math.max(0, Math.min(1, state.volume));
    gainNode.gain.linearRampToValueAtTime(targetVol, this.ctx.currentTime + 0.1);
  }

  public applyPresetSounds(sounds: SoundChannelState[]): void {
    for (const s of sounds) {
      this.setChannelState(s);
    }
  }

  /**
   * Sets up procedural audio synthesizers (Brown Noise, Rain, Ocean, Forest, Lo-Fi)
   * Infinite duration, 0MB download, 0 clicks!
   */
  private setupProceduralGenerators(): void {
    if (!this.ctx) return;

    // 1. Brown Noise Generator
    this.createBrownNoiseGenerator();

    // 2. Rain Generator (Filtered pink noise with droplet peaks)
    this.createRainGenerator();

    // 3. Ocean Wave Generator (Modulated noise with slow LFO swell)
    this.createOceanGenerator();

    // 4. Forest Atmosphere (Subtle nature flutter & rustle)
    this.createForestGenerator();

    // 5. Lo-Fi Rhodes Instrumental Chords
    this.createLofiGenerator();
  }

  private createBrownNoiseGenerator(): void {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5; // Compensate for volume drop
    }

    const brownSource = this.ctx.createBufferSource();
    brownSource.buffer = noiseBuffer;
    brownSource.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, this.ctx.currentTime);

    const gain = this.channelGains.get('brown-noise');
    if (gain) {
      brownSource.connect(filter);
      filter.connect(gain);
      brownSource.start();
    }
  }

  private createRainGenerator(): void {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    // Pink noise curve for rain
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }

    const rainSource = this.ctx.createBufferSource();
    rainSource.buffer = noiseBuffer;
    rainSource.loop = true;

    const highpass = this.ctx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.setValueAtTime(800, this.ctx.currentTime);

    const lowpass = this.ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(3200, this.ctx.currentTime);

    const gain = this.channelGains.get('rain');
    if (gain) {
      rainSource.connect(highpass);
      highpass.connect(lowpass);
      lowpass.connect(gain);
      rainSource.start();
    }
  }

  private createOceanGenerator(): void {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const oceanSource = this.ctx.createBufferSource();
    oceanSource.buffer = noiseBuffer;
    oceanSource.loop = true;

    // Filter with slow LFO for wave swells
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(350, this.ctx.currentTime);

    const lfo = this.ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.12, this.ctx.currentTime); // 8-second wave cycle

    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(250, this.ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    const gain = this.channelGains.get('ocean');
    if (gain) {
      oceanSource.connect(filter);
      filter.connect(gain);
      oceanSource.start();
      lfo.start();
    }
  }

  private createForestGenerator(): void {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.2;
    }

    const forestSource = this.ctx.createBufferSource();
    forestSource.buffer = noiseBuffer;
    forestSource.loop = true;

    const bandpass = this.ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(2400, this.ctx.currentTime);
    bandpass.Q.setValueAtTime(1.5, this.ctx.currentTime);

    const gain = this.channelGains.get('forest');
    if (gain) {
      forestSource.connect(bandpass);
      bandpass.connect(gain);
      forestSource.start();
    }
  }

  private createLofiGenerator(): void {
    if (!this.ctx) return;

    // Warm chord progression (Fmaj7 - Em7 - Dm7 - Cmaj7)
    const chordFrequencies = [
      [174.61, 220.0, 261.63, 329.63], // Fmaj7
      [164.81, 196.0, 246.94, 293.66], // Em7
      [146.83, 174.61, 220.0, 261.63], // Dm7
      [130.81, 164.81, 196.0, 246.94], // Cmaj7
    ];

    const lofiGain = this.channelGains.get('lofi');
    if (!lofiGain) return;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(650, this.ctx.currentTime);
    filter.connect(lofiGain);

    let currentChordIndex = 0;
    const playNextChord = () => {
      if (!this.ctx || this.ctx.state === 'closed') return;

      const freqs = chordFrequencies[currentChordIndex];
      currentChordIndex = (currentChordIndex + 1) % chordFrequencies.length;

      freqs.forEach(freq => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const noteGain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        noteGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
        noteGain.gain.exponentialRampToValueAtTime(0.08, this.ctx.currentTime + 0.6);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 3.8);

        osc.connect(noteGain);
        noteGain.connect(filter);

        osc.start();
        osc.stop(this.ctx.currentTime + 4.0);
      });

      setTimeout(playNextChord, 4000);
    };

    playNextChord();
  }
}
