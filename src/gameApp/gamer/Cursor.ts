import {Draw} from '../gameSystems/Draw';

import {Mouse} from './Mouse';

import StandartImage from '../../assets/cursors/Standart.png';

/** Отображение курсора мыши - единичный статичный класс */
export class Cursor{
	static readonly default: string = StandartImage;

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
        this.customCursorAngleReturnSpeed = returnSpeed;
    }

    static logic(drawsDiffMs: number){
        if(this.customCursor !== null && (this.customCursorAngle > 0.1 || this.customCursorAngle < -0.1) && this.customCursorAngleReturnSpeed > 0){
            this.customCursorAngle += -1 * Math.sign(this.customCursorAngle) * this.customCursorAngleReturnSpeed * (drawsDiffMs / 1000);
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
