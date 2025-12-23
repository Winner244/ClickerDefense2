import {AttackedObject} from "../../../models/objects/AttackedObject";

import {Cursor} from "../../gamer/Cursor";

/// Собираемый Ресурс - базовый класс для всех ресурсов на карте
export class ResourceCollected extends AttackedObject{

    static readonly SPEED_FALLING: number = 0.3; //скорость падения ресурса вниз

    cursorHover: HTMLImageElement|string|null = Cursor.hand;
    angle: number = 0;
    bottomY: number = 0; //до куда будет падать собираемый объект силой гравитации

    constructor(x: number, y: number, bottomY: number,
        healthMax: number, 
        scaleSize: number, 
        name: string, 
        image: HTMLImageElement, imageHandler: any, frames: number, animationDurationMs: number)
    {
        super(x, y, healthMax, scaleSize, name, image, imageHandler, frames, animationDurationMs);
        this.bottomY = bottomY;
    }

    logic(drawsDiffMs: number): void{
        super.logicBase(drawsDiffMs);

        //логика падения ресурса вниз
        if(this.y + this.height < this.bottomY){
            this.y += ResourceCollected.SPEED_FALLING * drawsDiffMs;
        }
    }

    onClicked(damage: number, mouseX: number, mouseY: number): void{
        
    }

    draw(drawsDiffMs: number): void{
		if(!this.imageHandler.isImagesCompleted){
			return;
		}

		super.drawBase(drawsDiffMs);
    }
}