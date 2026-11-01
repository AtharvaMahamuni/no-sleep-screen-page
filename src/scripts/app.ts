import { WakeLockManager } from '../engines/session/WakeLockManager';
import { TimerManager } from '../engines/session/TimerManager';
import { SceneManager } from '../engines/visual/SceneManager';
import { BreathingOrbScene } from '../engines/visual/scenes/BreathingOrb';
import { ParticleUniverseScene } from '../engines/visual/scenes/ParticleUniverse';
import { OrbitalAtomsScene } from '../engines/visual/scenes/OrbitalAtoms';
import { AudioEngine } from '../engines/audio/AudioEngine';
import { PreferencesEngine } from '../engines/preferences/PreferencesEngine';

export class NoSleepApp {
  private wakeLock = new WakeLockManager();
  private timer = new TimerManager();
  private prefs = new PreferencesEngine();
  private audio = new AudioEngine();
  private sceneManager: SceneManager | null = null;

  constructor() {}

  public init(): void {
    // 1. Initialize Visual Scene Manager
    const canvas = document.getElementById('ambient-canvas') as HTMLCanvasElement;
    if (canvas) {
      this.sceneManager = new SceneManager(canvas);
      this.sceneManager.registerScene('breathing-orb', () => new BreathingOrbScene());
      this.sceneManager.registerScene('particles', () => new ParticleUniverseScene());
      this.sceneManager.registerScene('orbit', () => new OrbitalAtomsScene());
    }

    // 2. Apply saved theme & check URL hash for shared presets
    this.prefs.applyTheme(this.prefs.getPreferences().theme);

    const activePreset = this.prefs.getActivePreset();
    this.applyPreset(activePreset);

    // 3. Setup UI bindings
    this.bindWakeLockUI();
    this.bindTimerUI();
    this.bindAudioMixerUI();
    this.bindPresetSelectors();
    this.bindFullscreenAndPiP();
    this.bindShareButton();

    // Check URL preset hash on load
    if (window.location.hash) {
      const decoded = this.prefs.decodePresetFromHash(window.location.hash);
      if (decoded && decoded.sceneId) {
        if (this.sceneManager) this.sceneManager.switchScene(decoded.sceneId);
        if (decoded.sounds) this.audio.applyPresetSounds(decoded.sounds);
      }
    }
  }

  private applyPreset(preset: any): void {
    if (this.sceneManager && preset.sceneId) {
      this.sceneManager.switchScene(preset.sceneId);
    }
    if (preset.sounds) {
      this.audio.applyPresetSounds(preset.sounds);
    }
    if (preset.masterVolume !== undefined) {
      this.audio.setMasterVolume(preset.masterVolume);
    }
  }

  private bindWakeLockUI(): void {
    const btn = document.getElementById('wakelock-toggle-btn');
    const badge = document.getElementById('wakelock-status-badge');
    const label = document.getElementById('wakelock-status-text');

    if (!btn) return;

    btn.addEventListener('click', () => {
      this.wakeLock.toggle();
    });

    this.wakeLock.onStatusChange(status => {
      if (!badge || !label) return;
      badge.setAttribute('data-status', status);

      if (status === 'active') {
        label.textContent = 'Active ●';
        btn.classList.add('active');
      } else if (status === 'requesting') {
        label.textContent = 'Connecting...';
      } else if (status === 'unsupported') {
        label.textContent = 'Unsupported';
        btn.classList.remove('active');
      } else {
        label.textContent = 'Idle ○';
        btn.classList.remove('active');
      }
    });
  }

  private bindTimerUI(): void {
    const timerText = document.getElementById('timer-display');
    const startPauseBtn = document.getElementById('timer-start-pause-btn');
    const resetBtn = document.getElementById('timer-reset-btn');
    const pomodoroBtn = document.getElementById('timer-mode-pomodoro');
    const breakBtn = document.getElementById('timer-mode-break');
    const sleepBtn = document.getElementById('timer-mode-sleep');

    this.timer.onTick(state => {
      if (timerText) timerText.textContent = state.formattedTime;
      if (startPauseBtn) {
        startPauseBtn.textContent = state.isRunning ? 'Pause' : 'Start';
      }
    });

    this.timer.onComplete(mode => {
      if (mode === 'sleep') {
        this.audio.pause();
        this.wakeLock.release();
      }
    });

    startPauseBtn?.addEventListener('click', () => this.timer.toggle());
    resetBtn?.addEventListener('click', () => this.timer.reset());

    pomodoroBtn?.addEventListener('click', () => this.timer.setMode('pomodoro'));
    breakBtn?.addEventListener('click', () => this.timer.setMode('shortBreak'));
    sleepBtn?.addEventListener('click', () => this.timer.setMode('sleep', 30));
  }

