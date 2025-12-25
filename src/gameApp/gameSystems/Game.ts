import {Draw} from './Draw';
import {AudioSystem} from './AudioSystem';
import {AnimationsSystem} from './AnimationsSystem';
import {Camera} from './Camera';

import {Labels} from '../labels/Labels';

import {Mouse} from '../gamer/Mouse';
import {Keypad} from '../gamer/Keypad';
import {Cursor} from '../gamer/Cursor';
import {Gamer} from '../gamer/Gamer';

import {Resources} from '../resources/Resources';

import {Menu} from '../../reactApp/components/Menu/Menu';



/** Система управления игрой - единичный статичный экземпляр */
export class Game {

	static isPaused: boolean = false;
	static isWasInit: boolean = false; //инициализация уже была?

	static lastDrawTime: number = 0; //время последней отрисовки (нужно для высчита drawsDiffMs)

	static isBlockMouseLogic: boolean = false; //if user's mouse enter to interface buttons (menu/shop/nextWave)

	private static _primaryImages: HTMLImageElement[] = [];  // изображения (кроме курсоров) загрузку которых нужно дождаться перед началом игры
	private static _animationId: number = 0; //техническая переменная для браузера
	private static _keysDown: Set<string> = new Set<string>();
	private static _lastPanMouseX: number | null = null;
	private static _lastPanMouseY: number | null = null;

	/** Инициализация игры */
	static init(canvas: HTMLCanvasElement, isLoadResources: boolean = true): void{
		Game.isWasInit = true;
		Game.isPaused = true;
		Game.isBlockMouseLogic = false;
		Game.lastDrawTime = 0;

		Cursor.init();
		Cursor.setCursor(Cursor.default);

		Draw.init(canvas);
		Camera.reset();
		Game._keysDown.clear();
		Game._lastPanMouseX = null;
		Game._lastPanMouseY = null;
		Mouse.init();
		Gamer.init();
		Labels.init();

		if(isLoadResources){
			Menu.loadSelectSound();
			
			this._primaryImages = [];
            //TODO: механизм загрузки карты
		}

		document.removeEventListener('keydown', Game.onKeyDown);
		document.removeEventListener('keyup', Game.onKeyUp);
		document.addEventListener('keydown', Game.onKeyDown);
		document.addEventListener('keyup', Game.onKeyUp);

		if(this._animationId === 0 && this._primaryImages.length){
			this._animationId = window.requestAnimationFrame(Game.go.bind(this));
		}
	}

	/** основной цикл игры */
	private static go(millisecondsFromStart: number) : void{
		if(Game.isPaused){
			this._animationId = 0;
			return;
		}

		//проверка что все изображения загружены - иначе будет краш хрома
		if(this._primaryImages.some(x => !x.complete)){
			this._animationId = window.requestAnimationFrame(Game.go.bind(this));
			return;
		}

		if(!Game.lastDrawTime){
			Game.lastDrawTime = millisecondsFromStart - 10;
		}

		let drawsDiffMs = millisecondsFromStart - Game.lastDrawTime; //сколько времени прошло с прошлой прорисовки
		if(drawsDiffMs > 100) { //защита от долгого отсутствия
			drawsDiffMs = 100;
		}

		///** logics **//
		Game.cameraLogic(drawsDiffMs);
		Game.mouseLogic(drawsDiffMs); //логика обработки мыши
		
		Labels.logic(drawsDiffMs);

		AnimationsSystem.logic();

        Cursor.logic(drawsDiffMs);

        Resources.logic(drawsDiffMs);

		//FPS.counting();

		Game.drawAll(millisecondsFromStart, drawsDiffMs);

        window.requestAnimationFrame(Game.go.bind(this));
	}

