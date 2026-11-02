import type { IScene } from '../SceneManager';

interface Star3D {
  x: number;
  y: number;
  z: number;
  armAngle: number;
  radius: number;
  speed: number;
  size: number;
  baseAlpha: number;
  colorType: number; // 0 = warm orange, 1 = warm amber, 2 = soft cream
}

export class Galaxy3DScene implements IScene {
  public id = 'galaxy';
  public name = 'Cosmic Galaxy 3D';

  private width: number = 0;
  private height: number = 0;
  private stars: Star3D[] = [];
  private time: number = 0;

  // Camera angles with smooth mouse parallax
  private targetTiltX: number = 0.55; // Initial disk incline (~32 degrees)
  private targetTiltY: number = 0.0;
  private currentTiltX: number = 0.55;
  private currentTiltY: number = 0.0;

  private readonly FOV = 450;
  private readonly NUM_ARMS = 3;

  public init(_ctx: CanvasRenderingContext2D, width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.time = 0;
    this.spawnGalaxy();
  }

  public resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.spawnGalaxy();
  }

  public onPointerMove(x: number, y: number): void {
    const normX = (x / this.width - 0.5) * 2;
    const normY = (y / this.height - 0.5) * 2;
    this.targetTiltX = 0.55 + normY * 0.25;
    this.targetTiltY = normX * 0.35;
  }

  public render(ctx: CanvasRenderingContext2D, delta: number): void {
    const dt = Math.min(delta, 100) * 0.001;
    this.time += dt * 0.15; // Slow, meditative rotation

    // Smooth spring interpolation for camera angles
    this.currentTiltX += (this.targetTiltX - this.currentTiltX) * 0.05;
    this.currentTiltY += (this.targetTiltY - this.currentTiltY) * 0.05;

    const centerX = this.width / 2;
    const centerY = this.height / 2;

    ctx.save();

    // 1. Draw glowing Galactic Core
    const coreRadius = Math.min(this.width, this.height) * 0.14;
    const coreGlow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, coreRadius * 2);
    coreGlow.addColorStop(0, 'rgba(245, 78, 0, 0.45)');
    coreGlow.addColorStop(0.3, 'rgba(245, 100, 30, 0.2)');
    coreGlow.addColorStop(0.7, 'rgba(245, 78, 0, 0.05)');
    coreGlow.addColorStop(1, 'rgba(245, 78, 0, 0)');

    ctx.fillStyle = coreGlow;
    ctx.beginPath();
    ctx.arc(centerX, centerY, coreRadius * 2, 0, Math.PI * 2);
    ctx.fill();

    // Trig for 3D Camera Rotation
    const cosX = Math.cos(this.currentTiltX);
    const sinX = Math.sin(this.currentTiltX);
    const cosY = Math.cos(this.currentTiltY);
    const sinY = Math.sin(this.currentTiltY);

    // 2. Render Stars with Depth Projection
    for (const star of this.stars) {
      // Rotate star along its galactic orbital path
      star.armAngle += star.speed * dt;
      const x = Math.cos(star.armAngle) * star.radius;
      const z = Math.sin(star.armAngle) * star.radius;
      const y = star.y;

      // Apply 3D Camera Tilt (Y then X rotation)
      const xRot = x * cosY - z * sinY;
      const zTemp = x * sinY + z * cosY;

      const yRot = y * cosX - zTemp * sinX;
      const zRot = y * sinX + zTemp * cosX;

      // Perspective projection
      const distance = this.FOV + zRot;
      if (distance <= 10) continue; // Behind camera clip

      const scale = this.FOV / distance;
      const screenX = centerX + xRot * scale;
      const screenY = centerY + yRot * scale;

      // Depth attenuation
      const alphaDepth = Math.max(0.1, Math.min(1.0, (zRot + 300) / 600));
      const starAlpha = star.baseAlpha * alphaDepth;
      const starSize = Math.max(0.6, star.size * scale);

      ctx.beginPath();
      ctx.arc(screenX, screenY, starSize, 0, Math.PI * 2);

      if (star.colorType === 0) {
        ctx.fillStyle = `rgba(245, 78, 0, ${starAlpha})`;
      } else if (star.colorType === 1) {
        ctx.fillStyle = `rgba(245, 130, 50, ${starAlpha * 0.9})`;
      } else {
        ctx.fillStyle = `rgba(247, 247, 244, ${starAlpha * 0.85})`;
      }
      ctx.fill();

      // Soft halo on larger close foreground stars
      if (starSize > 2.0 && starAlpha > 0.4) {
        ctx.beginPath();
        ctx.arc(screenX, screenY, starSize * 2.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(245, 78, 0, ${starAlpha * 0.25})`;
        ctx.fill();
      }
    }

    ctx.restore();
  }

  public destroy(): void {
    this.stars = [];
  }

  private spawnGalaxy(): void {
    const maxDim = Math.min(this.width, this.height);
    const maxRadius = maxDim * 0.48;
    const count = Math.min(420, Math.max(160, Math.floor((this.width * this.height) / 3800)));
    this.stars = [];

    for (let i = 0; i < count; i++) {
      // Exponential distribution towards center
      const distRatio = Math.pow(Math.random(), 1.5);
      const radius = 10 + distRatio * maxRadius;

      // Assign to spiral arm with natural angular winding
      const armIndex = i % this.NUM_ARMS;
      const armOffset = (armIndex * (Math.PI * 2)) / this.NUM_ARMS;
      const spiralWinding = radius * 0.015;

      // Gaussian scatter away from core line
      const scatterAngle = (Math.random() - 0.5) * (0.35 + distRatio * 0.6);
      const angle = armOffset + spiralWinding + scatterAngle;

      // Thin disk with central bulge
      const diskHeight = (1 - distRatio) * 45 + 10;
      const y = (Math.random() - 0.5) * diskHeight;

      // Differential galactic rotation: inner stars revolve faster
      const speed = 0.12 + (1 - distRatio) * 0.35;

      const randColor = Math.random();
      let colorType = 0; // Cursor orange
      if (randColor > 0.65) colorType = 2; // Cream star
      else if (randColor > 0.35) colorType = 1; // Amber star

      this.stars.push({
        x: Math.cos(angle) * radius,
        y,
        z: Math.sin(angle) * radius,
        armAngle: angle,
        radius,
        speed,
        size: 0.8 + Math.random() * 2.2,
        baseAlpha: 0.3 + Math.random() * 0.65,
        colorType,
      });
    }
  }
}
