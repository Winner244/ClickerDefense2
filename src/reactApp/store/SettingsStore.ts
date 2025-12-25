import { Reducer } from 'redux';
import { DisctionaryLanguageList } from '../../models/common/DisctionaryLanguageList';
import { DisctionaryRuList } from '../../assets/languages/ru';
import { DisctionaryEnList } from '../../assets/languages/en';
import { AudioSystem } from '../../gameApp/gameSystems/AudioSystem';

export type LanguageCode = 'ru' | 'en';

const LS_LANGUAGE_CODE_KEY = 'SettingsStore.languageCode';
const LS_SOUNDS_VOLUME_PERCENT_KEY = 'SettingsStore.soundsVolumePercent';

function clampInt(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, Math.round(value)));
}

function getLanguageByCode(code: LanguageCode): DisctionaryLanguageList {
    return code === 'ru' ? DisctionaryRuList : DisctionaryEnList;
}

function loadLanguageCode(): LanguageCode {
    const fromStorage = localStorage.getItem(LS_LANGUAGE_CODE_KEY);
    if (fromStorage === 'ru' || fromStorage === 'en') {
        return fromStorage;
    }

    const browserLang = (navigator.language || '').toLowerCase();
    return browserLang.startsWith('ru') ? 'ru' : 'en';
}

function loadSoundsVolumePercent(): number {
    const raw = localStorage.getItem(LS_SOUNDS_VOLUME_PERCENT_KEY);
    if (!raw) {
        return 100;
    }

    const parsed = Number(raw);
    if (!Number.isFinite(parsed)) {
        return 100;
    }

    return clampInt(parsed, 0, 100);
}

// STATE
export interface SettingsState {
    language: DisctionaryLanguageList;
    languageCode: LanguageCode;
    soundsVolumePercent: number;
}

// ACTIONS
interface SetAction { type: 'SETTINGS__SET_LANGUAGE'; payload: DisctionaryLanguageList; }
interface SetLanguageCodeAction { type: 'SETTINGS__SET_LANGUAGE_CODE'; payload: LanguageCode; }
interface SetSoundsVolumePercentAction { type: 'SETTINGS__SET_SOUNDS_VOLUME_PERCENT'; payload: number; }

type KnownSettingsAction = SetAction | SetLanguageCodeAction | SetSoundsVolumePercentAction;

// ACTION CREATORS
export interface SettingsAction {
    setLanguage: (language: DisctionaryLanguageList) => SetAction;
    setLanguageCode: (languageCode: LanguageCode) => SetLanguageCodeAction;
    setSoundsVolumePercent: (soundsVolumePercent: number) => SetSoundsVolumePercentAction;
}
export const actionCreators = {
    setLanguage: (language: DisctionaryLanguageList): SetAction => ({
        type: 'SETTINGS__SET_LANGUAGE',
        payload: language,
    }),

    setLanguageCode: (languageCode: LanguageCode): SetLanguageCodeAction => {
        localStorage.setItem(LS_LANGUAGE_CODE_KEY, languageCode);
        return {
            type: 'SETTINGS__SET_LANGUAGE_CODE',
            payload: languageCode,
        };
    },

    setSoundsVolumePercent: (soundsVolumePercent: number): SetSoundsVolumePercentAction => {
        const clamped = clampInt(soundsVolumePercent, 0, 100);
        localStorage.setItem(LS_SOUNDS_VOLUME_PERCENT_KEY, clamped.toString());
        AudioSystem.soundVolume = clamped;
        if(clamped === 0){
            AudioSystem.isEnabled = false;
        } else {
            AudioSystem.isEnabled = true;
        }

        return {
            type: 'SETTINGS__SET_SOUNDS_VOLUME_PERCENT',
            payload: clamped,
        };
    },
};

const defaultLanguageCode = loadLanguageCode();
const defaultSoundsVolumePercent = loadSoundsVolumePercent();
AudioSystem.soundVolume = defaultSoundsVolumePercent;

const defaultSettingsState: SettingsState = {
    languageCode: defaultLanguageCode,
    language: getLanguageByCode(defaultLanguageCode),
    soundsVolumePercent: defaultSoundsVolumePercent,
};

// REDUCER 
export const reducer: Reducer<SettingsState, KnownSettingsAction> = (state: SettingsState | undefined, action: KnownSettingsAction) => {
    switch (action.type) {
        case 'SETTINGS__SET_LANGUAGE':
            // Backward-compatible: infer code from dictionary instance.
            // (Used if some code still dispatches setLanguage directly.)
            localStorage.setItem(
                LS_LANGUAGE_CODE_KEY,
                action.payload === DisctionaryRuList ? 'ru' : 'en'
            );

            return Object.assign({}, state, {
                languageCode: action.payload === DisctionaryRuList ? 'ru' : 'en',
                language: action.payload,
            });

        case 'SETTINGS__SET_LANGUAGE_CODE':
            return Object.assign({}, state, {
                languageCode: action.payload,
                language: getLanguageByCode(action.payload),
            });

        case 'SETTINGS__SET_SOUNDS_VOLUME_PERCENT':
            return Object.assign({}, state, {
                soundsVolumePercent: action.payload,
            });
    }

    return state || defaultSettingsState;
};
