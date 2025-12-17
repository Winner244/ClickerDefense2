/** Данные Игрока - единичный статичный класс */
export class Gamer{
	static cursorDamage: number = 1; //урон кликом

	static init(): void{
		this.cursorDamage = 1;
	}
}