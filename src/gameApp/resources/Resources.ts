import { Cursor } from "../gamer/Cursor";
import { Gamer } from "../gamer/Gamer";
import { Resource } from "./Resource";

/** Система управления всеми ресурсами - единичный статичный класс */
export class Resources
{
	static all: Resource[] = []; //все ресурсы на карте

    static AddResource(resource: Resource): void{
        Resources.all.push(resource);
		Resources.all.sort((a, b) => (a.y + a.height) - (b.y + b.height));
    }

	static mouseLogic(mouseX: number, mouseY: number, isClick: boolean, isHoverFound: boolean): boolean{
		if(!isHoverFound){
			return false; 
		}

        for(var i = 0; i< Resources.all.length; i++)
        {
            const resource = Resources.all[i];
            //проверяем попадание клика по ресурсу
			if (mouseX > resource.x && mouseX < resource.x + resource.width &&
				mouseY > resource.y && mouseY < resource.y + resource.height)
			{
				if (resource.containsPoint(mouseX - resource.x, mouseY - resource.y)) 
				{
                    if(resource.cursorHover !== null)
					    Cursor.setCustomCursor(resource.cursorHover);

					//игрок кликает по ресурсу
					if(isClick){
						resource.onClicked(Gamer.cursorDamage, mouseX, mouseY);
                        if(resource.cursorHover !== null)
                            Cursor.rotateCustomCursor(resource.cursorHover, -50, 200);
					}

					return true;
				}
			}
		}

		return false;
	}
    
	static draw(drawsDiffMs: number): void{
		Resources.all.forEach(resource => resource.draw(drawsDiffMs)); 
	}
}