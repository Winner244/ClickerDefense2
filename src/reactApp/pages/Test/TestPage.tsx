import * as React from 'react';

import { App } from '../../App';
import * as MenuStore from '../../components/Menu/MenuStore';

import {Helper} from '../../helpers/Helper';

import {ImageHandler} from '../../../gameApp/ImageHandler';
import {Resources} from '../../../gameApp/resources/Resources';

import {Menu} from '../../components/Menu/Menu';
import {Game} from '../../../gameApp/gameSystems/Game';

import './TestPage.scss';  

class TestPage extends React.Component {
    text: string = "";

    listOfTests: { key: string, code: () => void }[] = [
        {
            key: 'Tree resource test',
            code: () => {
                const { Tree } = require('../../../gameApp/resources/mined/Tree');
                Tree.init();

                Resources.AddResource(new Tree(0, 50, 0));
                Resources.AddResource(new Tree(200, 550, 1));
                Resources.AddResource(new Tree(500, 50, 2));
                Resources.AddResource(new Tree(700, 450, 3));
                Resources.AddResource(new Tree(900, 50, 4));
                Resources.AddResource(new Tree(1200, 350, 5));
                Resources.AddResource(new Tree(1400, 50, 6));

                Menu.hide();
                Game.continue();
            }
        },
        
        {
            key: 'Wood',
            code: () => {
                const { Wood } = require('../../../gameApp/resources/collected/Wood');
                Wood.init();

                Resources.AddResource(new Wood(200, 200, 0));
            }
        }
    ];

    waitLoadingImage(imageHandler: ImageHandler, callback: Function){
        setTimeout(() => {
            if(imageHandler.isImagesCompleted){
                callback();
            }
            else{
                this.waitLoadingImage(imageHandler, callback);
            }
        }, 100);
    }

    getSelectedTestNumber(): number {
        return +(Helper.getUrlQuery()['variant'] || Helper.getUrlQuery()['v']);
    }

    interval:NodeJS.Timeout|null = null;
    componentWillUnmount(){
        if(this.interval){
            clearInterval(this.interval);
        }
    }

    componentDidMount(){
        //pre load sounds/images
        const variant = this.getSelectedTestNumber();
        if(variant > 0){
            var test = this.listOfTests[variant - 1];
            if(test){
                this.text = test.key;
                test.code();
            }
        }

        if(!this.text){
            App.Store.dispatch(MenuStore.actionCreators.close());
        }

        this.forceUpdate();
    }

    public render() {
        const variant = this.getSelectedTestNumber();

        if(this.text){
            return <div className='test-page'>
                <div className='test-page__name-test noselect'>{this.text}</div>
                <a className='test-page__button-prev noselect' href={'/test.html?v=' + (variant - 1)}>Prev test</a>
                <a className='test-page__button-all noselect' href={'/test.html'}>all</a>
                <a className='test-page__button-next noselect' href={'/test.html?v=' + (variant + 1)}>Next test</a>
            </div>;
        }

        return <div className='test-page'>
            <div className='test-page__list'>
                <div className='test-page__header-list-tests'>Список тестов:</div>
                {this.listOfTests.map((test, i) => {
                    return <div key={i}><a className='test-page__link-test' href={'/test.html?v=' + (i + 1)}>{test.key}</a></div>
                })}
            </div>
        </div>;
    }
}

export default TestPage;