import type { IScene } from '../SceneManager';

interface OrbitBody {
  radius: number;
  speed: number;
  angle: number;
  size: number;
  color: string;
}

export class OrbitalAtomsScene implements IScene {
  public id = 'orbit';
  public name = 'Orbital Atoms';

  private width: number = 0;
  private height: number = 0;
  private bodies: OrbitBody[] = [];

  public init(_ctx: CanvasRenderingContext2D, width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.setupOrbits();
  }

  public resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.setupOrbits();
  }

  public render(ctx: CanvasRenderingContext2D, delta: number): void {
    const centerX = this.width / 2;
    const centerY = this.height / 2;

    ctx.save();

    // Central core
    ctx.fillStyle = '#f54e00';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 6, 0, Math.PI * 2);
    ctx.fill();

    // Render rings & revolving bodies
    for (const body of this.bodies) {
      body.angle += body.speed * (delta * 0.001);

      // Orbital track
      ctx.strokeStyle = 'rgba(230, 229, 224, 0.45)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(centerX, centerY, body.radius, 0, Math.PI * 2);
      ctx.stroke();

      // Body position
      const bx = centerX + Math.cos(body.angle) * body.radius;
      const by = centerY + Math.sin(body.angle) * body.radius;

      // Glow trail
      const glow = ctx.createRadialGradient(bx, by, 0, bx, by, body.size * 2);
      glow.addColorStop(0, body.color);
      glow.addColorStop(1, 'rgba(245, 78, 0, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(bx, by, body.size * 2, 0, Math.PI * 2);
      ctx.fill();

      // Node
      ctx.fillStyle = body.color;
      ctx.beginPath();
      ctx.arc(bx, by, body.size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  public destroy(): void {
    this.bodies = [];
  }

  private setupOrbits(): void {
    const minDim = Math.min(this.width, this.height);
    this.bodies = [
      { radius: minDim * 0.12, speed: 0.8, angle: 0, size: 3.5, color: '#f54e00' },
      { radius: minDim * 0.22, speed: -0.5, angle: 1.2, size: 4.5, color: '#d04200' },
      { radius: minDim * 0.32, speed: 0.35, angle: 3.4, size: 5, color: '#f54e00' },
      { radius: minDim * 0.42, speed: -0.22, angle: 5.1, size: 6, color: '#a09c92' },
    ];
  }
}
