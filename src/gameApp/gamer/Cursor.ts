
import StandartImage from '../../assets/cursors/Standart.png';

/** Отображение курсора мыши - единичный статичный класс */
export class Cursor{
	static readonly default: string = StandartImage;

	static isCursorCanvasOut: boolean = false; //курсор вышел за границы canvas ?

	static init(){
		var canvas = document.querySelector('.game-canvas');
		if(canvas){
			canvas.addEventListener('mouseleave', () => {
				this.isCursorCanvasOut = true;
                this.setCursor(Cursor.default);
			});

			canvas.addEventListener('mouseenter', () => {
				this.isCursorCanvasOut = false;
			});
		}
	}

	static setCursor(cursor: string)
	{
		if(this.isCursorCanvasOut){
			document.body.style.cursor = "url(" + this.default + "), auto";
			return;
		}

		document.body.style.cursor = "url(" + cursor + "), auto";
	}

    static logic(drawsDiffMs: number){
    }
}
