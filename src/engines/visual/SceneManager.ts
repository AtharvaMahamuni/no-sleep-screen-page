export interface IScene {
  id: string;
  name: string;
  init(ctx: CanvasRenderingContext2D, width: number, height: number, dpr: number): void;
  resize(width: number, height: number, dpr: number): void;
  render(ctx: CanvasRenderingContext2D, deltaTime: number): void;
  onPointerMove?(x: number, y: number): void;
  destroy(): void;
}

export class SceneManager {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private currentScene: IScene | null = null;
  private scenes: Map<string, () => IScene> = new Map();

  private animFrameId: number | null = null;
  private lastTime: number = 0;
  private isSuspended: boolean = false;
  private isLowPower: boolean = false;

  private width: number = 0;
  private height: number = 0;
  private dpr: number = 1;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d', { alpha: true });
    if (!context) {
      throw new Error('[NoSleep] Unable to get Canvas 2D context');
    }
    this.ctx = context;

    this.handleResize = this.handleResize.bind(this);
    this.loop = this.loop.bind(this);
    this.handleVisibility = this.handleVisibility.bind(this);
    this.handlePointer = this.handlePointer.bind(this);

    window.addEventListener('resize', this.handleResize, { passive: true });
    document.addEventListener('visibilitychange', this.handleVisibility);
    this.canvas.addEventListener('pointermove', this.handlePointer, { passive: true });

    // Schedule resize in animation frame to prevent synchronous forced reflow during boot
    if (typeof requestAnimationFrame !== 'undefined') {
      requestAnimationFrame(this.handleResize);
    } else {
      this.handleResize();
    }
  }

  public registerScene(id: string, factory: () => IScene): void {
    this.scenes.set(id, factory);
  }

  public switchScene(id: string): void {
    if (this.currentScene?.id === id) return;

    if (this.currentScene) {
      this.currentScene.destroy();
      this.currentScene = null;
    }

    const factory = this.scenes.get(id);
    if (!factory) {
      console.warn(`[NoSleep] Scene "${id}" not found. Falling back to default.`);
      return;
    }

    const scene = factory();
    scene.init(this.ctx, this.width, this.height, this.dpr);
    this.currentScene = scene;

    if (!this.animFrameId && !this.isSuspended) {
      this.lastTime = performance.now();
      this.animFrameId = requestAnimationFrame(this.loop);
    }
  }

  public setLowPowerMode(lowPower: boolean): void {
    this.isLowPower = lowPower;
  }

  public start(): void {
    this.isSuspended = false;
    if (!this.animFrameId) {
      this.lastTime = performance.now();
      this.animFrameId = requestAnimationFrame(this.loop);
    }
  }

  public stop(): void {
    this.isSuspended = true;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  public destroy(): void {
    this.stop();
    window.removeEventListener('resize', this.handleResize);
    document.removeEventListener('visibilitychange', this.handleVisibility);
    this.canvas.removeEventListener('pointermove', this.handlePointer);

    if (this.currentScene) {
      this.currentScene.destroy();
      this.currentScene = null;
    }
  }

  private handleResize(): void {
    // Read viewport dimensions without triggering forced layout reflow
    this.width = window.innerWidth || document.documentElement.clientWidth || 360;
    this.height = window.innerHeight || document.documentElement.clientHeight || 640;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.canvas.width = Math.floor(this.width * this.dpr);
    this.canvas.height = Math.floor(this.height * this.dpr);

    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    if (this.currentScene) {
      this.currentScene.resize(this.width, this.height, this.dpr);
    }
  }

  private handleVisibility(): void {
    if (document.hidden) {
      // Suspend completely when tab is hidden (0% CPU / GPU)
      this.stop();
    } else {
      this.start();
    }
  }

  private handlePointer(e: PointerEvent): void {
    if (!this.currentScene?.onPointerMove) return;
    // Canvas is full viewport; direct client coordinates avoids getBoundingClientRect reflow
    this.currentScene.onPointerMove(e.clientX, e.clientY);
  }

  private loop(timestamp: number): void {
    if (this.isSuspended) return;

    const delta = Math.min(timestamp - this.lastTime, 100); // Guard against giant delta jumps
    this.lastTime = timestamp;

    if (this.currentScene) {
      this.ctx.clearRect(0, 0, this.width, this.height);
      this.currentScene.render(this.ctx, delta);
    }

    // Adaptive frame throttling on low power mode (~30 FPS)
    if (this.isLowPower) {
      setTimeout(() => {
        if (!this.isSuspended) {
          this.animFrameId = requestAnimationFrame(this.loop);
        }
      }, 33);
    } else {
      this.animFrameId = requestAnimationFrame(this.loop);
    }
  }
}
