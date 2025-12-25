import { ObservableValue } from "../../models/common/ObservableValue";

/** Данные Игрока - единичный статичный класс */
export class Gamer{
	static cursorDamage: number = 1; //урон кликом
	static woodCount: ObservableValue<number> = new ObservableValue<number>(0); //количество собранного дерева

	static init(): void{
		Gamer.cursorDamage = 1;
		Gamer.woodCount.value = 0;
	}

    static addWood(amount: number): void{
		Gamer.woodCount.value = Gamer.woodCount.value + amount;
    }
}