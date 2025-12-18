import { Cursor } from "../gamer/Cursor";
import { Gamer } from "../gamer/Gamer";
import { ResourceCollected } from "./collected/ResourceCollected";
import { ResourceMined } from "./mined/ResourceMined";

/** Система управления всеми ресурсами - единичный статичный класс */
export class Resources
{
	static allCollected: ResourceCollected[] = []; //все собираемые ресурсы на карте
	static allMined: ResourceMined[] = []; //все добываемые ресурсы на карте
    
    static AddResource(resource: ResourceMined | ResourceCollected): void{
        if(resource instanceof ResourceCollected){
            Resources.allCollected.push(resource);
            Resources.allCollected.sort((a, b) => (a.y + a.height) - (b.y + b.height));
        }
        else if(resource instanceof ResourceMined){
            Resources.allMined.push(resource);
            Resources.allMined.sort((a, b) => (a.y + a.height) - (b.y + b.height));
        }
    }

    static DestroyResource(resourceId: string): void{
        this.allCollected = this.allCollected.filter(r => r.id !== resourceId);
        this.allMined = this.allMined.filter(r => r.id !== resourceId);
    }

	static mouseLogic(mouseX: number, mouseY: number, isClick: boolean, isHoverFound: boolean): boolean{
		if(!isHoverFound){
			return false; 
		}

		const isPointInResourceBounds = (resource: ResourceCollected|ResourceMined): boolean => {
			if(resource.currentCanvas){
				const left = resource.centerX - resource.currentCanvas.width / 2;
				const right = resource.centerX + resource.currentCanvas.width / 2;
				const top = resource.centerY - resource.currentCanvas.height / 2;
				const bottom = resource.centerY + resource.currentCanvas.height / 2;

				return mouseX > left && mouseX < right && mouseY > top && mouseY < bottom;
			}

			return mouseX > resource.x && mouseX < resource.x + resource.width &&
				mouseY > resource.y && mouseY < resource.y + resource.height;
		};

        for(var i = 0; i < Resources.allCollected.length; i++)
        {
            const resource = Resources.allCollected[i];
            //проверяем попадание клика по ресурсу
			if (isPointInResourceBounds(resource))
			{
				if (resource.containsPoint(mouseX - resource.x, mouseY - resource.y)) 
				{
                    if(resource.cursorHover !== null)
                        if (resource.cursorHover instanceof HTMLImageElement)
					        Cursor.setCustomCursor(resource.cursorHover);
                        else
                            Cursor.setCursor(resource.cursorHover);

					//игрок кликает по ресурсу
					if(isClick){
						resource.onClicked(Gamer.cursorDamage, mouseX, mouseY);
					}

					return true;
				}
			}
		}

        for(var i = 0; i < Resources.allMined.length; i++)
        {
            const resource = Resources.allMined[i];
            //проверяем попадание клика по ресурсу
			if (isPointInResourceBounds(resource))
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
		Resources.allMined.forEach(resource => resource.draw(drawsDiffMs)); 
		Resources.allCollected.forEach(resource => resource.draw(drawsDiffMs)); 
	}
}