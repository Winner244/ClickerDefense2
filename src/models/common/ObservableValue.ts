export type Unsubscribe = () => void;
export type ObservableListener<T> = (value: T) => void;

export class ObservableValue<T> {
    private _value: T;
    private readonly listeners = new Set<ObservableListener<T>>();

    constructor(initialValue: T) {
        this._value = initialValue;
    }

    get value(): T {
        return this._value;
    }

    set value(nextValue: T) {
        if (Object.is(this._value, nextValue)) {
            return;
        }

        this._value = nextValue;
        for (const listener of this.listeners) {
            listener(this._value);
        }
    }

    subscribe(listener: ObservableListener<T>, emitCurrentValue: boolean = true): Unsubscribe {
        this.listeners.add(listener);
        if (emitCurrentValue) {
            listener(this._value);
        }

        return () => {
            this.listeners.delete(listener);
        };
    }
}
