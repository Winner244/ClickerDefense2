import * as React from 'react';
import { connect } from 'react-redux';
import clsx from 'clsx';

import { ApplicationState } from '../../store';
import { Game } from '../../../gameApp/gameSystems/Game';
import { Gamer } from '../../../gameApp/gamer/Gamer';

import * as SettingsStore from '../../store/SettingsStore';

import s from './GameDisplay.module.scss';

import woodImg from '../../../assets/img/resources/wood/wood1.png';
import { Menu } from '../Menu/Menu';

type Props = SettingsStore.SettingsState;

type State = {
    woodCount: number;
};

class GameDisplay extends React.Component<Props, State> {

    private canvas: React.RefObject<HTMLCanvasElement>;
    private unsubscribeWoodCount?: () => void;

    constructor(props: any) {
        super(props);

        this.canvas = React.createRef();

        this.state = {
            woodCount: Gamer.woodCount.value,
        };
    }

    componentDidMount() {
        if (this.canvas.current != null) {
            this.canvas.current.oncontextmenu = () => false;
        }

        this.unsubscribeWoodCount = Gamer.woodCount.subscribe((woodCount) => {
            this.setState({ woodCount });
        });

        Game.init(this.canvas.current || new HTMLCanvasElement());

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                Game.pause();
            }
        });
    }

    componentWillUnmount() {
        this.unsubscribeWoodCount?.();
    }

    onMenuClick() {
        if (Game.isPaused) {
            Game.continue();
            Menu.hide();
        }
        else {
            Game.pause();
        }
    }

    render() {
        return <>
            <div id='topHeader' className={s.gameDisplay__header}>
                <div className={s.gameDisplay__resources}>
                    <span className={s.gameDisplay__resourceValue}>{this.state.woodCount}</span>
                    <img className={clsx(s.gameDisplay__resourceIcon, 'nodrag')} src={woodImg} alt="Wood" />
                </div>

                <button 
                    className={s.gameDisplay__menuButton} 
                    onClick={this.onMenuClick}
                >
                    {this.props.language.TopHeader.MenuButtonLabel}
                </button>
            </div>
            <canvas width="1920" height="1200" className={s.gameDisplay__canvas} ref={this.canvas}></canvas>
        </>
    }
}

export default connect(
    (state: ApplicationState) => ({ ...state.settings }),
    SettingsStore.actionCreators
)(GameDisplay);
