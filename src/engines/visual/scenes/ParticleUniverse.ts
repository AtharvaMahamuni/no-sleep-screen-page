import type { IScene } from '../SceneManager';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  baseAlpha: number;
}

export class ParticleUniverseScene implements IScene {
  public id = 'particles';
  public name = 'Particle Universe';

  private width: number = 0;
  private height: number = 0;
  private particles: Particle[] = [];
  private pointerX: number = -9999;
  private pointerY: number = -9999;

  public init(_ctx: CanvasRenderingContext2D, width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.spawnParticles();
  }

  public resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.spawnParticles();
  }

  public onPointerMove(x: number, y: number): void {
    this.pointerX = x;
    this.pointerY = y;
  }

  public render(ctx: CanvasRenderingContext2D, delta: number): void {
    const timeScale = delta * 0.06;

    ctx.save();
    for (const p of this.particles) {
      // Gentle drift
      p.x += p.vx * timeScale;
      p.y += p.vy * timeScale;

      // Wrap around bounds
      if (p.x < -10) p.x = this.width + 10;
      if (p.x > this.width + 10) p.x = -10;
      if (p.y < -10) p.y = this.height + 10;
      if (p.y > this.height + 10) p.y = -10;

      // Pointer interaction (gentle attraction)
      const dx = this.pointerX - p.x;
      const dy = this.pointerY - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 140 && dist > 5) {
        const force = (1 - dist / 140) * 0.4;
        p.x += (dx / dist) * force;
        p.y += (dy / dist) * force;
        p.alpha = Math.min(1, p.baseAlpha + 0.4);
      } else {
        p.alpha += (p.baseAlpha - p.alpha) * 0.05;
      }

      ctx.fillStyle = `rgba(245, 78, 0, ${p.alpha})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  public destroy(): void {
    this.particles = [];
  }

  private spawnParticles(): void {
    const count = Math.min(120, Math.floor((this.width * this.height) / 8000));
    this.particles = [];

    for (let i = 0; i < count; i++) {
      const baseAlpha = 0.15 + Math.random() * 0.45;
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -0.2 - Math.random() * 0.4, // Gentle upward ambient drift
        size: 1 + Math.random() * 2.5,
        alpha: baseAlpha,
        baseAlpha: baseAlpha,
      });
    }
  }
}