	private static cameraLogic(drawsDiffMs: number): void {
		if (Game.isPaused) {
			return;
		}

		const dt = drawsDiffMs / 1000;
		const speedPxPerSec = 700;
		const step = speedPxPerSec * dt;

		if (Game._keysDown.has('ArrowLeft') || Game._keysDown.has('a')) {
			Camera.move(-step, 0);
		}
		if (Game._keysDown.has('ArrowRight') || Game._keysDown.has('d')) {
			Camera.move(step, 0);
		}
		if (Game._keysDown.has('ArrowUp') || Game._keysDown.has('w')) {
			Camera.move(0, -step);
		}
		if (Game._keysDown.has('ArrowDown') || Game._keysDown.has('s')) {
			Camera.move(0, step);
		}

		// Right-mouse drag pans the world (grab + move)
		const mx = Mouse.canvasX;
		const my = Mouse.canvasY;
		const isInCanvas = mx >= 0 && my >= 0 && mx <= Draw.canvas.width && my <= Draw.canvas.height;

		if (!Game.isBlockMouseLogic && Mouse.isRightDown && isInCanvas) {
			if (Game._lastPanMouseX !== null && Game._lastPanMouseY !== null) {
				const dx = mx - Game._lastPanMouseX;
				const dy = my - Game._lastPanMouseY;
				Camera.move(-dx, -dy);
			}
			Game._lastPanMouseX = mx;
			Game._lastPanMouseY = my;
		}
		else {
			Game._lastPanMouseX = null;
			Game._lastPanMouseY = null;
		}
	}

	private static mouseLogic(drawsDiffMs: number) : void {
		if(Game.isBlockMouseLogic || !Mouse.x || !Mouse.y){
			return;
		}

		//при изменении размера canvas, мы должны масштабировать координаты мыши
		const screenX = Mouse.canvasX;
		const screenY = Mouse.canvasY;
		const worldX = Camera.screenToWorldX(screenX);
		const worldY = Camera.screenToWorldY(screenY);
		let alpha = Draw.ctx.getImageData(screenX, screenY, 1, 1).data[3]; //pixel alpha
		let isHoverFound = alpha > 200; //если какой-либо объект находится под курсором (минимум 179 - затемнение фона)

        let isCursorChanged = false;

		if(!isCursorChanged){
			isCursorChanged = Resources.mouseLogic(worldX, worldY, Mouse.isClick, isHoverFound);
		}

		if(!isCursorChanged){
			Cursor.setCursor(Cursor.default);
		}

		Mouse.isClick = false;
	}

	private static normalizeKey(key: string): string {
		return key.length === 1 ? key.toLowerCase() : key;
	}

	private static onKeyDown(event: KeyboardEvent) : void{
		Game._keysDown.add(Game.normalizeKey(event.key));
		Keypad.isEnter = true;
		switch(event.key){
			case 'Escape':
				if(!Game.isPaused){
					Game.pause();
				}
				else{
					Game.continue();
					Menu.hide();
				}
			break;
		}
		Keypad.isEnter = false;
	}

	private static onKeyUp(event: KeyboardEvent) : void{
		Game._keysDown.delete(Game.normalizeKey(event.key));
	}

	private static drawAll(millisecondsFromStart: number, drawsDiffMs: number) : void{
		Draw.clear(); //очищаем холст

		Camera.beginWorld();
		Resources.draw(drawsDiffMs);
		AnimationsSystem.draw(drawsDiffMs);
		Labels.draw();
		Camera.endWorld();

        Cursor.draw(drawsDiffMs);
	
		if (Game.isPaused){
			Draw.drawBlackout(); //затемняем фон
		}

		Game.lastDrawTime = millisecondsFromStart;
	}

	
	/** Поставить игру на паузу */
	static pause() : void{
		if(!Game.isWasInit || Game.isPaused){
			return;
		}

		Cursor.setCursor(Cursor.default);
		Game.isBlockMouseLogic = true;
		cancelAnimationFrame(this._animationId);
		this._animationId = 0;
		Game.isPaused = true;
		Menu.show();
		Game.drawAll(0, 0);
		AudioSystem.pauseSounds();
	}

	/** Продолжить игру */
	static continue() : void{
		if(!Game.isWasInit){
			return;
		}

		if(Game.isPaused){
			AudioSystem.resumeSounds();
		}

		Game.isPaused = false;
		Game.lastDrawTime = 0;
		if(!this._animationId)
		this._animationId = window.requestAnimationFrame(Game.go.bind(this));
		Mouse.isClick = false;
		Game.isBlockMouseLogic = false;
	}
}