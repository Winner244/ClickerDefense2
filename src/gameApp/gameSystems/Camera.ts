import { Draw } from './Draw';
import { Mouse } from '../gamer/Mouse';

/** Simple camera/viewport for panning the world on the canvas. */
export class Camera {
  static x: number = 0;
  static y: number = 0;
  static zoom: number = 1;

  private static _keysDown: Set<string> = new Set<string>();
  private static _lastPanMouseX: number | null = null;
  private static _lastPanMouseY: number | null = null;
  private static _isPaused: boolean = true;
  private static _isBlockMouseLogic: boolean = false;
  private static _boundOnKeyDown: (e: KeyboardEvent) => void;
  private static _boundOnKeyUp: (e: KeyboardEvent) => void;
  private static _boundOnWheel: (e: WheelEvent) => void;
  private static _boundCanvas: HTMLCanvasElement | null = null;

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
  Camera._keysDown.clear();
  Camera._lastPanMouseX = null;
  Camera._lastPanMouseY = null;
  }

  static init(canvas: HTMLCanvasElement): void {
    // Lazily create stable bound handlers.
    if (!Camera._boundOnKeyDown) {
      Camera._boundOnKeyDown = (e: KeyboardEvent) => Camera.onKeyDown(e);
      Camera._boundOnKeyUp = (e: KeyboardEvent) => Camera.onKeyUp(e);
      Camera._boundOnWheel = (e: WheelEvent) => Camera.onWheel(e);
    }

    // Rebind wheel to the current canvas.
    if (Camera._boundCanvas) {
      Camera._boundCanvas.removeEventListener('wheel', Camera._boundOnWheel as any);
    }
    Camera._boundCanvas = canvas;
    Camera._boundCanvas.addEventListener('wheel', Camera._boundOnWheel as any, { passive: false });

    // Ensure key handlers are registered exactly once.
    document.removeEventListener('keydown', Camera._boundOnKeyDown);
    document.removeEventListener('keyup', Camera._boundOnKeyUp);
    document.addEventListener('keydown', Camera._boundOnKeyDown);
    document.addEventListener('keyup', Camera._boundOnKeyUp);
  }

  static setInputState(isPaused: boolean, isBlockMouseLogic: boolean): void {
    Camera._isPaused = isPaused;
    Camera._isBlockMouseLogic = isBlockMouseLogic;
    if (Camera._isPaused) {
      Camera._keysDown.clear();
      Camera._lastPanMouseX = null;
      Camera._lastPanMouseY = null;
    }
  }

  static update(drawsDiffMs: number, isPaused: boolean, isBlockMouseLogic: boolean): void {
    Camera.setInputState(isPaused, isBlockMouseLogic);

    if (Camera._isPaused) {
      return;
    }

    const dt = drawsDiffMs / 1000;
    const speedPxPerSec = 700;
    const step = speedPxPerSec * dt;
    const worldStep = step / Math.max(0.01, Camera.zoom);

    if (Camera._keysDown.has('ArrowLeft') || Camera._keysDown.has('a')) {
      Camera.move(-worldStep, 0);
    }
    if (Camera._keysDown.has('ArrowRight') || Camera._keysDown.has('d')) {
      Camera.move(worldStep, 0);
    }
    if (Camera._keysDown.has('ArrowUp') || Camera._keysDown.has('w')) {
      Camera.move(0, -worldStep);
    }
    if (Camera._keysDown.has('ArrowDown') || Camera._keysDown.has('s')) {
      Camera.move(0, worldStep);
    }

    // Right-mouse drag pans the world (grab + move)
    const mx = Mouse.canvasX;
    const my = Mouse.canvasY;
    const isInCanvas = mx >= 0 && my >= 0 && mx <= Draw.canvas.width && my <= Draw.canvas.height;

    if (!Camera._isBlockMouseLogic && Mouse.isRightDown && isInCanvas) {
      if (Camera._lastPanMouseX !== null && Camera._lastPanMouseY !== null) {
        const dx = mx - Camera._lastPanMouseX;
        const dy = my - Camera._lastPanMouseY;
        Camera.move(-dx / Math.max(0.01, Camera.zoom), -dy / Math.max(0.01, Camera.zoom));
      }
      Camera._lastPanMouseX = mx;
      Camera._lastPanMouseY = my;
    }
    else {
      Camera._lastPanMouseX = null;
      Camera._lastPanMouseY = null;
    }
  }

  private static normalizeKey(key: string): string {
    return key.length === 1 ? key.toLowerCase() : key;
  }

  private static onKeyDown(event: KeyboardEvent): void {
    Camera._keysDown.add(Camera.normalizeKey(event.key));
  }

  private static onKeyUp(event: KeyboardEvent): void {
    Camera._keysDown.delete(Camera.normalizeKey(event.key));
  }

  private static onWheel(event: WheelEvent): void {
    if (Camera._isPaused || Camera._isBlockMouseLogic) {
      return;
    }

    const mx = Mouse.canvasX;
    const my = Mouse.canvasY;
    const isInCanvas = mx >= 0 && my >= 0 && mx <= Draw.canvas.width && my <= Draw.canvas.height;
    if (!isInCanvas) {
      return;
    }

    event.preventDefault();
    const direction = event.deltaY > 0 ? -1 : 1;
    const factor = direction > 0 ? 1.1 : 1 / 1.1;
    Camera.setZoomAtScreenPoint(mx, my, Camera.zoom * factor);
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
