import * as React from 'react';

import { App } from '../../App';
import * as MenuStore from '../../components/Menu/MenuStore';

import {Helper} from '../../helpers/Helper';

import {ImageHandler} from '../../../gameApp/ImageHandler';

import './TestPage.scss';  
import { Resources } from '../../../gameApp/resources/Resources';

class TestPage extends React.Component {
    text: string = "";

    listOfTests: { key: string, code: () => void }[] = [
        {
            key: 'Tree resource test',
            code: () => {
                const { Tree } = require('../../../gameApp/resources/Tree');
                Tree.init();

                for(var i = 0; i<7; i++){
                    Resources.AddResource(new Tree(0 + i * 250, i % 2 == 0 ? 50 : 400, i));
                }
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