import {Draw} from './Draw';
import {AudioSystem} from './AudioSystem';
import {AnimationsSystem} from './AnimationsSystem';

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

	/** Инициализация игры */
	static init(canvas: HTMLCanvasElement, isLoadResources: boolean = true): void{
		Game.isWasInit = true;
		Game.isPaused = true;
		Game.isBlockMouseLogic = false;
		Game.lastDrawTime = 0;

		Cursor.init();
		Cursor.setCursor(Cursor.default);

		Draw.init(canvas);
		Mouse.init();
		Gamer.init();
		Labels.init();

		if(isLoadResources){
			Menu.loadSelectSound();
			
			this._primaryImages = [];
            //TODO: механизм загрузки карты
		}

		document.removeEventListener('keydown', Game.onKey);
		document.addEventListener('keydown', Game.onKey);

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
        Game.mouseLogic(drawsDiffMs); //логика обработки мыши
		
		Labels.logic(drawsDiffMs);

		AnimationsSystem.logic();

        Cursor.logic(drawsDiffMs);

        Resources.logic(drawsDiffMs);

		//FPS.counting();

		Game.drawAll(millisecondsFromStart, drawsDiffMs);

        window.requestAnimationFrame(Game.go.bind(this));
	}

	private static mouseLogic(drawsDiffMs: number) : void {
		if(Game.isBlockMouseLogic || !Mouse.x || !Mouse.y){
			return;
		}

		//при изменении размера canvas, мы должны масштабировать координаты мыши
		const x = Mouse.canvasX;
		const y = Mouse.canvasY;
		let alpha = Draw.ctx.getImageData(x, y, 1, 1).data[3]; //pixel alpha
		let isHoverFound = alpha > 200; //если какой-либо объект находится под курсором (минимум 179 - затемнение фона)

        let isCursorChanged = false;

		if(!isCursorChanged){
			isCursorChanged = Resources.mouseLogic(x, y, Mouse.isClick, isHoverFound);
		}

		if(!isCursorChanged){
			Cursor.setCursor(Cursor.default);
		}

		Mouse.isClick = false;
	}

	private static onKey(event: KeyboardEvent) : void{
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

	private static drawAll(millisecondsFromStart: number, drawsDiffMs: number) : void{
		Draw.clear(); //очищаем холст
        
		Resources.draw(drawsDiffMs);
	
		AnimationsSystem.draw(drawsDiffMs);
	
		Labels.draw();

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

        Menu.hide();
		Game.isPaused = false;
		Game.lastDrawTime = 0;
		if(!this._animationId)
		this._animationId = window.requestAnimationFrame(Game.go.bind(this));
		Mouse.isClick = false;
		Game.isBlockMouseLogic = false;
	}
}