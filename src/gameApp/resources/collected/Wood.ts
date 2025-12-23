import {ResourceCollected} from "./ResourceCollected";

import {Gamer} from "../../gamer/Gamer";

import {ImageHandler} from "../../ImageHandler";

import {Cursor} from "../../gamer/Cursor";

import {Helper} from "../../helpers/Helper";

import {Resources} from "../Resources";

import Wood1Image from '../../../assets/img/resources/wood/wood1.png';  

/// Ресурс - деревяшка - падает при рубке деревьев
export class Wood extends ResourceCollected{
	static readonly imageHandler: ImageHandler = new ImageHandler();

	static readonly IMPULSE_X_MAX: number = 500;
	static readonly IMPULSE_ROTATING_MAX: number = 360;
	static readonly IMPULSE_X_DECREASE_PER_MS: number = 1;
	static readonly IMPULSE_ROTATING_DECREASE_PER_MS: number = 1;

	impulseX: number;
	impulseAngle: number;

	private static readonly images: HTMLImageElement[] = []; //разные деревяшки

	constructor(x: number, y: number, bottomY: number, variant: number = 0){
		super(x, y, bottomY, 
			1, //health max
			0.5, //scale size
            Wood.name,
			Wood.images[variant % Wood.images.length], 
            Wood.imageHandler, 0, 0);
			
        this.cursorHover = Cursor.hand;
        this.angle = 90;
		this.impulseX = Helper.getRandom(-Wood.IMPULSE_X_MAX, Wood.IMPULSE_X_MAX);
		this.impulseAngle = this.impulseX;
	}

	logic(drawsDiffMs: number): void{
		super.logic(drawsDiffMs);

		// horizontal impulse (decays to 0 over time)
		this.x += this.impulseX * (drawsDiffMs / 1000);
		if(this.impulseX > 0){
			this.impulseX = Math.max(0, this.impulseX - Wood.IMPULSE_X_DECREASE_PER_MS * drawsDiffMs);
		}
		else if(this.impulseX < 0){
			this.impulseX = Math.min(0, this.impulseX + Wood.IMPULSE_X_DECREASE_PER_MS * drawsDiffMs);
		}

		// rotation impulse (decays to 0 over time)
		this.angle = (this.angle + this.impulseAngle * (drawsDiffMs / 1000)) % 360;
		if(this.angle < 0){
			this.angle += 360;
		}
		if(this.impulseAngle > 0){
			this.impulseAngle = Math.max(0, this.impulseAngle - Wood.IMPULSE_ROTATING_DECREASE_PER_MS * drawsDiffMs);
		}
		else if(this.impulseAngle < 0){
			this.impulseAngle = Math.min(0, this.impulseAngle + Wood.IMPULSE_ROTATING_DECREASE_PER_MS * drawsDiffMs);
		}
	}

	static init(): void{
		if(Wood.imageHandler.isEmpty){
			Wood.imageHandler.add(Wood.images).src = Wood1Image;
		}
	}

    onClicked(damage: number, mouseX: number, mouseY: number): void{
        Gamer.addWood(damage);
        Resources.DestroyResource(this.id);
    }
}