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
    this.bindModalsUI();
    this.bindThemeUI();
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
    // Header controls
    const headerBtn = document.getElementById('wakelock-toggle-btn');
    const headerBadge = document.getElementById('wakelock-status-badge');
    const headerLabel = document.getElementById('wakelock-status-text');

    // Hero controls
    const heroBtn = document.getElementById('hero-wakelock-toggle-btn');
    const heroBadge = document.getElementById('hero-wakelock-status-badge');
    const heroStatusText = document.getElementById('hero-wakelock-status-text');
    const heroBtnLabel = document.getElementById('hero-btn-label');
    const heroBtnSub = document.getElementById('hero-btn-sub');

    const toggle = () => {
      this.wakeLock.toggle();
    };

    headerBtn?.addEventListener('click', toggle);
    heroBtn?.addEventListener('click', toggle);

    // Keyboard shortcut: Space or W key
    window.addEventListener('keydown', (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
      if (isInput) return;

      if (e.code === 'Space' && (target === document.body || target === document.documentElement || target.id === 'ambient-canvas')) {
        e.preventDefault();
        toggle();
      } else if ((e.key === 'w' || e.key === 'W') && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        toggle();
      }
    });

    this.wakeLock.onStatusChange(status => {
      // 1. Update Header Pill
      if (headerBadge) headerBadge.setAttribute('data-status', status);
      if (headerBtn) {
        if (status === 'active') {
          headerBtn.classList.add('active');
          if (headerLabel) headerLabel.textContent = 'Active ●';
        } else if (status === 'requesting') {
          if (headerLabel) headerLabel.textContent = 'Connecting...';
        } else if (status === 'unsupported') {
          headerBtn.classList.remove('active');
          if (headerLabel) headerLabel.textContent = 'Unsupported';
        } else {
          headerBtn.classList.remove('active');
          if (headerLabel) headerLabel.textContent = 'Idle ○';
        }
      }

      // 2. Update Hero Wake Card
      if (heroBadge) heroBadge.setAttribute('data-status', status);
      if (heroBtn) {
        if (status === 'active') {
          heroBtn.classList.add('active');
          if (heroStatusText) heroStatusText.textContent = 'ACTIVE ●';
          if (heroBtnLabel) heroBtnLabel.textContent = 'Screen Awake is Active';
          if (heroBtnSub) heroBtnSub.textContent = 'Display will stay on while this tab is open • Tap to release';
        } else if (status === 'requesting') {
          if (heroStatusText) heroStatusText.textContent = 'CONNECTING...';
          if (heroBtnLabel) heroBtnLabel.textContent = 'Activating Screen Wake...';
          if (heroBtnSub) heroBtnSub.textContent = 'Requesting Screen Wake Lock API access';
        } else if (status === 'unsupported') {
          heroBtn.classList.remove('active');
          if (heroStatusText) heroStatusText.textContent = 'UNSUPPORTED';
          if (heroBtnLabel) heroBtnLabel.textContent = 'Wake Lock Unsupported';
          if (heroBtnSub) heroBtnSub.textContent = 'Your browser does not support the Screen Wake Lock API.';
        } else {
          heroBtn.classList.remove('active');
          if (heroStatusText) heroStatusText.textContent = 'IDLE ○';
          if (heroBtnLabel) heroBtnLabel.textContent = 'Keep Screen Awake';
          if (heroBtnSub) heroBtnSub.textContent = 'Prevents your screen from sleeping, dimming, or locking.';
        }
      }
    });
  }

  private bindModalsUI(): void {
    // Sound Mixer Modal
    const mixerModal = document.getElementById('sound-mixer-modal');
    const openMixerBtn = document.getElementById('open-mixer-btn');
    const closeMixerBtn = document.getElementById('close-mixer-btn');

    const openMixer = () => {
      if (mixerModal) {
        mixerModal.classList.add('open');
        mixerModal.setAttribute('aria-hidden', 'false');
      }
    };

    const closeMixer = () => {
      if (mixerModal) {
        mixerModal.classList.remove('open');
        mixerModal.setAttribute('aria-hidden', 'true');
      }
    };

    openMixerBtn?.addEventListener('click', openMixer);
    closeMixerBtn?.addEventListener('click', closeMixer);
    mixerModal?.addEventListener('click', (e) => {
      if (e.target === mixerModal) closeMixer();
    });

    // Timer Options Modal
    const timerModal = document.getElementById('timer-modal');
    const openTimerBtn = document.getElementById('open-timer-modal-btn');
    const closeTimerBtn = document.getElementById('close-timer-modal-btn');

    const openTimer = () => {
      if (timerModal) {
        timerModal.classList.add('open');
        timerModal.setAttribute('aria-hidden', 'false');
      }
    };

    const closeTimer = () => {
      if (timerModal) {
        timerModal.classList.remove('open');
        timerModal.setAttribute('aria-hidden', 'true');
      }
    };

    openTimerBtn?.addEventListener('click', openTimer);
    closeTimerBtn?.addEventListener('click', closeTimer);
    timerModal?.addEventListener('click', (e) => {
      if (e.target === timerModal) closeTimer();
    });

    // Close on Escape key
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeMixer();
        closeTimer();
      }
    });
  }

  private bindThemeUI(): void {
    const themeBtn = document.getElementById('theme-toggle-btn');
    if (!themeBtn) return;

    themeBtn.addEventListener('click', () => {
      const currentTheme = this.prefs.getPreferences().theme;
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      this.prefs.setTheme(newTheme);
      this.prefs.applyTheme(newTheme);
    });
  }

  private bindTimerUI(): void {
    const timerText = document.getElementById('timer-display');
    const startPauseBtn = document.getElementById('timer-start-pause-btn');
    const resetBtn = document.getElementById('timer-reset-btn');
    const pomodoroBtn = document.getElementById('timer-mode-pomodoro');
    const breakBtn = document.getElementById('timer-mode-break');
    const sleepPills = document.querySelectorAll('.sleep-pill');

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

    pomodoroBtn?.addEventListener('click', () => {
      this.timer.setMode('pomodoro');
      pomodoroBtn.classList.add('active');
      breakBtn?.classList.remove('active');
      sleepPills.forEach(p => p.classList.remove('active'));
    });

    breakBtn?.addEventListener('click', () => {
      this.timer.setMode('shortBreak');
      breakBtn.classList.add('active');
      pomodoroBtn?.classList.remove('active');
      sleepPills.forEach(p => p.classList.remove('active'));
    });

    sleepPills.forEach(pill => {
      pill.addEventListener('click', () => {
        const mins = parseInt(pill.getAttribute('data-sleep-minutes') || '30', 10);
        this.timer.setMode('sleep', mins);
        sleepPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        pomodoroBtn?.classList.remove('active');
        breakBtn?.classList.remove('active');
      });
    });
  }

  private bindAudioMixerUI(): void {
    const playPauseBtn = document.getElementById('audio-play-pause-btn');
    const playIcon = playPauseBtn?.querySelector('.play-icon') as HTMLElement;
    const pauseIcon = playPauseBtn?.querySelector('.pause-icon') as HTMLElement;
    const labelSpan = document.getElementById('audio-btn-label');
    const masterSlider = document.getElementById('mixer-master-slider') as HTMLInputElement;

    playPauseBtn?.addEventListener('click', async () => {
      await this.audio.togglePlay();
      const isPlaying = this.audio.isAudioPlaying();
      if (playPauseBtn) {
        playPauseBtn.classList.toggle('playing', isPlaying);
        if (labelSpan) labelSpan.textContent = isPlaying ? 'Pause Ambience' : 'Play Ambience';
        if (playIcon) playIcon.style.display = isPlaying ? 'none' : 'block';
        if (pauseIcon) pauseIcon.style.display = isPlaying ? 'block' : 'none';
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
    const presetPills = document.querySelectorAll('.preset-pill[data-preset-id]');
    presetPills.forEach(pill => {
      pill.addEventListener('click', () => {
        const presetId = pill.getAttribute('data-preset-id');
        if (!presetId) return;

        presetPills.forEach(p => {
          p.classList.remove('active');
          p.setAttribute('aria-checked', 'false');
        });
        pill.classList.add('active');
        pill.setAttribute('aria-checked', 'true');

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
    const container = document.querySelector('.ambient-app-container') || document.body;

    let idleTimeoutId: number | null = null;
    const IDLE_DELAY_MS = 2800; // 2.8s of no mouse movement in fullscreen

    const showOverlays = () => {
      container.classList.remove('ambient-idle-hidden');
    };

    const hideOverlaysIfIdle = () => {
      // Only hide if currently in fullscreen
      if (!document.fullscreenElement) return;

      // Do not hide if any modal is open
      const mixerOpen = document.getElementById('sound-mixer-modal')?.classList.contains('open');
      const timerOpen = document.getElementById('timer-modal')?.classList.contains('open');
      if (mixerOpen || timerOpen) return;

      container.classList.add('ambient-idle-hidden');
    };

    const resetIdleTimer = () => {
      showOverlays();

      if (idleTimeoutId !== null) {
        window.clearTimeout(idleTimeoutId);
        idleTimeoutId = null;
      }

      if (document.fullscreenElement) {
        idleTimeoutId = window.setTimeout(hideOverlaysIfIdle, IDLE_DELAY_MS);
      }
    };

    // Fullscreen state listener
    document.addEventListener('fullscreenchange', () => {
      if (document.fullscreenElement) {
        resetIdleTimer();
      } else {
        if (idleTimeoutId !== null) {
          window.clearTimeout(idleTimeoutId);
          idleTimeoutId = null;
        }
        showOverlays();
      }
    });

    // Inactivity listeners
    const activityEvents = ['mousemove', 'mousedown', 'pointermove', 'touchstart', 'keydown'];
    activityEvents.forEach(eventType => {
      window.addEventListener(
        eventType,
        () => {
          if (document.fullscreenElement) {
            resetIdleTimer();
          }
        },
        { passive: true }
      );
    });

    const toggleFullscreen = () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
          console.warn('[NoSleep] Fullscreen request denied:', err);
        });
      } else {
        document.exitFullscreen().catch(console.warn);
      }
    };

    fsBtn?.addEventListener('click', toggleFullscreen);

    // Keyboard shortcuts: F for Fullscreen, Z for Zen mode toggle
    window.addEventListener('keydown', (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
      if (isInput) return;

      if ((e.key === 'f' || e.key === 'F') && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        toggleFullscreen();
      } else if ((e.key === 'z' || e.key === 'Z') && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        const isHidden = container.classList.toggle('ambient-idle-hidden');
        if (!isHidden && document.fullscreenElement) {
          resetIdleTimer();
        }
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
            <p>NoSleep Screen Awake Active</p>
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
    const shareText = document.getElementById('share-btn-text');
    if (!shareBtn) return;

    shareBtn.addEventListener('click', async () => {
      const preset = this.prefs.getActivePreset();
      const hash = this.prefs.encodePresetToHash(preset);
      const url = `${window.location.origin}${window.location.pathname}#p=${hash}`;

      try {
        await navigator.clipboard.writeText(url);
        if (shareText) {
          const original = shareText.textContent;
          shareText.textContent = 'Copied!';
          setTimeout(() => {
            shareText.textContent = original;
          }, 2000);
        }
      } catch {
        prompt('Copy this shareable preset URL:', url);
      }
    });
  }
}

// Auto-boot on DOM ready with zero blocking on initial paint
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    requestAnimationFrame(() => {
      const app = new NoSleepApp();
      app.init();
    });
  });
}
