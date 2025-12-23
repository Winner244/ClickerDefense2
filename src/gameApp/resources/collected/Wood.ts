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

	private static readonly images: HTMLImageElement[] = []; //разные деревяшки

	constructor(x: number, y: number, bottomY: number, variant: number = 0){
		super(x, y, bottomY, 
			1, //health max
			0.5, //scale size
            Wood.name,
			Wood.images[variant % Wood.images.length], 
            Wood.imageHandler, 0, 0);
			
        this.cursorHover = Cursor.hand;
        this.angle = Helper.getRandom(0, 360);
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