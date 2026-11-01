export type WakeLockStatus = 'idle' | 'requesting' | 'active' | 'released' | 'unsupported' | 'error';

export type AmbientMode = 'focus' | 'unwind' | 'explore';

export interface SceneConfig {
  id: string;
  name: string;
  renderer: 'canvas-2d' | 'webgl' | 'css';
  particleCount?: number;
  speedMultiplier?: number;
  primaryColor?: string;
  interactive: boolean;
}

export interface SoundChannelState {
  soundId: string;
  volume: number; // 0.0 to 1.0
  muted: boolean;
}

export interface AmbientPreset {
  id: string;
  name: string;
  description: string;
  mode: AmbientMode;
  sceneId: string;
  sounds: SoundChannelState[];
  masterVolume: number;
  timerDurationMinutes?: number;
  wakeLockEnabled: boolean;
  isBuiltIn: boolean;
}

export interface UserPreferences {
  version: number;
  theme: 'light' | 'dark' | 'system';
  reducedMotion: boolean;
  lowPowerMode: boolean;
  activePresetId: string;
  customPresets: AmbientPreset[];
  lastUsedMasterVolume: number;
  analyticsOptOut: boolean;
}

export interface SessionState {
  wakeLockStatus: WakeLockStatus;
  isAudioPlaying: boolean;
  activeSceneId: string;
  activePresetId: string;
  timerRemainingSeconds: number;
  isTimerRunning: boolean;
  isFullscreen: boolean;
  isPiPActive: boolean;
}

export interface AudioAsset {
  id: string;
  title: string;
  category: 'Nature' | 'Noise' | 'Music';
  src: string;
  format: 'opus' | 'mp3' | 'procedural';
  author: string;
  sourceUrl: string;
  license: string;
  attribution: string;
  commercialUseAllowed: boolean;
}
