import type { IScene } from '../SceneManager';

export class BreathingOrbScene implements IScene {
  public id = 'breathing-orb';
  public name = 'Breathing Orb';

  private width: number = 0;
  private height: number = 0;
  private elapsed: number = 0;

  // 4-7-8 Breathing Technique: 4s inhale, 7s hold, 8s exhale (Total: 19s)
  private readonly cycleDuration = 19000;

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
    const baseRadius = Math.min(this.width, this.height) * 0.16;

    let progress = 0;
    let phaseText = 'Inhale';

    if (this.elapsed < 4000) {
      // Inhale: 0s to 4s (Grow)
      progress = this.elapsed / 4000;
      phaseText = 'Inhale (4s)';
    } else if (this.elapsed < 11000) {
      // Hold: 4s to 11s (Steady high)
      progress = 1.0;
      phaseText = 'Hold (7s)';
    } else {
      // Exhale: 11s to 19s (Shrink)
      progress = 1.0 - (this.elapsed - 11000) / 8000;
      phaseText = 'Exhale (8s)';
    }

    // Smooth easing
    const easedProgress = Math.sin((progress * Math.PI) / 2);
    const radius = baseRadius * (0.85 + 0.35 * easedProgress);

    // Draw ambient background glow ring
    ctx.save();
    const glowGradient = ctx.createRadialGradient(centerX, centerY, radius * 0.5, centerX, centerY, radius * 2.2);
    glowGradient.addColorStop(0, 'rgba(245, 78, 0, 0.22)');
    glowGradient.addColorStop(0.5, 'rgba(245, 78, 0, 0.08)');
    glowGradient.addColorStop(1, 'rgba(245, 78, 0, 0)');

    ctx.fillStyle = glowGradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 2.2, 0, Math.PI * 2);
    ctx.fill();

    // Draw main Breathing Orb
    const orbGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
    orbGradient.addColorStop(0, '#f54e00');
    orbGradient.addColorStop(0.7, '#d04200');
    orbGradient.addColorStop(1, 'rgba(208, 66, 0, 0.65)');

    ctx.fillStyle = orbGradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();

    // Subtle breathing pulse ripple
    ctx.strokeStyle = 'rgba(245, 78, 0, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 12 + Math.sin(this.elapsed * 0.003) * 6, 0, Math.PI * 2);
    ctx.stroke();

    // Phase label
    ctx.font = '500 14px "JetBrains Mono", monospace';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(phaseText, centerX, centerY);

    ctx.restore();
  }

  public destroy(): void {}
}
