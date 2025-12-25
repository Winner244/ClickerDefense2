import * as React from 'react';
import { connect } from 'react-redux';

import { ApplicationState } from '../../store';
import { Game } from '../../../gameApp/gameSystems/Game';

import * as SettingsStore from '../../store/SettingsStore';

import s from './GameDisplay.module.scss';

type Props = SettingsStore.SettingsState;

class GameDisplay extends React.Component<Props> {

    private canvas: React.RefObject<HTMLCanvasElement>;

    constructor(props: any) {
        super(props);

        this.canvas = React.createRef();
    }

    componentDidMount() {
        if (this.canvas.current != null) {
            this.canvas.current.oncontextmenu = () => false;
        }

        Game.init(this.canvas.current || new HTMLCanvasElement());

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                Game.pause();
            }
        });
    }

    onMenuClick() {
        if (Game.isPaused) {
            Game.continue();
        }
        else {
            Game.pause();
        }
    }

    render() {
        return <>
            <div id='topHeader' className={s.gameDisplay__header}>
                <div>
                    <span></span>
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
