import { Reducer } from 'redux';
import { DisctionaryLanguageList } from '../../models/common/DisctionaryLanguageList';
import { DisctionaryRuList } from '../../assets/languages/ru';
import { DisctionaryEnList } from '../../assets/languages/en';

// STATE
export interface SettingsState {
    language: DisctionaryLanguageList;
}

// ACTIONS
interface SetAction { type: 'SETTINGS__SET_LANGUAGE'; payload: DisctionaryLanguageList; }

type KnownSettingsAction = SetAction;

// ACTION CREATORS
export interface SettingsAction {
    setLanguage: (language: DisctionaryLanguageList) => SetAction;
}
export const actionCreators = {
    setLanguage: (language: DisctionaryLanguageList): SetAction => ({
        type: 'SETTINGS__SET_LANGUAGE',
        payload: language,
    }),
};

const defaultSettingsState: SettingsState = {
    language: navigator.language == 'ru' ? DisctionaryRuList : DisctionaryEnList,
};

// REDUCER 
export const reducer: Reducer<SettingsState, KnownSettingsAction> = (state: SettingsState | undefined, action: KnownSettingsAction) => {
    switch (action.type) {
        case 'SETTINGS__SET_LANGUAGE':
            return Object.assign({}, state, {
                language: action.payload,
            });
    }

    return state || defaultSettingsState;
};
