export type Unsubscribe = () => void;
export type ObservableListener<T> = (value: T) => void;

export class ObservableSavedValue<T> {
    private _name: string;
    private readonly listeners = new Set<ObservableListener<T>>();

    constructor(name: string, initialValue: T) {
        this._name = name;

        //set default if not exists
        if (this.value === undefined){
            this.value = initialValue;
        }
    }

    get value(): T {
        const valueStr = window.localStorage.getItem('observableSavedValue_' + this._name);
        if (valueStr === null){
            return undefined as unknown as T;
        }
        
        return JSON.parse(valueStr) as T;
    }

    set value(nextValue: T) {
        window.localStorage.setItem('observableSavedValue_' + this._name, JSON.stringify(nextValue));

        //send value to subscriptions
        for (const listener of this.listeners) {
            listener(nextValue);
        }
    }

    subscribe(listener: ObservableListener<T>, emitCurrentValue: boolean = true): Unsubscribe {
        this.listeners.add(listener);
        if (emitCurrentValue) {
            listener(this.value);
        }

        return () => {
            this.listeners.delete(listener);
        };
    }
}
