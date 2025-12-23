import {Helper} from '../../gameApp/helpers/Helper';

import AnimationInfinite from '../animations/AnimationInfinite';
import Animation from '../animations/Animation';
import AnimationRandom from '../animations/AnimationRandom';

import {Modifier} from '../../modifiers/Modifier';

import {Labels} from '../../gameApp/labels/Labels';

import {Draw} from '../../gameApp/gameSystems/Draw';

import {ImageHandler} from '../../gameApp/ImageHandler';



/** атакуемый объект (Монстр, Строение, Юнит, Ресурс) */
export class AttackedObject {
	readonly imageHandler: ImageHandler; //управление lazy загрузкой картинок и их готовности к отображению
	readonly id: string;
	
	name: string;

	image: HTMLImageElement; //статичная картинка или фреймы анимации
    animation: AnimationInfinite|null = null;

	angle: number = 0; //угол поворота при отрисовке в градусах

	healthMax: number; //максимум хп
	defense: number = 0; //защита (уменьшает урон)

	protected _canvas: any = {}; //{image.src|frame => OffscreenCanvas} содержит отрисованное изображение для второстепенных использований
		// Минотавр атакует строения и создаются ощмётки из частей изображения
		// для проверки наведения мыши на конкретного монстра в толпе
	public currentCanvas: OffscreenCanvas|null = null; //текущий canvas
	
	get health(): number{
		return this._health;
	}
	set health(value: number){
		if(value < this._health){ //урон
			this.applyDamage(this._health - value);
		}
		else{ //восстановление/лечение
			this._health = value;
		}
	}
	protected _health: number;

	scaleSize: number; //1 - размер объекта по размеру картинки, 0.5 - объект в 2 раза меньше картинки по высоте и ширине, 2 - объект в 2 раза больше.

	x: number;
	y: number;

	modifiers: Modifier[]; //бафы/дебафы

	constructor(x: number, y: number, healthMax: number, scaleSize: number, name: string, 
        image: HTMLImageElement,
		imageHandler: ImageHandler,
		frames: number, 
		animationDurationMs: number)
	{
		this.id = Helper.generateUid();

		this.animation = frames > 1 
			? new AnimationInfinite(frames, animationDurationMs, image) 
			: null;
		this.image = image;

		this.healthMax = this._health = healthMax; //максимум хп

		this.scaleSize = scaleSize;

		this.x = x;
		this.y = y;

		this.name = name;

		this.imageHandler = imageHandler;

        this.modifiers = [];
	}

	get height(): number {
		if(this.animation){
			return this.width / ((this.animation.image.width || 1) / this.animation.frames) * (this.animation.image.height || 1);
		}

		return this.image.height * this.scaleSize;
	}
	get width(): number {
		if(this.animation){
			return this.animation.image.width / this.animation.frames * this.scaleSize;
		}

		return this.image.width * this.scaleSize;
	}

	get shiftXForCenter(){
		return 0;
	}
	get shiftYForCenter(){
		return 0;
	}

	get centerX(): number {
		return this.x + this.width / 2 + this.shiftXForCenter;
	}
	get centerY(): number {
		return this.y + this.height / 2 + this.shiftYForCenter;
	}
	
	logicBase(drawsDiffMs: number): void{
		if(!this.imageHandler.isImagesCompleted){
			return;
		}

		this.modifiers.forEach(modifier => modifier.logic(this, drawsDiffMs));
	}

	applyDamage(damage: number, x: number|null = null, y: number|null = null, attackingObject: AttackedObject|null = null, isCreateLabel: boolean = true): number{
		if(damage <= 0){
			console.error('negative damage', damage);
			return 0;
		}

		let defense = Math.max(0, this.defense + this.defense * this.modifiers.reduce((sum, el) => sum + el.defenceMultiplier, 0));
		let damageMultiplier = Helper.sum(this.modifiers, (modifier: Modifier) => modifier.damageInMultiplier);

		const realDamage = Math.max(0, damage + damage * damageMultiplier - defense);
		if(realDamage <= 0){
			return 0;
		}
		
		this._health -= realDamage;
        if (isCreateLabel)
		    Labels.createDamageLabel(x || this.centerX, y || this.centerY, '-' + realDamage.toFixed(1), 3000);
		return realDamage;
	}

	destroy(): void{
		this.modifiers.forEach(modifier => modifier.destroy());
	}

	containsPoint(x: number, y: number): boolean {
		if(!this.currentCanvas){
			return false;
		}

		var context = this.currentCanvas.getContext('2d');
		if(!context){
			return false;
		}

		const canvasWidth = this.currentCanvas.width;
		const canvasHeight = this.currentCanvas.height;

		const shiftedX = Math.floor(x - this.width / 2 + canvasWidth / 2);
		const shiftedY = Math.floor(y - this.height / 2 + canvasHeight / 2);

		if(shiftedX < 0 || shiftedY < 0 || shiftedX >= canvasWidth || shiftedY >= canvasHeight){
			return false;
		}

		let alpha = context.getImageData(shiftedX, shiftedY, 1, 1).data[3]; //pixel alpha
		let isHoverFound = alpha > 200;

		return isHoverFound;

	}

	addModifier(newModifier: Modifier): void{
		const existedModifier = this.modifiers.find(modifier => modifier.name == newModifier.name);
		if(existedModifier){
            existedModifier.damageOutMultiplier += newModifier.damageOutMultiplier;
            existedModifier.damageInMultiplier += newModifier.damageInMultiplier;
            existedModifier.healthMultiplier += newModifier.healthMultiplier;
            existedModifier.speedMultiplier += newModifier.speedMultiplier;
		}
		else{
			this.modifiers.push(newModifier);
		}
	}

