import * as React from 'react';
import { connect } from 'react-redux';

import { ApplicationState } from '../../store';
import * as MenuStore from './MenuStore';

import {App} from '../../App';

import {Mouse} from '../../../gameApp/gamer/Mouse';
import {Keypad} from '../../../gameApp/gamer/Keypad';

import {Game} from '../../../gameApp/gameSystems/Game';
import {AudioSystem} from '../../../gameApp/gameSystems/AudioSystem';

import './Menu.scss';

import offSoundsImage from '../../../assets/img/menu/off-sounds.png'; 
import onSoundsImage from '../../../assets/img/menu/on-sounds.png'; 

import SelectingSoundUrl from '../../../assets/sounds/menu/selecting.mp3'; 
import SoundTurnOnSoundUrl from '../../../assets/sounds/menu/soundTurnOn.mp3'; 

interface IState {
  hoverItem: number;
}

interface Prop {
  isOpen?: boolean
}

type Props =
  MenuStore.MenuState
  & MenuStore.MenuAction
  & Prop;

export class Menu extends React.Component<Props, IState> {

  constructor(props: Props) {
    super(props);

    this.state = { 
      hoverItem: -1
    };
  }

  static loadSelectSound(){
    AudioSystem.load(SelectingSoundUrl);
  }

  static show(): void{
    Menu.playSoundSelect();
    App.Store.dispatch(MenuStore.actionCreators.open());
  }

  static hide(): void{
    Menu.playSoundSelect();
    Game.isBlockMouseLogic = false;
    App.Store.dispatch(MenuStore.actionCreators.close());
  }

  private static playSoundSelect(){
    AudioSystem.play(Keypad.isEnter ? -1 : Mouse.x, SelectingSoundUrl, -15);
  }

  componentWillUpdate(nextProps : Props, nextState : IState){
    if(nextProps.isOpen !== this.props.isOpen && this.state.hoverItem > -1){
      this.setState({ hoverItem: -1 });
    }
  }

  onKey(event: KeyboardEvent){
    if(!this.props.isOpen){
      return;
    }

    const menu = this.getItemsMenu();

    switch (event.key){
      case 'Enter':
        if(this.state.hoverItem >= 0 && this.state.hoverItem < menu.length){
          const hoverItemMenu = menu[this.state.hoverItem];
          hoverItemMenu.props.onClick();
          this.setState({ hoverItem: -1 });
        }
        break;

      case 'ArrowUp':
        const newValue1 =  this.state.hoverItem <= 0 
          ? menu.length - 1 
          : this.state.hoverItem - 1;

        this.setState({ hoverItem: newValue1 });
        break;

      case 'ArrowDown':
        const newValue2 =  this.state.hoverItem >= menu.length - 1
          ? 0  
          : this.state.hoverItem + 1;
        this.setState({ hoverItem: newValue2 });
        break;
    }
  }

  componentDidMount() {
    document.addEventListener('keydown', this.onKey.bind(this));
    document.addEventListener('visibilitychange', this.onVisibilityChange.bind(this));
  } 
  
  componentWillUnmount() {
    document.removeEventListener('keydown', this.onKey.bind(this));
    document.removeEventListener('visibilitychange', this.onVisibilityChange.bind(this));
  }

  onVisibilityChange(){
    this.forceUpdate();
  }

  onClickContinue(){
    Menu.playSoundSelect();
    this.props.close();
    Game.continue();
  }

  onMouseEnterInInsideButtons(event: React.MouseEvent<HTMLButtonElement, MouseEvent>){
    const element: HTMLButtonElement = event.target as HTMLButtonElement;
    const index: number = parseInt(element.getAttribute('data-key') || '');
    this.setState({ hoverItem: index });
  }
  onMouseLeaveInsideButtons(event: React.MouseEvent<HTMLButtonElement, MouseEvent>){
    this.setState({ hoverItem: -1 });
  }

  onClickSound(){
    AudioSystem.isEnabled = !AudioSystem.isEnabled;
    this.forceUpdate();

    if(AudioSystem.isEnabled){
      AudioSystem.play(-1, SoundTurnOnSoundUrl, 0.2);
    }
  }

  getItemsMenu(){
    let i = 0;
    const itemsMenu = [];

    itemsMenu.push((
      <button 
        key={i} 
        data-key={i} 
        className={"menu__button " + (this.state.hoverItem === i++ ? 'menu__button--hover' : '')} 
        onClick={() => this.onClickContinue()} 
        onMouseEnter={(e) => this.onMouseEnterInInsideButtons(e)}
        onMouseLeave={(e) => this.onMouseLeaveInsideButtons(e)}
      >
        Продолжить
      </button>
    ));

    return itemsMenu;
  }

  render() {
    return (
      <div>
        {this.props.isOpen
          ? <div className="menu noselect">
              <div className="menu__body">
                  <div className="menu__title">Меню</div>
                  <div className="menu__close" onClick={() => this.onClickContinue()}>
                      <div className="menu__close-body">x</div>
                  </div>

                  {this.getItemsMenu()}
              </div>
            </div>
          : null
        }

        {this.props.isOpen
          ? <button 
                className={"menu__button-sound-off noselect " + (AudioSystem.isEnabled ? 'menu__button-sound-off--on' : 'menu__button-sound-off--off')} 
                onClick={() => this.onClickSound()}
            >
                {AudioSystem.isEnabled 
                ? <img className='nodrag' src={onSoundsImage} alt='turn on sounds' />
                : <img className='nodrag' src={offSoundsImage} alt='turn off sounds' />
                }
            </button>
          : null
        }


        {this.props.isOpen
          ? <div className='menu__footer'>
              <a className='menu__footer-link-version' target="_blank" rel="noreferrer" href='https://gitlab.com/sanek244/clickerdefense2'>v0</a>
              <a className='menu__footer-link-author' target="_blank" rel="noreferrer" href='https://vk.com/aleksandr_winner'>© winner</a>
            </div>
          : null
        }
      </div>);
  }
}
	
// Wire up the React component to the Redux store
export default connect(
  (state: ApplicationState, ownProps: Prop) => {
      return { ...state.menu, ...ownProps };
  },
  MenuStore.actionCreators
)(Menu);
