import {Draw} from "../gameSystems/Draw";

import {Helper} from "../helpers/Helper";


/** Поднимающийся текст - мини надписи, типо "+1" при сборе монеток или урон по монстру */
export class Label{
	readonly id: string;
	readonly lifeTimeMs: number;

	//поля свойства экземпляра
	x: number;
	y: number;
	text: string;
	image: HTMLImageElement|null;

	red: number;
	green: number;
	blue: number;
	
	isDecreaseOpacity: boolean;

	isDisplayBackground: boolean;
	backgroundRed: number;
	backgroundGreen: number;
	backgroundBlue: number;

	leftTimeMs: number;

	constructor(
		x: number, y: number, 
		text: string, 
		red: number, green: number, blue: number, 
		lifeTimeMs: number,
		isDecreaseOpacity: boolean = true,
		isDisplayBackground: boolean = false,
		backgroundRed: number = 0, backgroundGreen: number = 0, backgroundBlue: number = 0,
		image: HTMLImageElement|null = null)
	{
		this.id = Helper.generateUid();
		this.x = x;
		this.y = y;
		this.text = text;
		this.image = image;

		this.isDecreaseOpacity = isDecreaseOpacity;

		this.isDisplayBackground = isDisplayBackground;
		this.red = red;
		this.green = green;
		this.blue = blue;
		
		this.backgroundRed = backgroundRed;
		this.backgroundGreen = backgroundGreen;
		this.backgroundBlue = backgroundBlue;

		this.leftTimeMs = lifeTimeMs;
		this.lifeTimeMs = lifeTimeMs;
	}

	logic(drawsDiffMs: number){
		this.leftTimeMs -= drawsDiffMs;
	}

	draw(){
		let opacity = this.isDecreaseOpacity && this.leftTimeMs < this.lifeTimeMs / 2
			? Math.abs(this.leftTimeMs / (this.lifeTimeMs / 2))
			: 1;

		if(this.isDisplayBackground){
			Draw.ctx.fillStyle = `rgba(${this.backgroundRed},${this.backgroundGreen},${this.backgroundBlue},${opacity})`;
			Draw.ctx.font = "18px Calibri";
			Draw.ctx.fillText(this.text, this.x -4, this.y - 1);
		}

		Draw.ctx.fillStyle = `rgba(${this.red},${this.green},${this.blue},${opacity})`;
		Draw.ctx.font = "14px Calibri";
		Draw.ctx.fillText(this.text, this.x, this.y);

		if(this.image && this.image.complete){
		    const textWidth = Draw.ctx.measureText(this.text).width;
			const iconHeight = 14;
			const iconWidth = Math.max(1, this.image.width * (iconHeight / Math.max(1, this.image.height)));
			const iconX = this.x + textWidth + 4;
			const iconY = this.y - iconHeight + 2;
			const prevAlpha = Draw.ctx.globalAlpha;
			Draw.ctx.globalAlpha = opacity;
			Draw.ctx.drawImage(this.image, iconX, iconY, iconWidth, iconHeight);
			Draw.ctx.globalAlpha = prevAlpha;
		}
	}
}