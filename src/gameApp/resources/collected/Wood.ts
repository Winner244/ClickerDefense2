import {ResourceCollected} from "./ResourceCollected";

import {Gamer} from "../../gamer/Gamer";

import {ImageHandler} from "../../ImageHandler";

import {Cursor} from "../../gamer/Cursor";

import {Helper} from "../../helpers/Helper";

import {Resources} from "../Resources";

import {Labels} from "../../labels/Labels";

import Wood1Image from '../../../assets/img/resources/wood/wood1.png';  

/// Ресурс - деревяшка - падает при рубке деревьев
export class Wood extends ResourceCollected{
	static readonly imageHandler: ImageHandler = new ImageHandler();

	static readonly LIFE_TIME_MS: number = 5000;

	static readonly IMPULSE_X_MAX: number = 300;
	static readonly IMPULSE_X_DECREASE_PER_MS: number = 0.1;
	static readonly IMPULSE_ROTATING_DECREASE_PER_MS: number = 1;
	static readonly ANGLE_SNAP_SPEED_DEG_PER_MS: number = 0.25;


	impulseX: number;
	impulseDecreasing: number;
	impulseAngle: number;
	private angleSnapTarget: number | null = null;

	private static readonly images: HTMLImageElement[] = []; //разные деревяшки

	constructor(x: number, y: number, bottomY: number, variant: number = 0){
		super(x, y, bottomY, 
			1, //health max
			0.5, //scale size
            Wood.name,
			Wood.images[variant % Wood.images.length], 
            Wood.imageHandler, 0, 0);
			
        this.cursorHover = Cursor.hand;
		this.lifeTime = Wood.LIFE_TIME_MS;
        this.angle = Helper.getRandom(0, 360);
		this.impulseX = Helper.getRandom(-Wood.IMPULSE_X_MAX, Wood.IMPULSE_X_MAX);
		this.impulseAngle = this.impulseX / 2;
        this.impulseDecreasing = Wood.IMPULSE_X_DECREASE_PER_MS;
	}

	logic(drawsDiffMs: number): void{
		const wasFalling = this.y + this.height < this.bottomY;
		super.logic(drawsDiffMs);
		const isFalling = this.y + this.height < this.bottomY;

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

		// after falling: smoothly adjust angle to a stable resting pose
		if(wasFalling && !isFalling){
			this.angle = Wood.normalizeAngle(this.angle);
			this.angleSnapTarget = Wood.getAngleSnapTargetAfterFalling(this.angle);
			this.impulseAngle = 0;
            this.impulseX = 0;
		}

		if(this.angleSnapTarget !== null){
			const nextAngle = Wood.moveAngleTowards(this.angle, this.angleSnapTarget, Wood.ANGLE_SNAP_SPEED_DEG_PER_MS * drawsDiffMs);
			this.angle = nextAngle;
			if(nextAngle === this.angleSnapTarget){
				this.angleSnapTarget = null;
			}
		}
	}

	private static normalizeAngle(angle: number): number{
		let normalized = angle % 360;
		if(normalized < 0){
			normalized += 360;
		}
		return normalized;
	}

	private static getAngleSnapTargetAfterFalling(angle: number): number | null{
        // > 45 to 106 move to 45
        // > 106 to 150 move to 150
        // > 245 to 286 move to 245
        // > 286 to 330 move to 330
		if(angle > 45 && angle < 106){
			return 45;
		}
		if(angle > 106 && angle < 150){
			return 150;
		}
        if(angle > 245 && angle < 286){
            return 245;
        }
        if(angle > 286 && angle < 330){
            return 330;
        }
		return null;
	}

	private static moveAngleTowards(current: number, target: number, maxStep: number): number{
		const delta = ((target - current + 540) % 360) - 180;

		if(Math.abs(delta) <= maxStep){
			return target;
		}
		return current + Math.sign(delta) * maxStep;
	}

	static init(): void{
		if(Wood.imageHandler.isEmpty){
			Wood.imageHandler.add(Wood.images).src = Wood1Image;
		}
	}

    onClicked(damage: number, mouseX: number, mouseY: number): void{
        Gamer.addWood(damage);
		Labels.createResourceLabel(mouseX, mouseY, 200, 50, 0, 50, 0, 0, `+ ${damage}`, this.image);
        Resources.DestroyResource(this.id);
    }
}