import type { WakeLockStatus } from '../../types';

export type WakeLockCallback = (status: WakeLockStatus) => void;

export class WakeLockManager {
  private sentinel: any = null;
  private statusListeners: WakeLockCallback[] = [];
  private currentStatus: WakeLockStatus = 'idle';
  private shouldBeActive: boolean = false;

  constructor() {
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => this.handleVisibilityChange());
    }
  }

  public isSupported(): boolean {
    return typeof navigator !== 'undefined' && 'wakeLock' in navigator;
  }

  public getStatus(): WakeLockStatus {
    return this.currentStatus;
  }

  public async acquire(): Promise<boolean> {
    this.shouldBeActive = true;

    if (!this.isSupported()) {
      this.updateStatus('unsupported');
      return false;
    }

    try {
      this.updateStatus('requesting');
      // @ts-ignore - navigator.wakeLock is standard W3C
      this.sentinel = await navigator.wakeLock.request('screen');

      this.sentinel.addEventListener('release', () => {
        // If release happened while tab is still visible and user wants it active, re-acquire
        if (this.shouldBeActive && typeof document !== 'undefined' && document.visibilityState === 'visible') {
          this.acquire();
        } else {
          this.updateStatus('released');
        }
      });

      this.updateStatus('active');
      return true;
    } catch (err: unknown) {
      console.warn('[NoSleep] Wake Lock request failed:', err);
      this.updateStatus('error');
      return false;
    }
  }

  public async release(): Promise<void> {
    this.shouldBeActive = false;
    if (this.sentinel) {
      try {
        await this.sentinel.release();
      } catch (err) {
        console.warn('[NoSleep] Error releasing sentinel:', err);
      }
      this.sentinel = null;
    }
    this.updateStatus('released');
  }

  public toggle(): Promise<boolean | void> {
    if (this.currentStatus === 'active') {
      return this.release();
    } else {
      return this.acquire();
    }
  }

  public onStatusChange(callback: WakeLockCallback): () => void {
    this.statusListeners.push(callback);
    callback(this.currentStatus);
    return () => {
      this.statusListeners = this.statusListeners.filter(cb => cb !== callback);
    };
  }

  private handleVisibilityChange(): void {
    if (typeof document === 'undefined') return;

    if (this.shouldBeActive && document.visibilityState === 'visible') {
      // Re-acquire sentinel when user returns to tab
      this.acquire();
    }
  }

  private updateStatus(newStatus: WakeLockStatus): void {
    this.currentStatus = newStatus;
    this.statusListeners.forEach(cb => cb(newStatus));
  }
}
