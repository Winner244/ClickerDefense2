import {AttackedObject} from "../../../models/objects/AttackedObject";

import {Cursor} from "../../gamer/Cursor";

/// Собираемый Ресурс - базовый класс для всех ресурсов на карте
export class ResourceCollected extends AttackedObject{

    cursorHover: HTMLImageElement|string|null = Cursor.hand;
    angle: number = 0;

    onClicked(damage: number, mouseX: number, mouseY: number): void{
        
    }

    draw(drawsDiffMs: number): void{
		if(!this.imageHandler.isImagesCompleted){
			return;
		}

		super.drawBase(drawsDiffMs);
    }
}