import type { IScene } from '../SceneManager';

interface FoamParticle {
  x: number;
  waveIndex: number;
  offsetY: number;
  size: number;
  alpha: number;
  speed: number;
}

export class OceanHarmonicsScene implements IScene {
  public id = 'ocean-harmonics';
  public name = 'Ocean Harmonics';

  private width: number = 0;
  private height: number = 0;
  private time: number = 0;
  private pointerX: number = -9999;
  private particles: FoamParticle[] = [];

  // Wave layer configurations (golden ratio frequency harmonics)
  private readonly waveLayers = [
    { freq1: 0.0035, freq2: 0.007, speed: 0.35, amp: 28, yRatio: 0.68, colorStart: 'rgba(245, 78, 0, 0.04)', colorEnd: 'rgba(245, 78, 0, 0.18)', stroke: 'rgba(245, 78, 0, 0.25)' },
    { freq1: 0.005, freq2: 0.009, speed: 0.55, amp: 22, yRatio: 0.74, colorStart: 'rgba(245, 95, 20, 0.06)', colorEnd: 'rgba(245, 95, 20, 0.28)', stroke: 'rgba(245, 95, 20, 0.45)' },
    { freq1: 0.0065, freq2: 0.012, speed: 0.75, amp: 16, yRatio: 0.81, colorStart: 'rgba(245, 120, 40, 0.08)', colorEnd: 'rgba(245, 120, 40, 0.38)', stroke: 'rgba(245, 120, 40, 0.65)' },
    { freq1: 0.008, freq2: 0.015, speed: 0.95, amp: 12, yRatio: 0.87, colorStart: 'rgba(245, 140, 60, 0.12)', colorEnd: 'rgba(245, 140, 60, 0.52)', stroke: 'rgba(245, 140, 60, 0.85)' },
  ];

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

  public onPointerMove(x: number, _y: number): void {
    this.pointerX = x;
  }

  public render(ctx: CanvasRenderingContext2D, delta: number): void {
    const dt = Math.min(delta, 100) * 0.001;
    this.time += dt;

    ctx.save();

    // Slow meditative tidal surge (breathes subtly over 14 seconds without any text/numbers)
    const tidalSurge = Math.sin((this.time * Math.PI * 2) / 14) * 18;

    // Render 4 harmonic wave ribbons from back to front
    for (let layerIdx = 0; layerIdx < this.waveLayers.length; layerIdx++) {
      const layer = this.waveLayers[layerIdx];
      const baseY = this.height * layer.yRatio + tidalSurge * (1 - layerIdx * 0.2);

      ctx.beginPath();
      ctx.moveTo(0, this.height);

      // Plot smooth points across screen width
      const step = Math.max(16, Math.floor(this.width / 45));
      for (let x = 0; x <= this.width + step; x += step) {
        // Harmonic composite sine & cosine
        const wave1 = Math.sin(x * layer.freq1 + this.time * layer.speed) * layer.amp;
        const wave2 = Math.cos(x * layer.freq2 - this.time * layer.speed * 0.7) * (layer.amp * 0.4);

        // Interactive ripple displacement from pointer
        let pointerDisplacement = 0;
        if (this.pointerX > 0) {
          const distToX = Math.abs(this.pointerX - x);
          if (distToX < 180) {
            const factor = Math.cos((distToX / 180) * (Math.PI / 2));
            pointerDisplacement = factor * 14 * Math.sin(this.time * 4);
          }
        }

        const y = baseY + wave1 + wave2 + pointerDisplacement;
        if (x === 0) {
          ctx.lineTo(0, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.lineTo(this.width, this.height);
      ctx.closePath();

      // Fluid gradient fill
      const grad = ctx.createLinearGradient(0, baseY - layer.amp, 0, this.height);
      grad.addColorStop(0, layer.colorStart);
      grad.addColorStop(1, layer.colorEnd);
      ctx.fillStyle = grad;
      ctx.fill();

      // Surface crest highlight
      ctx.strokeStyle = layer.stroke;
      ctx.lineWidth = 1.2 + layerIdx * 0.4;
      ctx.stroke();
    }

    // Render floating bioluminescent seafoam motes
    for (const p of this.particles) {
      p.x += p.speed * dt * 25;
      if (p.x > this.width + 10) p.x = -10;

      const layer = this.waveLayers[p.waveIndex];
      const baseY = this.height * layer.yRatio + tidalSurge;
      const waveY =
        Math.sin(p.x * layer.freq1 + this.time * layer.speed) * layer.amp +
        Math.cos(p.x * layer.freq2 - this.time * layer.speed * 0.7) * (layer.amp * 0.4);

      const py = baseY + waveY + p.offsetY;

      ctx.beginPath();
      ctx.arc(p.x, py, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(245, 140, 60, ${p.alpha * (0.5 + 0.5 * Math.sin(this.time * 2 + p.x))})`;
      ctx.fill();
    }

    ctx.restore();
  }

  public destroy(): void {
    this.particles = [];
  }

  private spawnParticles(): void {
    const count = Math.min(60, Math.max(20, Math.floor(this.width / 30)));
    this.particles = [];

    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        waveIndex: Math.floor(Math.random() * this.waveLayers.length),
        offsetY: (Math.random() - 0.5) * 12,
        size: 1 + Math.random() * 2,
        alpha: 0.35 + Math.random() * 0.5,
        speed: 0.6 + Math.random() * 0.8,
      });
    }
  }
}
