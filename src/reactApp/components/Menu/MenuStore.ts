import { Reducer } from 'redux';

// STATE
export interface MenuState {
    isOpen: boolean;
}

// ACTIONS
interface OpenAction { type: 'MENU__OPEN' }
interface CloseAction { type: 'MENU__CLOSE' }

type KnownMenuAction = CloseAction | OpenAction;

// ACTION CREATORS
//for TypeScript
export interface MenuAction {
    close: () => CloseAction;
    open: () => OpenAction;
}
export const actionCreators = {
    close: (): CloseAction => ({ type: 'MENU__CLOSE' }),
    open: (): OpenAction => ({ type: 'MENU__OPEN' }),
};

const defaultMenuState: MenuState = {
    isOpen: true,
};

// REDUCER 
export const reducer: Reducer<MenuState> = (state: MenuState | undefined, action: KnownMenuAction) => {
    switch (action.type) {
        case 'MENU__CLOSE':
            return Object.assign({}, state, { 
                isOpen: false, 
             });
        case 'MENU__OPEN':
            return Object.assign({}, state, { 
                isOpen: true, 
            });
    }

    return state || defaultMenuState;
};
