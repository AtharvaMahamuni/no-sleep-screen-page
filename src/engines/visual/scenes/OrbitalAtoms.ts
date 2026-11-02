import type { IScene } from '../SceneManager';

interface OrbitBody {
  semiMajor: number;
  semiMinor: number;
  speed: number;
  angle: number;
  tiltAngle: number;
  size: number;
  color: string;
  glowColor: string;
  trail: { x: number; y: number; alpha: number }[];
}

export class OrbitalAtomsScene implements IScene {
  public id = 'orbit';
  public name = 'Harmonic Orbits';

  private width: number = 0;
  private height: number = 0;
  private bodies: OrbitBody[] = [];
  private time: number = 0;

  public init(_ctx: CanvasRenderingContext2D, width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.time = 0;
    this.setupOrbits();
  }

  public resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.setupOrbits();
  }

  public render(ctx: CanvasRenderingContext2D, delta: number): void {
    const dt = Math.min(delta, 100) * 0.001;
    this.time += dt;

    const centerX = this.width / 2;
    const centerY = this.height / 2;

    ctx.save();

    // 1. Central Pulsating Star / Core
    const pulse = 1 + 0.12 * Math.sin(this.time * 2);
    const coreGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 32 * pulse);
    coreGrad.addColorStop(0, '#f56a28');
    coreGrad.addColorStop(0.35, '#f54e00');
    coreGrad.addColorStop(0.7, 'rgba(245, 78, 0, 0.25)');
    coreGrad.addColorStop(1, 'rgba(245, 78, 0, 0)');

    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 32 * pulse, 0, Math.PI * 2);
    ctx.fill();

    // 2. Render Orbits with 3D Planar Tilts
    for (const body of this.bodies) {
      body.angle += body.speed * dt;

      // Draw Elliptical Tilted Orbit Track
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(body.tiltAngle);

      ctx.beginPath();
      ctx.ellipse(0, 0, body.semiMajor, body.semiMinor, 0, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(245, 78, 0, 0.12)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Current position on tilted ellipse
      const localX = Math.cos(body.angle) * body.semiMajor;
      const localY = Math.sin(body.angle) * body.semiMinor;

      // Transform local position to screen coordinates
      const cosT = Math.cos(body.tiltAngle);
      const sinT = Math.sin(body.tiltAngle);
      const screenX = centerX + localX * cosT - localY * sinT;
      const screenY = centerY + localX * sinT + localY * cosT;

      ctx.restore();

      // Update trail points
      body.trail.push({ x: screenX, y: screenY, alpha: 0.6 });
      if (body.trail.length > 24) body.trail.shift();

      // Render Trail
      for (let i = 0; i < body.trail.length - 1; i++) {
        const pt = body.trail[i];
        const nextPt = body.trail[i + 1];
        const trailAlpha = (i / body.trail.length) * 0.45;

        ctx.beginPath();
        ctx.moveTo(pt.x, pt.y);
        ctx.lineTo(nextPt.x, nextPt.y);
        ctx.strokeStyle = `rgba(245, 78, 0, ${trailAlpha})`;
        ctx.lineWidth = 1 + (i / body.trail.length) * 1.5;
        ctx.stroke();
      }

      // Render Orbital Node & Soft Glow Aura
      const nodeGlow = ctx.createRadialGradient(screenX, screenY, 0, screenX, screenY, body.size * 3);
      nodeGlow.addColorStop(0, body.glowColor);
      nodeGlow.addColorStop(1, 'rgba(245, 78, 0, 0)');
      ctx.fillStyle = nodeGlow;
      ctx.beginPath();
      ctx.arc(screenX, screenY, body.size * 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = body.color;
      ctx.beginPath();
      ctx.arc(screenX, screenY, body.size, 0, Math.PI * 2);
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
      {
        semiMajor: minDim * 0.16,
        semiMinor: minDim * 0.11,
        speed: 0.65,
        angle: 0,
        tiltAngle: -Math.PI / 6,
        size: 3.5,
        color: '#f56a28',
        glowColor: 'rgba(245, 106, 40, 0.45)',
        trail: [],
      },
      {
        semiMajor: minDim * 0.28,
        semiMinor: minDim * 0.19,
        speed: -0.42,
        angle: Math.PI / 3,
        tiltAngle: Math.PI / 4,
        size: 4.5,
        color: '#f54e00',
        glowColor: 'rgba(245, 78, 0, 0.45)',
        trail: [],
      },
      {
        semiMajor: minDim * 0.38,
        semiMinor: minDim * 0.25,
        speed: 0.28,
        angle: Math.PI * 1.2,
        tiltAngle: -Math.PI / 3,
        size: 5.5,
        color: '#d04200',
        glowColor: 'rgba(208, 66, 0, 0.45)',
        trail: [],
      },
      {
        semiMajor: minDim * 0.48,
        semiMinor: minDim * 0.32,
        speed: -0.18,
        angle: Math.PI * 0.7,
        tiltAngle: Math.PI / 12,
        size: 6.5,
        color: '#f59048',
        glowColor: 'rgba(245, 144, 72, 0.45)',
        trail: [],
      },
    ];
  }
}
