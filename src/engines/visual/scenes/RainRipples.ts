import type { IScene } from '../SceneManager';

interface RainDrop {
  x: number;
  y: number;
  length: number;
  speed: number;
  layer: number; // 0 = far, 1 = mid, 2 = near
  alpha: number;
  slant: number;
}

interface WaterRipple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  progress: number;
}

export class RainRipplesScene implements IScene {
  public id = 'rain-ripples';
  public name = 'Rain & Water Ripples';

  private width: number = 0;
  private height: number = 0;
  private drops: RainDrop[] = [];
  private ripples: WaterRipple[] = [];
  private maxRipples = 40;
  private pointerX: number = -9999;
  private pointerY: number = -9999;
  private pointerSpawnCooldown: number = 0;

  public init(_ctx: CanvasRenderingContext2D, width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.spawnRain();
  }

  public resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.spawnRain();
  }

  public onPointerMove(x: number, y: number): void {
    this.pointerX = x;
    this.pointerY = y;
  }

  public render(ctx: CanvasRenderingContext2D, delta: number): void {
    const dt = Math.min(delta, 100) * 0.001; // Clamp delta to prevent jumps

    ctx.save();

    // 1. Interactive ripples from cursor / touch
    if (this.pointerX > 0 && this.pointerY > 0) {
      this.pointerSpawnCooldown -= dt;
      if (this.pointerSpawnCooldown <= 0) {
        this.addRipple(this.pointerX, this.pointerY, 25 + Math.random() * 20);
        this.pointerSpawnCooldown = 0.12;
      }
    }

    // 2. Render & update expanding water ripples at ground / water surface
    for (let i = this.ripples.length - 1; i >= 0; i--) {
      const r = this.ripples[i];
      r.progress += dt * 1.4;
      if (r.progress >= 1.0) {
        this.ripples.splice(i, 1);
        continue;
      }

      const currentRadius = r.maxRadius * Math.sin((r.progress * Math.PI) / 2);
      const alpha = (1 - r.progress) * r.alpha;

      // Outer ripple
      ctx.beginPath();
      ctx.ellipse(r.x, r.y, currentRadius, currentRadius * 0.32, 0, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(245, 78, 0, ${alpha * 0.75})`;
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Inner faint secondary ripple
      if (currentRadius > 8) {
        ctx.beginPath();
        ctx.ellipse(r.x, r.y, currentRadius * 0.55, currentRadius * 0.18, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(245, 78, 0, ${alpha * 0.35})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
    }

    // 3. Render & update falling raindrops (3 parallax layers)
    for (const drop of this.drops) {
      drop.x += drop.slant * drop.speed * dt;
      drop.y += drop.speed * dt;

      // When drop reaches surface (bottom 15% of viewport or random ground hits)
      const groundHitY = this.height - 20 - (1 - drop.layer * 0.4) * 40;
      if (drop.y >= groundHitY) {
        if (Math.random() < (drop.layer === 2 ? 0.85 : 0.35)) {
          this.addRipple(drop.x, groundHitY + Math.random() * 15, 12 + drop.layer * 12);
        }
        // Respawn above screen
        drop.y = -drop.length - Math.random() * 50;
        drop.x = Math.random() * (this.width + 100) - 50;
      }

      // Draw raindrop streak
      const startX = drop.x;
      const startY = drop.y;
      const endX = drop.x - drop.slant * drop.length;
      const endY = drop.y - drop.length;

      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);

      // Colors: far layer softer amber, near layer crisp cursor orange
      if (drop.layer === 0) {
        ctx.strokeStyle = `rgba(245, 120, 50, ${drop.alpha * 0.35})`;
        ctx.lineWidth = 0.8;
      } else if (drop.layer === 1) {
        ctx.strokeStyle = `rgba(245, 90, 20, ${drop.alpha * 0.6})`;
        ctx.lineWidth = 1.1;
      } else {
        ctx.strokeStyle = `rgba(245, 78, 0, ${drop.alpha})`;
        ctx.lineWidth = 1.6;
      }
      ctx.stroke();
    }

    // 4. Subtle ambient mist glow at bottom
    const mistGradient = ctx.createLinearGradient(0, this.height - 80, 0, this.height);
    mistGradient.addColorStop(0, 'rgba(245, 78, 0, 0)');
    mistGradient.addColorStop(1, 'rgba(245, 78, 0, 0.06)');
    ctx.fillStyle = mistGradient;
    ctx.fillRect(0, this.height - 80, this.width, 80);

    ctx.restore();
  }

  public destroy(): void {
    this.drops = [];
    this.ripples = [];
  }

  private addRipple(x: number, y: number, maxRadius: number): void {
    if (this.ripples.length >= this.maxRipples) {
      this.ripples.shift();
    }
    this.ripples.push({
      x,
      y,
      radius: 0,
      maxRadius,
      alpha: 0.55 + Math.random() * 0.35,
      progress: 0,
    });
  }

  private spawnRain(): void {
    const area = this.width * this.height;
    // Optimal density for buttery smooth 60fps
    const count = Math.min(180, Math.max(50, Math.floor(area / 9000)));
    this.drops = [];

    for (let i = 0; i < count; i++) {
      // 3 Layers: 50% far, 35% mid, 15% near
      const rand = Math.random();
      let layer = 0;
      let length = 12 + Math.random() * 10;
      let speed = 480 + Math.random() * 180;
      let alpha = 0.25 + Math.random() * 0.25;

      if (rand > 0.85) {
        layer = 2; // Near
        length = 32 + Math.random() * 22;
        speed = 1000 + Math.random() * 300;
        alpha = 0.65 + Math.random() * 0.3;
      } else if (rand > 0.5) {
        layer = 1; // Mid
        length = 20 + Math.random() * 14;
        speed = 720 + Math.random() * 200;
        alpha = 0.4 + Math.random() * 0.3;
      }

      this.drops.push({
        x: Math.random() * (this.width + 100) - 50,
        y: Math.random() * this.height,
        length,
        speed,
        layer,
        alpha,
        slant: 0.12 + (Math.random() - 0.5) * 0.04, // Gentle rightward wind slant
      });
    }
  }
}
