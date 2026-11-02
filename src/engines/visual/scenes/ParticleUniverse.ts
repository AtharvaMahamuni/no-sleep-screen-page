import type { IScene } from '../SceneManager';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  baseAlpha: number;
  hueOffset: number;
}

export class ParticleUniverseScene implements IScene {
  public id = 'particles';
  public name = 'Constellation Particles';

  private width: number = 0;
  private height: number = 0;
  private particles: Particle[] = [];
  private pointerX: number = -9999;
  private pointerY: number = -9999;
  private time: number = 0;

  public init(_ctx: CanvasRenderingContext2D, width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.time = 0;
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
    const dt = Math.min(delta, 100) * 0.001;
    this.time += dt;

    ctx.save();

    const maxDist = 90;
    const maxDistSq = maxDist * maxDist;

    // 1. Update positions & connect nearby particles with delicate constellation web
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];

      // Subtle harmonic fluid curl
      const curl = Math.sin(this.time * 0.4 + p.y * 0.005) * 0.15;
      p.x += (p.vx + curl) * dt * 45;
      p.y += p.vy * dt * 45;

      // Wrap boundaries
      if (p.x < -10) p.x = this.width + 10;
      if (p.x > this.width + 10) p.x = -10;
      if (p.y < -10) p.y = this.height + 10;
      if (p.y > this.height + 10) p.y = -10;

      // Interactive pointer force
      if (this.pointerX > 0) {
        const dx = this.pointerX - p.x;
        const dy = this.pointerY - p.y;
        const distSq = dx * dx + dy * dy;
        if (distSq < 22500 && distSq > 25) {
          const dist = Math.sqrt(distSq);
          const force = (1 - dist / 150) * 0.8;
          p.x += (dx / dist) * force;
          p.y += (dy / dist) * force;
          p.alpha = Math.min(0.9, p.baseAlpha + 0.35);
        } else {
          p.alpha += (p.baseAlpha - p.alpha) * 0.04;
        }
      }

      // Draw constellation links to nearby particles (fast squared distance check)
      for (let j = i + 1; j < this.particles.length; j++) {
        const p2 = this.particles[j];
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const dSq = dx * dx + dy * dy;

        if (dSq < maxDistSq) {
          const linkAlpha = (1 - dSq / maxDistSq) * 0.18;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(245, 78, 0, ${linkAlpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }

      // Draw particle mote with soft halo
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(245, 95, 20, ${p.alpha})`;
      ctx.fill();

      if (p.size > 1.8) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(245, 78, 0, ${p.alpha * 0.2})`;
        ctx.fill();
      }
    }

    ctx.restore();
  }

  public destroy(): void {
    this.particles = [];
  }

  private spawnParticles(): void {
    const area = this.width * this.height;
    const count = Math.min(100, Math.max(35, Math.floor(area / 12000)));
    this.particles = [];

    for (let i = 0; i < count; i++) {
      const baseAlpha = 0.25 + Math.random() * 0.45;
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: -0.15 - Math.random() * 0.35,
        size: 1 + Math.random() * 2.2,
        alpha: baseAlpha,
        baseAlpha,
        hueOffset: Math.random() * 20,
      });
    }
  }
}
