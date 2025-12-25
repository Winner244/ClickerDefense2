/** Система рисования на холсте - единичный статичный экземпляр */
export class Draw{
	static canvas: HTMLCanvasElement;
	static ctx: CanvasRenderingContext2D;

	private static filteredImages: { [Key: string]: { [Key: string]: OffscreenCanvas } } = {};
	
	static init(element: HTMLCanvasElement): void{
		this.canvas = element;
		this.ctx = element.getContext('2d') || new CanvasRenderingContext2D();
		this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
	}

	/** Прорисовка жизней */
	static drawHealth(x: number, y: number, width: number, healthMax: number, healthCurrent: number, 
        mainColor: string = "red", 
        borderColor: string = "orange",
        otherColor: string = "black"
    ): void{
		let height = 2;
		let border = 0;
		Draw.ctx.fillStyle = borderColor;
		Draw.ctx.fillRect(x, y, width + border * 2, height + border * 2);

		Draw.ctx.fillStyle = otherColor;
		Draw.ctx.fillRect(x + border, y + border, width, height);

		Draw.ctx.fillStyle = mainColor;
		Draw.ctx.fillRect(x + border, y + border, width * (healthCurrent/ healthMax), height);
	}

	/** Очитка холста */
	static clear(){
		Draw.ctx.clearRect(0, 0, Draw.canvas.width, Draw.canvas.height);
	}

	/** Затемнение холста */
	static drawBlackout(){
		Draw.ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
		Draw.ctx.fillRect(0, 0, Draw.canvas.width, Draw.canvas.height);
	}

	public static getFilteredImage(filter: string|null = null, image: HTMLImageElement, width: number, height: number): HTMLImageElement|OffscreenCanvas{
		if(!filter || !image.complete || !image.src){
			return image;
		}

		let imageName = image.src.split('/').pop() || '';
		if(imageName in Draw.filteredImages && filter in Draw.filteredImages[imageName]){
			return Draw.filteredImages[imageName][filter];
		}

		//create filtered image
		Draw.filteredImages[imageName] = Draw.filteredImages[imageName] || {};
		Draw.filteredImages[imageName][filter] = new OffscreenCanvas(width, height);
		let context = Draw.filteredImages[imageName][filter].getContext('2d');
		if(!context){
			console.error('offscreen context to fileting image is empty!');
			return image;
		}
		
		context.filter = filter;
		context.drawImage(image, 0, 0, width, height);
		return Draw.filteredImages[imageName][filter];
	}
}