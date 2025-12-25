import {AttackedObject} from "../../../models/objects/AttackedObject";

import {Cursor} from "../../gamer/Cursor";
import {AudioSystem} from "../../gameSystems/AudioSystem";

import {Resources} from "../Resources";

import takeSound from '../../../assets/sounds/take.mp3';

/// Собираемый Ресурс - базовый класс для всех ресурсов на карте
export class ResourceCollected extends AttackedObject{

    static readonly SPEED_FALLING: number = 0.3; //скорость падения ресурса вниз

    cursorHover: HTMLImageElement|string|null = Cursor.hand;
    angle: number = 0;
    bottomY: number = 0; //до куда будет падать собираемый объект силой гравитации
    lifeTime: number|null = null;

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

        if(this.lifeTime !== null){
            this.lifeTime -= drawsDiffMs;
            if(this.lifeTime <= 0){
                Resources.DestroyResource(this.id);
                return;
            }
        }

        //логика падения ресурса вниз
        if(this.y + this.height < this.bottomY){
            this.y += ResourceCollected.SPEED_FALLING * drawsDiffMs;
        }
    }

    onClicked(damage: number, mouseX: number, mouseY: number): void{
        AudioSystem.play(mouseX, takeSound, 1, 1, true);
        Resources.DestroyResource(this.id);
    }

    draw(drawsDiffMs: number): void{
		if(!this.imageHandler.isImagesCompleted){
			return;
		}

		super.drawBase(drawsDiffMs);
    }
}