  private bindAudioMixerUI(): void {
    const playPauseBtn = document.getElementById('audio-play-pause-btn');
    const masterSlider = document.getElementById('mixer-master-slider') as HTMLInputElement;

    playPauseBtn?.addEventListener('click', async () => {
      await this.audio.togglePlay();
      const isPlaying = this.audio.isAudioPlaying();
      if (playPauseBtn) {
        playPauseBtn.textContent = isPlaying ? 'Pause Audio' : 'Play Audio';
        playPauseBtn.classList.toggle('playing', isPlaying);
      }
    });

    masterSlider?.addEventListener('input', e => {
      const vol = parseFloat((e.target as HTMLInputElement).value);
      this.audio.setMasterVolume(vol);
      this.prefs.setMasterVolume(vol);
    });

    // Individual channel sliders
    const channels = ['rain', 'brown-noise', 'ocean', 'forest', 'lofi'];
    channels.forEach(ch => {
      const slider = document.getElementById(`channel-slider-${ch}`) as HTMLInputElement;
      const muteBtn = document.getElementById(`channel-mute-${ch}`);

      slider?.addEventListener('input', e => {
        const vol = parseFloat((e.target as HTMLInputElement).value);
        this.audio.setChannelState({ soundId: ch, volume: vol, muted: false });
        if (muteBtn) muteBtn.classList.remove('muted');
      });

      muteBtn?.addEventListener('click', () => {
        const isMuted = muteBtn.classList.toggle('muted');
        const vol = slider ? parseFloat(slider.value) : 0.5;
        this.audio.setChannelState({ soundId: ch, volume: vol, muted: isMuted });
      });
    });
  }

  private bindPresetSelectors(): void {
    const presetPills = document.querySelectorAll('[data-preset-id]');
    presetPills.forEach(pill => {
      pill.addEventListener('click', () => {
        const presetId = pill.getAttribute('data-preset-id');
        if (!presetId) return;

        presetPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');

        this.prefs.setActivePreset(presetId);
        const preset = this.prefs.getActivePreset();
        this.applyPreset(preset);

        // Update modal sliders
        preset.sounds.forEach(s => {
          const slider = document.getElementById(`channel-slider-${s.soundId}`) as HTMLInputElement;
          if (slider) slider.value = s.volume.toString();
        });
      });
    });
  }

  private bindFullscreenAndPiP(): void {
    const fsBtn = document.getElementById('fullscreen-toggle-btn');
    const pipBtn = document.getElementById('pip-toggle-btn');

    fsBtn?.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
          console.warn('[NoSleep] Fullscreen request denied:', err);
        });
      } else {
        document.exitFullscreen().catch(console.warn);
      }
    });

    pipBtn?.addEventListener('click', async () => {
      // Document Picture-in-Picture API (Chrome 116+)
      if ('documentPictureInPicture' in window) {
        try {
          const pipWindow = await (window as any).documentPictureInPicture.requestWindow({
            width: 320,
            height: 220,
          });

          pipWindow.document.body.innerHTML = `
            <style>
              body {
                font-family: -apple-system, sans-serif;
                background: #121210;
                color: #f7f7f4;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 100vh;
                margin: 0;
              }
              h2 { font-size: 2rem; margin: 0; color: #f54e00; }
              p { margin: 6px 0 0; font-size: 0.85rem; color: #807d72; }
            </style>
            <h2 id="pip-timer">${this.timer.getState().formattedTime}</h2>
            <p>NoSleep Companion Active</p>
          `;

          this.timer.onTick(state => {
            const pipTimer = pipWindow.document.getElementById('pip-timer');
            if (pipTimer) pipTimer.textContent = state.formattedTime;
          });
        } catch (err) {
          console.warn('[NoSleep] Document PiP failed:', err);
        }
      } else {
        alert('Picture-in-Picture window is currently supported in Chromium-based desktop browsers.');
      }
    });
  }

  private bindShareButton(): void {
    const shareBtn = document.getElementById('share-preset-btn');
    if (!shareBtn) return;

    shareBtn.addEventListener('click', async () => {
      const preset = this.prefs.getActivePreset();
      const hash = this.prefs.encodePresetToHash(preset);
      const url = `${window.location.origin}${window.location.pathname}#p=${hash}`;

      try {
        await navigator.clipboard.writeText(url);
        const originalText = shareBtn.textContent;
        shareBtn.textContent = 'Copied!';
        setTimeout(() => {
          shareBtn.textContent = originalText;
        }, 2000);
      } catch {
        prompt('Copy this shareable preset URL:', url);
      }
    });
  }
}

// Auto-boot on DOM ready
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    const app = new NoSleepApp();
    app.init();
  });
}
