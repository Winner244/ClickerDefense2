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

type ClickOffsetVariant = { xMin: number; xMax: number; yMin: number; yMax: number };

/// Ресурс - дерево
export class Tree extends ResourceMined{
	static readonly imageHandler: ImageHandler = new ImageHandler();

	private static readonly cursorAxe: HTMLImageElement = new Image();

	private static readonly images: HTMLImageElement[] = []; //разные деревья

	static readonly HEALTH_MAX: number = 100;

    clickOffset: ClickOffsetVariant = { xMin: 0, xMax: 0, yMin: 0, yMax: 0 };
	static readonly CLICK_OFFSET_VARIANT: { [key: number]: ClickOffsetVariant } = {
        0: { xMin: 0.4, xMax: 0.6, yMin: 0.5, yMax: 0.8 },
        1: { xMin: 0.4, xMax: 0.6, yMin: 0.45, yMax: 0.8 },
        2: { xMin: 0.4, xMax: 0.6, yMin: 0.5, yMax: 0.84 },
        3: { xMin: 0.4, xMax: 0.6, yMin: 0.5, yMax: 0.8 },
        4: { xMin: 0.4, xMax: 0.6, yMin: 0.5, yMax: 0.8 },
        5: { xMin: 0.4, xMax: 0.6, yMin: 0.5, yMax: 0.88 },
        6: { xMin: 0.4, xMax: 0.6, yMin: 0.5, yMax: 0.8 },
    };

	constructor(x: number, y: number, variant: number = 0){
		super(x, y,  
			Tree.HEALTH_MAX, //health max
			1, //scale size
            Tree.name,
			Tree.images[variant % Tree.images.length], 
            Tree.imageHandler, 0, 0);
			
        this.cursorHover = Tree.cursorAxe;
        this.clickOffset = Tree.CLICK_OFFSET_VARIANT[variant];
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
		}
	}

    containsPoint(mouseX: number, mouseY: number): boolean{
        var result = super.containsPoint(mouseX, mouseY);

        if (result){
            return mouseX > this.width * this.clickOffset.xMin && mouseX < this.width * this.clickOffset.xMax &&
                   mouseY > this.height * this.clickOffset.yMin && mouseY < this.height * this.clickOffset.yMax;
        }

        return result;
    }


    onClicked(damage: number, mouseX: number, mouseY: number): void{
		AudioSystem.play(mouseX, Axe1Sound, 100, 1, true);
        //this.applyDamage(damage, mouseX, mouseY, null, false);
        Wood.init();
        const woodX = mouseX;
        const woodY = mouseY;
        const woodBottomY = this.y + this.height - this.height / 10;
        const wood = new Wood(woodX,  woodY, woodBottomY, 1);
        wood.x = mouseX - wood.width / 2;
        Resources.AddResource(wood); 
    }

    drawHealth(): void{
        super.drawHealthBase(this.x + 10, this.y - 2, this.width - 10, "#0b5503", "#053000");
    }
}