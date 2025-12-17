import {BaseObject} from './BaseObject';


export class LeftTimeObject extends BaseObject {
	public leftTimeMs: number; //оставшеея время жизни объекта (миллисекунды)
	public readonly initialLeftTimeMs: number; //изначальное время жизни

	constructor(x: number, y: number, width: number, height: number, lifeTimeMs: number){
        super(x, y, width, height);
		this.leftTimeMs = lifeTimeMs;
		this.initialLeftTimeMs = lifeTimeMs;
	}
}