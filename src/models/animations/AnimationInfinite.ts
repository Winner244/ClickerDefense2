import {Draw} from "../../gameApp/gameSystems/Draw";
import AnimationBase from "./AnimationBase";

export default class AnimationInfinite extends AnimationBase{
	displayedTimeMs: number; //сколько по времени уже отображается (миллисекунды)

	constructor(framesCount: number, durationMs: number, image: HTMLImageElement|string|null = null)
	{
		super(framesCount, durationMs, image);
		this.displayedTimeMs = 0;
	}

	changeDuration(newValue: number): void{
		this._durationMs = newValue;
	}

	restart(): void{
		this.displayedTimeMs = 0;
	}

	draw(drawsDiffMs: number, x: number, y: number, width: number|null = null, height: number|null = null, filter: string|null = null): number{
		this.displayedTimeMs += drawsDiffMs;

		if(!this.image.complete){
			console.warn(`image src=${this.image.src} is not loaded yet!`);
			return -1;
		}

		if(!this._durationMs || !this.image.width || !this.frames){
			return -1;
		}

		this.currentFrame = this.getCurrentFrame();
		this.drawBase(Draw.ctx, filter, x, y, width, height);

		return this.currentFrame;
	}

	getCurrentFrame(): number{
		let frame = Math.floor(this.displayedTimeMs % this.durationMs / (this.durationMs / this.frames));
		return frame;
	}
}