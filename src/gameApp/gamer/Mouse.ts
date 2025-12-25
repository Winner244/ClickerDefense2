import {Point} from "../../models/Point";

import {Draw} from "../gameSystems/Draw";

/** Данные по вводу клавиш через мышку - единичный статичный класс */
export class Mouse{
	static x: number;
	static y: number;
	static isClick: boolean;
	static isRightClick: boolean;
	static isRightDown: boolean;

	static get canvasX(): number{
		return Mouse.x / (Draw.canvas.clientWidth / Draw.canvas.width)
	}

	static get canvasY(): number{
		return Mouse.y / (Draw.canvas.clientHeight / Draw.canvas.height);
	}

	static init(): void{
		window.removeEventListener('mousemove', Mouse.onMove);
		window.removeEventListener('mousedown', Mouse.onClick);
		window.removeEventListener('mouseup', Mouse.onMouseUp);
		window.addEventListener('mousemove', Mouse.onMove);
		window.addEventListener('mousedown', Mouse.onClick);
		window.addEventListener('mouseup', Mouse.onMouseUp);
		this.isClick = false;
		this.isRightDown = false;
	}

	static onClick(event: MouseEvent): void{
		Mouse.isClick = event.button == 0;
		Mouse.isRightClick = event.button == 2;
		if (event.button == 2) {
			Mouse.isRightDown = true;
		}
	}

	static onMouseUp(event: MouseEvent): void{
		if (event.button == 2) {
			Mouse.isRightDown = false;
		}
	}

	static onMove(event: MouseEvent): void{
		const reactDiv = document.getElementById('react');
        const headerDiv = document.getElementById('topHeader')
		const scrollTopMain = reactDiv?.scrollTop ?? 0;

		Mouse.x = event.pageX;
		Mouse.y = event.pageY - (headerDiv?.offsetHeight || 0) + scrollTopMain;

		// Keep button state in sync while moving.
		// (Right button is bit 2 in MouseEvent.buttons.)
		Mouse.isRightDown = (event.buttons & 2) === 2;
	}

	static getCanvasMousePoint(): Point{
		let x = Mouse.x / (Draw.canvas.clientWidth / Draw.canvas.width);
		let y = Mouse.y / (Draw.canvas.clientHeight / Draw.canvas.height);
		return new Point(x, y);
	}
}