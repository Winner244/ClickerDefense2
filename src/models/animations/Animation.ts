import {Draw} from "../../gameApp/gameSystems/Draw";
import AnimationBase from "./AnimationBase";

export default class Animation extends AnimationBase {
	leftTimeMs: number; //оставшееся время анимации (миллисекунды)

	private canvas: CanvasRenderingContext2D; //канвас для рисования (используется в Panels для рисования на отдельных панелях ниже основного холста)

	/**
	 * @param framesCount - количество фреймов в изображении image
	 * @param durationMs - время полной анимации в миллисекундах
	 * @param image - изображение содержащее все кадры анимации
	 */
	constructor(framesCount: number, durationMs: number, image: HTMLImageElement|string|null = null, canvas: CanvasRenderingContext2D|null = null)
	{
		super(framesCount, durationMs, image);
		this.leftTimeMs = durationMs;
		this.canvas = canvas || Draw.ctx;
	}

	restart(){
		this.leftTimeMs = this.durationMs;
	}

	draw(drawsDiffMs: number, x: number, y: number, width: number, height: number, filter: string|null = null, isInvert: boolean = false): number{
		if(this.leftTimeMs > 0){
			this.leftTimeMs -= drawsDiffMs;
		}
		
		if(!this.image.complete){
			console.warn(`image src=${this.image.src} is not loaded yet!`);
			return -1;
		}

		if(!this._durationMs || !this.image.width || !this.frames){
			return -1;
		}

		this.currentFrame = this.getCurrentFrame(isInvert);
		this.drawBase(this.canvas || Draw.ctx, filter, x, y, width, height);

		return this.currentFrame;
	}

	getCurrentFrame(isInvert: boolean): number{
		let frame = this.leftTimeMs <= 0 
			? this.frames - 1
			: Math.floor((this.durationMs - this.leftTimeMs) / (this.durationMs / this.frames));

		if(isInvert){
			frame = this.leftTimeMs <= 0 
				? 0
				: this.frames - Math.floor((this.durationMs - this.leftTimeMs) / (this.durationMs / this.frames)) - 1;
		}

		return frame;
	}
}