	get isInvertDraw(): boolean{
		return  false;
	}

	setCanvas(imageOrAnimation: HTMLImageElement|Animation|AnimationInfinite|AnimationRandom, frame: number = 0): void{
		var src = imageOrAnimation instanceof HTMLImageElement 
			? imageOrAnimation.src 
			: imageOrAnimation.image.src;
		var key = src + '|' + frame + '|' + this.angle + '|' + (this.isInvertDraw ? '1' : '0') + '|' + this.scaleSize;
		if(key in this._canvas){
			this.currentCanvas = this._canvas[key];
		}
		else{
            var width = imageOrAnimation.width * this.scaleSize;
            var height = imageOrAnimation.height * this.scaleSize;

			const angleRad = Math.abs(this.angle * Math.PI / 180);
			const canvasWidth = Math.max(1, Math.ceil(Math.abs(width * Math.cos(angleRad)) + Math.abs(height * Math.sin(angleRad))));
			const canvasHeight = Math.max(1, Math.ceil(Math.abs(width * Math.sin(angleRad)) + Math.abs(height * Math.cos(angleRad))));

			var newCanvas = new OffscreenCanvas(canvasWidth, canvasHeight);
			var context = newCanvas.getContext('2d');
			if (context) {
				let invertSign = this.isInvertDraw ? -1 : 1;
        
				context.setTransform(1, 0, 0, 1, canvasWidth / 2, canvasHeight / 2); 
                context.rotate(this.angle * Math.PI / 180);

				if(imageOrAnimation instanceof HTMLImageElement){
					context.drawImage(imageOrAnimation, invertSign * (- width / 2), - height / 2, invertSign * width, height);
                }
				else {
					imageOrAnimation.drawBase(context, null, invertSign * (- width / 2), - height / 2, invertSign * width, height);
				}

                context.setTransform(1, 0, 0, 1, 0, 0);
                context.rotate(0);
				this.currentCanvas = this._canvas[key] = newCanvas;
			}
			else{
				console.error('AttackedObject. setCanvas. 2d context of OffscreenCanvas is null!');
			}
		}
	}

	drawBase(drawsDiffMs: number, x: number|null = null, y: number|null = null, filter: string|null = null){
		if(!this.imageHandler.isImagesCompleted){
			return;
		}

		x = x ?? this.x;
		y = y ?? this.y;
		let isInvert = this.isInvertDraw;
		let invertSign = isInvert ? -1 : 1;

		if(isInvert){
			Draw.ctx.save();
			Draw.ctx.scale(-1, 1);
		}

		this.drawObject(drawsDiffMs, this.animation ?? this.image, invertSign, x, y, filter);

		if(isInvert){
			Draw.ctx.restore();
		}

	}

	drawObject(drawsDiffMs: number, imageOrAnimation: AnimationInfinite|Animation|HTMLImageElement|OffscreenCanvas, 
		invertSign: number = 1, x: number|null = null, y: number|null = null, filter: string|null = null,
		isInvertAnimation: boolean = false)
	{
		if(!this.imageHandler.isImagesCompleted){
			return;
		}

		const centerX = (x ?? this.x) + this.width / 2;
		const centerY = (y ?? this.y) + this.height / 2;

		// If we were given a pre-rendered offscreen (already rotated and expanded),
		// draw it centered with its true dimensions (do not squash into this.width/height).
		if(imageOrAnimation instanceof OffscreenCanvas){
			Draw.ctx.setTransform(1, 0, 0, 1, centerX, centerY);
			Draw.ctx.drawImage(
				imageOrAnimation,
				-imageOrAnimation.width / 2,
				-imageOrAnimation.height / 2,
				imageOrAnimation.width,
				imageOrAnimation.height
			);
			Draw.ctx.setTransform(1, 0, 0, 1, 0, 0);
			this.currentCanvas = imageOrAnimation;
			return;
		}

		Draw.ctx.setTransform(1, 0, 0, 1, centerX, centerY);
		Draw.ctx.rotate(this.angle * Math.PI / 180);

		const drawX = -this.width / 2;
		const drawY = -this.height / 2;

		if(imageOrAnimation instanceof HTMLImageElement){
			let image = Draw.getFilteredImage(filter, imageOrAnimation, this.width, this.height);
			Draw.ctx.drawImage(image, invertSign * drawX, drawY, invertSign * this.width, this.height);
			this.setCanvas(imageOrAnimation);
		}
		else{
			var frame = imageOrAnimation.draw(drawsDiffMs, invertSign * drawX, drawY, invertSign * this.width, this.height, filter, isInvertAnimation);
			this.setCanvas(imageOrAnimation, frame);
		}

		Draw.ctx.setTransform(1, 0, 0, 1, 0, 0);
		Draw.ctx.rotate(0);
	}

	drawHealthBase(x: number|null = null, y: number|null = null, width: number|null = null, 
        mainColor: string = "red", 
        borderColor: string = "orange",
        otherColor: string = "black"): void{
		x = x ?? this.x;
		y = y ?? this.y;
		width = width ?? this.width;

		if(this.health < this.healthMax && this.health > 0){
			Draw.drawHealth(x, y, width,  this.healthMax, this.health, mainColor, borderColor, otherColor);
		}
	}
}