import { Draw } from './Draw';

/** Simple camera/viewport for panning the world on the canvas. */
export class Camera {
  static x: number = 0;
  static y: number = 0;
  static zoom: number = 1;

  private static _clampZoom(value: number): number {
    if (!Number.isFinite(value)) {
      return 1;
    }
    return Math.max(0.3, Math.min(3, value));
  }

  static reset(): void {
    Camera.x = 0;
    Camera.y = 0;
    Camera.zoom = 1;
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
    const z = Camera._clampZoom(Camera.zoom);
    // World -> Screen: (world - (x,y)) * zoom
    Draw.ctx.setTransform(z, 0, 0, z, -Camera.x * z, -Camera.y * z);
  }

  static endWorld(): void {
    Draw.ctx.restore();
  }

  static screenToWorldX(screenX: number): number {
    const z = Camera._clampZoom(Camera.zoom);
    return screenX / z + Camera.x;
  }

  static screenToWorldY(screenY: number): number {
    const z = Camera._clampZoom(Camera.zoom);
    return screenY / z + Camera.y;
  }

  static setZoomAtScreenPoint(screenX: number, screenY: number, nextZoom: number): void {
    const prevZoom = Camera._clampZoom(Camera.zoom);
    const targetZoom = Camera._clampZoom(nextZoom);

    if (!Number.isFinite(screenX) || !Number.isFinite(screenY)) {
      Camera.zoom = targetZoom;
      return;
    }

    // Keep the world point under the cursor stable while zooming.
    const worldX = screenX / prevZoom + Camera.x;
    const worldY = screenY / prevZoom + Camera.y;

    Camera.zoom = targetZoom;
    Camera.x = worldX - screenX / targetZoom;
    Camera.y = worldY - screenY / targetZoom;
  }
}
