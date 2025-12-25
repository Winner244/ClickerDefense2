import * as React from 'react';

import { DisctionaryLanguageList } from '../../../models/common/DisctionaryLanguageList';
import { LanguageCode } from '../../store/SettingsStore';

import '../Menu/Menu.scss';
import './SettingsModal.scss';

type Props = {
    language: DisctionaryLanguageList;
    languageCode: LanguageCode;
    soundsVolumePercent: number;
    setLanguageCode: (languageCode: LanguageCode) => void;
    setSoundsVolumePercent: (soundsVolumePercent: number) => void;
};

export class SettingsModal extends React.Component<Props> {

    onChangeLanguage(event: React.ChangeEvent<HTMLSelectElement>) {
        const value = event.target.value;
        if (value === 'ru' || value === 'en') {
            this.props.setLanguageCode(value);
        }
    }

    onChangeSoundsVolume(event: React.ChangeEvent<HTMLInputElement>) {
        const nextValue = Number(event.target.value);
        this.props.setSoundsVolumePercent(nextValue);
    }

    render() {
        return (
            <div className='settings'>
                <div className='settings__row'>
                    <div className='settings__label'>{this.props.language.Menu.Settings.LanguageLabel}</div>
                    <select
                        className='settings__select'
                        value={this.props.languageCode}
                        onChange={(e) => this.onChangeLanguage(e)}
                    >
                        <option value='en'>{this.props.language.Menu.Settings.LanguageEnglishLabel}</option>
                        <option value='ru'>{this.props.language.Menu.Settings.LanguageRussianLabel}</option>
                    </select>
                </div>

                <div className='settings__row'>
                    <div className='settings__label'>{this.props.language.Menu.Settings.SoundsVolumeLabel}: {this.props.soundsVolumePercent}%</div>
                    <input
                        className='settings__range'
                        type='range'
                        min={0}
                        max={100}
                        step={1}
                        value={this.props.soundsVolumePercent}
                        onChange={(e) => this.onChangeSoundsVolume(e)}
                    />
                </div>
            </div>
        );
    }
}
