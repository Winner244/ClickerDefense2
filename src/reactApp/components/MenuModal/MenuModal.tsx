import * as React from 'react';

import { DisctionaryLanguageList } from '../../../models/common/DisctionaryLanguageList';

interface IState {
  hoverItem: number;
}

type Props = {
  isOpen: boolean;
  view: 'main' | 'settings';
  language: DisctionaryLanguageList;
  onClickContinue: () => void;
  onClickOpenSettings: () => void;
  onClickBackFromSettings: () => void;
};

export class MenuModal extends React.Component<Props, IState> {

  private readonly _onKeyBound: (event: KeyboardEvent) => void;

  constructor(props: Props) {
    super(props);

    this._onKeyBound = this.onKey.bind(this);

    this.state = {
      hoverItem: -1
    };
  }

  componentWillUpdate(nextProps: Props) {
    if (nextProps.isOpen !== this.props.isOpen || nextProps.view !== this.props.view) {
      if (this.state.hoverItem > -1) {
        this.setState({ hoverItem: -1 });
      }
    }
  }

  onKey(event: KeyboardEvent) {
    if (!this.props.isOpen) {
      return;
    }

    const menu = this.getMenuActions();

    switch (event.key) {
      case 'Enter':
        if (this.state.hoverItem >= 0 && this.state.hoverItem < menu.length) {
            console.log('HoverItem', this.state.hoverItem, menu[this.state.hoverItem].label);
          menu[this.state.hoverItem].onClick();
          this.setState({ hoverItem: -1 });
        }
        break;

      case 'ArrowUp':
        const newValue1 = this.state.hoverItem <= 0
          ? menu.length - 1
          : this.state.hoverItem - 1;

        this.setState({ hoverItem: newValue1 });
        break;

      case 'ArrowDown':
        const newValue2 = this.state.hoverItem >= menu.length - 1
          ? 0
          : this.state.hoverItem + 1;
        this.setState({ hoverItem: newValue2 });
        break;
    }
  }

  componentDidMount() {
    document.addEventListener('keydown', this._onKeyBound);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this._onKeyBound);
  }

  onMouseEnterInInsideButtons(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    const element: HTMLButtonElement = event.target as HTMLButtonElement;
    const index: number = parseInt(element.getAttribute('data-key') || '');
    this.setState({ hoverItem: index });
  }

  onMouseLeaveInsideButtons() {
    this.setState({ hoverItem: -1 });
  }

  private getMenuActions(): Array<{ label: string; onClick: () => void }> {
    if (this.props.view === 'settings') {
      return [{
        label: this.props.language.Menu.Settings.BackButtonLabel,
        onClick: () => this.props.onClickBackFromSettings(),
      }];
    }

    return [
      {
        label: this.props.language.Menu.ContinueButtonLabel,
        onClick: () => this.props.onClickContinue(),
      },
      {
        label: this.props.language.Menu.SettingsButtonLabel,
        onClick: () => this.props.onClickOpenSettings(),
      },
    ];
  }

  getItemsMenu() {
    const actions = this.getMenuActions();
    let i = 0;
    return actions.map(action => (
      <button
        key={i}
        data-key={i}
        className={"menu__button " + (this.state.hoverItem === i++ ? 'menu__button--hover' : '')}
        onClick={() => action.onClick()}
        onMouseEnter={(e) => this.onMouseEnterInInsideButtons(e)}
        onMouseLeave={() => this.onMouseLeaveInsideButtons()}
      >
        {action.label}
      </button>
    ));
  }

  render() {
    return (
      <div>
        {this.getItemsMenu()}
      </div>
    );
  }
}
