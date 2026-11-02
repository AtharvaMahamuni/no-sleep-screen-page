import type { IScene } from '../SceneManager';

export class BreathingOrbScene implements IScene {
  public id = 'breathing-orb';
  public name = 'Breathing Orb';

  private width: number = 0;
  private height: number = 0;
  private elapsed: number = 0;

  // 16s continuous gentle tidal breathing cycle
  private readonly cycleDuration = 16000;

  public init(_ctx: CanvasRenderingContext2D, width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.elapsed = 0;
  }

  public resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
  }

  public render(ctx: CanvasRenderingContext2D, delta: number): void {
    this.elapsed = (this.elapsed + delta) % this.cycleDuration;

    const centerX = this.width / 2;
    const centerY = this.height / 2;
    const minDim = Math.min(this.width, this.height);
    const baseRadius = minDim * 0.16;

    // Smooth sinusoidal breath expansion (0.0 to 1.0)
    const breathProgress = (Math.sin((this.elapsed * Math.PI * 2) / this.cycleDuration - Math.PI / 2) + 1) / 2;
    const radius = baseRadius * (0.8 + 0.38 * breathProgress);

    ctx.save();

    // 1. Broad Ambient Aura Glow
    const outerAura = ctx.createRadialGradient(centerX, centerY, radius * 0.2, centerX, centerY, radius * 2.8);
    outerAura.addColorStop(0, `rgba(245, 78, 0, ${0.18 + 0.12 * breathProgress})`);
    outerAura.addColorStop(0.5, `rgba(245, 100, 30, ${0.06 + 0.05 * breathProgress})`);
    outerAura.addColorStop(1, 'rgba(245, 78, 0, 0)');

    ctx.fillStyle = outerAura;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 2.8, 0, Math.PI * 2);
    ctx.fill();

    // 2. Multi-layered Concentric Ripple Rings
    for (let i = 1; i <= 3; i++) {
      const ringOffset = ((this.elapsed * 0.001 * (12 / i)) + i * 28) % 90;
      const ringRadius = radius + ringOffset;
      const ringAlpha = Math.max(0, 0.45 * (1 - ringOffset / 90));

      ctx.beginPath();
      ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(245, 78, 0, ${ringAlpha})`;
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }

    // 3. Central Harmonic Breathing Orb Core
    const orbGradient = ctx.createRadialGradient(
      centerX - radius * 0.2,
      centerY - radius * 0.2,
      radius * 0.05,
      centerX,
      centerY,
      radius
    );
    orbGradient.addColorStop(0, '#f56a28');
    orbGradient.addColorStop(0.65, '#f54e00');
    orbGradient.addColorStop(1, 'rgba(208, 66, 0, 0.85)');

    ctx.fillStyle = orbGradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();

    // Subtle edge luminescence ring
    ctx.strokeStyle = `rgba(255, 255, 255, ${0.25 + 0.2 * breathProgress})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }

  public destroy(): void {}
}
