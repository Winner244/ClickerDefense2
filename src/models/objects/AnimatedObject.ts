import Animation from '../animations/Animation';

import {LeftTimeObject} from './LeftTimeObject';


export class AnimatedObject extends LeftTimeObject{
	public animation: Animation;

	constructor(x: number, y: number, width: number, height: number, animation: Animation){
		super(x, y, width, height, animation.leftTimeMs);

		this.animation = animation;
	}

	draw(drawsDiffMs: number){
		this.animation.draw(drawsDiffMs, this.location.x, this.location.y, this.size.width, this.size.height);
		this.leftTimeMs = this.animation.leftTimeMs;
	}
}