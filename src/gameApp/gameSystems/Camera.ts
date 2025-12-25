import { Draw } from './Draw';

/** Simple camera/viewport for panning the world on the canvas. */
export class Camera {
  static x: number = 0;
  static y: number = 0;

  static reset(): void {
    Camera.x = 0;
    Camera.y = 0;
  }

  static move(dx: number, dy: number): void {
    if (Number.isFinite(dx)) {
      Camera.x += dx;
    }
    if (Number.isFinite(dy)) {
      Camera.y += dy;
    }
  }

  static beginWorld(): void {
    Draw.ctx.save();
    Draw.ctx.translate(-Camera.x, -Camera.y);
  }

  static endWorld(): void {
    Draw.ctx.restore();
  }

  static screenToWorldX(screenX: number): number {
    return screenX + Camera.x;
  }

  static screenToWorldY(screenY: number): number {
    return screenY + Camera.y;
  }
}
