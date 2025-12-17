import {AttackedObject} from "../../models/objects/AttackedObject";

/// Ресурс - базовый класс для всех ресурсов на карте
export class Resource extends AttackedObject{

    cursorHover: HTMLImageElement|null = null;

    onClicked(damage: number, mouseX: number, mouseY: number): void{
        
    }

    draw(drawsDiffMs: number): void{
		if(!this.imageHandler.isImagesCompleted){
			return;
		}

		super.drawBase(drawsDiffMs);

		this.drawHealth();
    }

    drawHealth(): void{
        super.drawHealthBase(this.x + 10, this.y - 2, this.width - 10);
    }
}