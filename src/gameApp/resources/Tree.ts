import {Resource} from "./Resource";

import {Gamer} from "../gamer/Gamer";

import {ImageHandler} from "../ImageHandler";

import {AudioSystem} from "../gameSystems/AudioSystem";

import Tree1Image from '../../assets/img/tree/tree1.png';  
import Tree2Image from '../../assets/img/tree/tree2.png';  
import Tree3Image from '../../assets/img/tree/tree3.png';  
import Tree4Image from '../../assets/img/tree/tree4.png';  
import Tree5Image from '../../assets/img/tree/tree5.png';  
import Tree6Image from '../../assets/img/tree/tree6.png';  
import Tree7Image from '../../assets/img/tree/tree7.png'; 

import Axe1Image from '../../assets/img/cursors/axe1.png';  

import Axe1Sound from '../../assets/sounds/axe/axe1.mp3';  
import Axe2Sound from '../../assets/sounds/axe/axe2.mp3';  
import Axe3Sound from '../../assets/sounds/axe/axe3.mp3';  

/// Ресурс - дерево
export class Tree extends Resource{
	static readonly imageHandler: ImageHandler = new ImageHandler();

	private static readonly cursorAxe: HTMLImageElement = new Image();

	private static readonly images: HTMLImageElement[] = []; //разные деревья

	public static readonly HEALTH_MAX: number = 100;

	constructor(x: number, y: number, variant: number = 0){
		super(x, y,  
			Tree.HEALTH_MAX, //health max
			1, //scale size
			Tree.images[variant % Tree.images.length], 
            Tree.name,
            Tree.imageHandler, 0, 0);
			
		this.maxImpulse = 2;
		this.impulseForceDecreasing = 5;
        this.cursorHover = Tree.cursorAxe;
	}

	static init(): void{
		if(Tree.imageHandler.isEmpty){
			Tree.imageHandler.add(Tree.images).src = Tree1Image;
			Tree.imageHandler.add(Tree.images).src = Tree2Image;
			Tree.imageHandler.add(Tree.images).src = Tree3Image;
			Tree.imageHandler.add(Tree.images).src = Tree4Image;
			Tree.imageHandler.add(Tree.images).src = Tree5Image;
			Tree.imageHandler.add(Tree.images).src = Tree6Image;
			Tree.imageHandler.add(Tree.images).src = Tree7Image;
			Tree.imageHandler.new(Tree.cursorAxe).src = Axe1Image;
			AudioSystem.load(Axe1Sound);
			AudioSystem.load(Axe2Sound);
			AudioSystem.load(Axe3Sound);
		}
	}


    onClicked(damage: number, mouseX: number, mouseY: number): void{
		const listOfSounds = [
			Axe1Sound,
			Axe2Sound,
			Axe3Sound,
		];
		AudioSystem.playRandomV(mouseX, listOfSounds, 1);
        this.applyDamage(damage, mouseX, mouseY, null, false);
        Gamer.addWood(damage);
    }

    drawHealth(): void{
        super.drawHealthBase(this.x + 10, this.y - 2, this.width - 10, "#0b5503", "#053000");
    }
}