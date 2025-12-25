import * as React from 'react';
import { connect } from 'react-redux';

import { ApplicationState } from '../../store';
import * as MenuStore from './MenuStore';
import * as SettingsStore from '../../store/SettingsStore';

import { App } from '../../App';

import { Mouse } from '../../../gameApp/gamer/Mouse';
import { Keypad } from '../../../gameApp/gamer/Keypad';

import { Game } from '../../../gameApp/gameSystems/Game';
import { AudioSystem } from '../../../gameApp/gameSystems/AudioSystem';

import { SettingsModal } from '../SettingsModal/SettingsModal';
import { MenuModal } from '../MenuModal/MenuModal';

import './Menu.scss';

import SelectingSoundUrl from '../../../assets/sounds/menu/selecting.mp3';

interface IState {
  view: 'main' | 'settings';
}

interface OwnProps {
  isOpen?: boolean;
}

type Props =
  MenuStore.MenuState
  & MenuStore.MenuAction
  & SettingsStore.SettingsState
  & SettingsStore.SettingsAction
  & OwnProps;

export class Menu extends React.Component<Props, IState> {

  constructor(props: Props) {
    super(props);

    this.state = {
      view: 'main'
    };
  }

  static loadSelectSound() {
    AudioSystem.load(SelectingSoundUrl);
  }

  static show(): void {
    Menu.playSoundSelect();
    App.Store.dispatch(MenuStore.actionCreators.open());
  }

  static hide(): void {
    Menu.playSoundSelect();
    Game.isBlockMouseLogic = false;
    App.Store.dispatch(MenuStore.actionCreators.close());
  }

  private static playSoundSelect() {
    AudioSystem.play(Keypad.isEnter ? -1 : Mouse.x, SelectingSoundUrl, 20);
  }

  componentWillUpdate(nextProps: Props) {
    if (nextProps.isOpen !== this.props.isOpen) {
      if (this.state.view !== 'main') {
        this.setState({ view: 'main' });
      }
    }
  }

  onClickContinue() {
    Menu.playSoundSelect();
    this.props.close();
    Game.continue();
  }

  onClickOpenSettings() {
    Menu.playSoundSelect();
    this.setState({ view: 'settings' });
  }

  onClickBackFromSettings() {
    Menu.playSoundSelect();
    this.setState({ view: 'main' });
  }

  render() {
    return (
      <div>
        {this.props.isOpen
          ? <div className="menu noselect">
            <div className="menu__body">
              <div className="menu__title">
                {this.state.view === 'settings'
                  ? this.props.language.Menu.Settings.HeaderLabel
                  : this.props.language.Menu.HeaderLabel
                }
              </div>
              <div className="menu__close" onClick={() => this.onClickContinue()}>
                <div className="menu__close-body">x</div>
              </div>

              {this.state.view === 'settings'
                ? <SettingsModal
                  language={this.props.language}
                  languageCode={this.props.languageCode}
                  soundsVolumePercent={this.props.soundsVolumePercent}
                  setLanguageCode={this.props.setLanguageCode}
                  setSoundsVolumePercent={this.props.setSoundsVolumePercent}
                />
                : null
              }

              <MenuModal
                isOpen={!!this.props.isOpen}
                view={this.state.view}
                language={this.props.language}
                onClickContinue={() => this.onClickContinue()}
                onClickOpenSettings={() => this.onClickOpenSettings()}
                onClickBackFromSettings={() => this.onClickBackFromSettings()}
              />
            </div>
          </div>
          : null
        }

        {this.props.isOpen
          ? <div className='menu__footer'>
            <a className='menu__footer-link-version' target="_blank" rel="noreferrer" href='https://gitlab.com/sanek244/clickerdefense2'>v0</a>
            <a className='menu__footer-link-author' target="_blank" rel="noreferrer" href='https://vk.com/aleksandr_winner'>© winner</a>
          </div>
          : null
        }
      </div>
    );
  }
}

export default connect(
  (state: ApplicationState, ownProps: OwnProps) => {
    return {
      ...(state.menu as MenuStore.MenuState),
      ...(state.settings as SettingsStore.SettingsState),
      ...ownProps
    };
  },
  { ...MenuStore.actionCreators, ...SettingsStore.actionCreators }
)(Menu);
