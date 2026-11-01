export type TimerMode = 'pomodoro' | 'shortBreak' | 'sleep' | 'custom';

export interface TimerState {
  remainingSeconds: number;
  totalSeconds: number;
  isRunning: boolean;
  mode: TimerMode;
  formattedTime: string;
}

export type TimerTickCallback = (state: TimerState) => void;
export type TimerCompleteCallback = (mode: TimerMode) => void;

export class TimerManager {
  private totalSeconds: number = 25 * 60;
  private remainingSeconds: number = 25 * 60;
  private isRunning: boolean = false;
  private mode: TimerMode = 'pomodoro';

  private intervalId: any = null;
  private targetTimestamp: number = 0;

  private tickListeners: TimerTickCallback[] = [];
  private completeListeners: TimerCompleteCallback[] = [];

  constructor() {}

  public setMode(mode: TimerMode, customMinutes?: number): void {
    this.mode = mode;
    let mins = 25;
    if (mode === 'pomodoro') mins = 25;
    else if (mode === 'shortBreak') mins = 5;
    else if (mode === 'sleep') mins = customMinutes ?? 30;
    else if (mode === 'custom') mins = customMinutes ?? 15;

    this.setTime(mins * 60);
  }

  public setTime(seconds: number): void {
    this.pause();
    this.totalSeconds = Math.max(1, seconds);
    this.remainingSeconds = this.totalSeconds;
    this.notifyTick();
  }

  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.targetTimestamp = Date.now() + this.remainingSeconds * 1000;

    this.intervalId = setInterval(() => {
      this.tick();
    }, 250);

    this.notifyTick();
  }

  public pause(): void {
    if (!this.isRunning) return;
    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.notifyTick();
  }

  public reset(): void {
    this.pause();
    this.remainingSeconds = this.totalSeconds;
    this.notifyTick();
  }

  public toggle(): void {
    if (this.isRunning) {
      this.pause();
    } else {
      this.start();
    }
  }

  public getState(): TimerState {
    return {
      remainingSeconds: this.remainingSeconds,
      totalSeconds: this.totalSeconds,
      isRunning: this.isRunning,
      mode: this.mode,
      formattedTime: this.formatTime(this.remainingSeconds),
    };
  }

  public onTick(callback: TimerTickCallback): () => void {
    this.tickListeners.push(callback);
    callback(this.getState());
    return () => {
      this.tickListeners = this.tickListeners.filter(cb => cb !== callback);
    };
  }

  public onComplete(callback: TimerCompleteCallback): () => void {
    this.completeListeners.push(callback);
    return () => {
      this.completeListeners = this.completeListeners.filter(cb => cb !== callback);
    };
  }

  private tick(): void {
    const now = Date.now();
    const remainingMs = Math.max(0, this.targetTimestamp - now);
    this.remainingSeconds = Math.ceil(remainingMs / 1000);

    this.notifyTick();

    if (this.remainingSeconds <= 0) {
      this.pause();
      this.completeListeners.forEach(cb => cb(this.mode));
    }
  }

  private notifyTick(): void {
    const state = this.getState();
    this.tickListeners.forEach(cb => cb(state));
  }

  private formatTime(totalSeconds: number): string {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
}
