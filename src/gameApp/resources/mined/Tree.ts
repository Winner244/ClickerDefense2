import {ResourceMined} from "./ResourceMined";
import {Resources} from "../Resources";
import {Wood} from "../collected/Wood";

import {ImageHandler} from "../../ImageHandler";
import {AudioSystem} from "../../gameSystems/AudioSystem";


import Tree1Image from '../../../assets/img/resources/tree/tree1.png';  
import Tree2Image from '../../../assets/img/resources/tree/tree2.png';  
import Tree3Image from '../../../assets/img/resources/tree/tree3.png';  
import Tree4Image from '../../../assets/img/resources/tree/tree4.png';  
import Tree5Image from '../../../assets/img/resources/tree/tree5.png';  
import Tree6Image from '../../../assets/img/resources/tree/tree6.png';  
import Tree7Image from '../../../assets/img/resources/tree/tree7.png'; 

import Axe1Image from '../../../assets/img/cursors/axe1.png';  

import Axe1Sound from '../../../assets/sounds/axe/axe1.mp3';  
import Axe2Sound from '../../../assets/sounds/axe/axe2.mp3';  
import Axe3Sound from '../../../assets/sounds/axe/axe3.mp3';  

/// Ресурс - дерево
export class Tree extends ResourceMined{
	static readonly imageHandler: ImageHandler = new ImageHandler();

	private static readonly cursorAxe: HTMLImageElement = new Image();

	private static readonly images: HTMLImageElement[] = []; //разные деревья

	public static readonly HEALTH_MAX: number = 100;

	constructor(x: number, y: number, variant: number = 0){
		super(x, y,  
			Tree.HEALTH_MAX, //health max
			1, //scale size
            Tree.name,
			Tree.images[variant % Tree.images.length], 
            Tree.imageHandler, 0, 0);
			
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
        Wood.init();
        const middleHeight = this.y + this.height / 2;
        const woodX = mouseX;
        const woodY = mouseY > middleHeight + this.height / 4 
            ? middleHeight 
            : mouseY < middleHeight - this.height / 4 
                ? middleHeight 
                : mouseY;
        const woodBottomY = this.y + this.height - this.height / 10;
        const wood = new Wood(woodX,  woodY, woodBottomY, 1);
        wood.x = mouseX - wood.width / 2;
        Resources.AddResource(wood); 
    }

    drawHealth(): void{
        super.drawHealthBase(this.x + 10, this.y - 2, this.width - 10, "#0b5503", "#053000");
    }
}