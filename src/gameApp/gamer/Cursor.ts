import {Draw} from '../gameSystems/Draw';

import {Mouse} from './Mouse';

import StandartImage from '../../assets/cursors/Standart.png';
import HandImage from '../../assets/cursors/Hand.png';

/** Отображение курсора мыши - единичный статичный класс */
export class Cursor{
	static readonly default: string = StandartImage;
	static readonly hand: string = HandImage;

    static customCursor: HTMLImageElement|null = null;
    static customCursorAngle: number = 0;
    static customCursorAngleReturnSpeed: number = 0;

	static init(){
		var canvas = document.querySelector('.game-canvas');
		if(canvas){
			canvas.addEventListener('mouseleave', () => {
                this.setCursor(Cursor.default);
			});
		}
	}

	static setCursor(cursor: string)
	{
        this.customCursor = null;
		document.body.style.cursor = "url(" + cursor + "), auto";
	}

	static setCustomCursor(cursor: HTMLImageElement)
	{
        document.body.style.cursor = "none";
        this.customCursor = cursor;
	}

    static rotateCustomCursor(cursor: HTMLImageElement, angle: number, returnSpeed: number)
    {
        document.body.style.cursor = "none";
        this.customCursor = cursor;
        this.customCursorAngle = angle;
        this.customCursorAngleReturnSpeed = -1 * Math.sign(angle) * returnSpeed;
    }

    static logic(drawsDiffMs: number){
        if(this.customCursor !== null && this.customCursorAngle !== 0 && this.customCursorAngleReturnSpeed !== 0){
            const delta = this.customCursorAngleReturnSpeed * (drawsDiffMs / 1000);
            const nextAngle = this.customCursorAngle + delta;

            if(Math.sign(nextAngle) !== Math.sign(this.customCursorAngle) || Math.abs(nextAngle) < 0.1){
                this.customCursorAngle = 0;
                this.customCursorAngleReturnSpeed = 0;
            }
            else{
                this.customCursorAngle = nextAngle;
            }
        }
    }

    static draw(drawsDiffMs: number){
        if(this.customCursor !== null){
			Draw.ctx.setTransform(1, 0, 0, 1, Mouse.canvasX + 32, Mouse.canvasY + 32); 
			Draw.ctx.rotate(this.customCursorAngle * Math.PI / 180);

            Draw.ctx.drawImage(this.customCursor, -32, -32, 32, 32);

			Draw.ctx.setTransform(1, 0, 0, 1, 0, 0);
			Draw.ctx.rotate(0);
        }
    }
}
