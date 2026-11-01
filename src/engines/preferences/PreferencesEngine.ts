import type { AmbientPreset, UserPreferences } from '../../types';

export const DEFAULT_PRESETS: AmbientPreset[] = [
  {
    id: 'rainy-evening',
    name: 'Rainy Evening',
    description: 'Gentle rooftop rain mixed with warm brown noise and soft wind.',
    mode: 'focus',
    sceneId: 'particles',
    sounds: [
      { soundId: 'rain', volume: 0.75, muted: false },
      { soundId: 'brown-noise', volume: 0.35, muted: false },
      { soundId: 'ocean', volume: 0, muted: true },
      { soundId: 'forest', volume: 0, muted: true },
      { soundId: 'lofi', volume: 0, muted: true },
    ],
    masterVolume: 0.8,
    timerDurationMinutes: 25,
    wakeLockEnabled: true,
    isBuiltIn: true,
  },
  {
    id: 'deep-focus',
    name: 'Deep Focus',
    description: 'Continuous brown noise with mellow lo-fi Rhodes chords.',
    mode: 'focus',
    sceneId: 'orbit',
    sounds: [
      { soundId: 'rain', volume: 0, muted: true },
      { soundId: 'brown-noise', volume: 0.7, muted: false },
      { soundId: 'ocean', volume: 0, muted: true },
      { soundId: 'forest', volume: 0, muted: true },
      { soundId: 'lofi', volume: 0.45, muted: false },
    ],
    masterVolume: 0.85,
    timerDurationMinutes: 50,
    wakeLockEnabled: true,
    isBuiltIn: true,
  },
  {
    id: 'ocean-calm',
    name: 'Ocean Calm',
    description: 'Rhythmic rolling ocean waves with deep 4-7-8 breathing guidance.',
    mode: 'unwind',
    sceneId: 'breathing-orb',
    sounds: [
      { soundId: 'rain', volume: 0, muted: true },
      { soundId: 'brown-noise', volume: 0, muted: true },
      { soundId: 'ocean', volume: 0.8, muted: false },
      { soundId: 'forest', volume: 0.25, muted: false },
      { soundId: 'lofi', volume: 0, muted: true },
    ],
    masterVolume: 0.75,
    timerDurationMinutes: 15,
    wakeLockEnabled: true,
    isBuiltIn: true,
  },
];

const STORAGE_KEY = 'nosleep_prefs_v1';

export class PreferencesEngine {
  private prefs: UserPreferences;

  constructor() {
    this.prefs = this.load();
  }

  public getPreferences(): UserPreferences {
    return { ...this.prefs };
  }

  public getActivePreset(): AmbientPreset {
    const custom = this.prefs.customPresets.find(p => p.id === this.prefs.activePresetId);
    if (custom) return custom;
    const builtin = DEFAULT_PRESETS.find(p => p.id === this.prefs.activePresetId);
    return builtin || DEFAULT_PRESETS[0];
  }

  public setActivePreset(presetId: string): void {
    this.prefs.activePresetId = presetId;
    this.save();
  }

  public setTheme(theme: 'light' | 'dark' | 'system'): void {
    this.prefs.theme = theme;
    this.save();
    this.applyTheme(theme);
  }

  public setMasterVolume(vol: number): void {
    this.prefs.lastUsedMasterVolume = Math.max(0, Math.min(1, vol));
    this.save();
  }

  public setLowPowerMode(enabled: boolean): void {
    this.prefs.lowPowerMode = enabled;
    this.save();
  }

  public saveCustomPreset(preset: AmbientPreset): void {
    const existingIndex = this.prefs.customPresets.findIndex(p => p.id === preset.id);
    if (existingIndex >= 0) {
      this.prefs.customPresets[existingIndex] = preset;
    } else {
      this.prefs.customPresets.push(preset);
    }
    this.prefs.activePresetId = preset.id;
    this.save();
  }

  /**
   * Encodes preset configuration into compact URL hash string
   */
  public encodePresetToHash(preset: AmbientPreset): string {
    try {
      const payload = {
        m: preset.mode,
        s: preset.sceneId,
        v: Math.round(preset.masterVolume * 100),
        snd: preset.sounds.map(s => ({
          id: s.soundId,
          v: Math.round(s.volume * 100),
          m: s.muted ? 1 : 0,
        })),
      };
      const json = JSON.stringify(payload);
      return btoa(json);
    } catch {
      return '';
    }
  }

  /**
   * Decodes URL hash string back into preset object
   */
  public decodePresetFromHash(hash: string): Partial<AmbientPreset> | null {
    try {
      const raw = hash.replace(/^#p=/, '').replace(/^#/, '');
      if (!raw) return null;
      const json = atob(raw);
      const payload = JSON.parse(json);
      return {
        mode: payload.m,
        sceneId: payload.s,
        masterVolume: payload.v / 100,
        sounds: payload.snd.map((s: any) => ({
          soundId: s.id,
          volume: s.v / 100,
          muted: s.m === 1,
        })),
      };
    } catch {
      return null;
    }
  }

  private load(): UserPreferences {
    if (typeof localStorage === 'undefined') {
      return this.getDefaults();
    }

    try {
      const item = localStorage.getItem(STORAGE_KEY);
      if (item) {
        const parsed = JSON.parse(item);
        if (parsed.version === 1) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('[NoSleep] LocalStorage error loading preferences:', e);
    }

    return this.getDefaults();
  }

  private save(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.prefs));
    } catch (e) {
      console.warn('[NoSleep] LocalStorage error saving preferences:', e);
    }
  }

  private getDefaults(): UserPreferences {
    return {
      version: 1,
      theme: 'system',
      reducedMotion: false,
      lowPowerMode: false,
      activePresetId: 'rainy-evening',
      customPresets: [],
      lastUsedMasterVolume: 0.8,
      analyticsOptOut: false,
    };
  }

  public applyTheme(theme: 'light' | 'dark' | 'system'): void {
    if (typeof document === 'undefined') return;
    const isDark =
      theme === 'dark' ||
      (theme === 'system' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }
}
