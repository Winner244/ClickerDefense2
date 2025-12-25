import { ObservableSavedValue } from "../../models/common/ObservableSavedValue";

/** Данные Игрока - единичный статичный класс */
export class Gamer{
	static cursorDamage: number = 1; //урон кликом
	static woodCount = new ObservableSavedValue<number>('gamer_woodCount', 0); //количество собранного дерева

	static init(): void{
		Gamer.cursorDamage = 1;
	}

    static addWood(amount: number): void{
		Gamer.woodCount.value = Gamer.woodCount.value + amount;
    }
}