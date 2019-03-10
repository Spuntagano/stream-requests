import * as React from 'react';
import Requests from '../../types/Requests';
import Products from '../../types/Products';
import Configs from '../../types/Configs';
import Settings from '../../types/Settings';
import Authentication from '../../lib/Authentication/Authentication';
import './VideoComponent.scss';
import Panel from '../Panel/Panel';

type Props = {
    requests?: Requests,
    products?: Products,
    settings?: Settings,
    configs?: Configs,
    authentication?: Authentication
}

type State = {
    show: boolean
}

export default class VideoComponent extends React.Component {
    public props: Props;
    public state: State;
    public onShow: () => () => void;
    public onHide: () => () => void;

    constructor(props: Props) {
        super(props);

        this.state = {
            show: false
        };

        this.onShow = () => () => this.show();
        this.onHide = () => () => this.hide();
    }


    renderLogo() {
        return <img src="data:image/png;base64, iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAIAAAD/gAIDAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2ZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpBNUEyREY0QTY3MThFOTExQThCNUYwMjQ4MjZFOTNEOCIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpENjQ5RjQ0RDE4RkQxMUU5OURDMkIxRTRERUUyMzQyNSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpENjQ5RjQ0QzE4RkQxMUU5OURDMkIxRTRERUUyMzQyNSIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M2IChXaW5kb3dzKSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOkE1QTJERjRBNjcxOEU5MTFBOEI1RjAyNDgyNkU5M0Q4IiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOkE1QTJERjRBNjcxOEU5MTFBOEI1RjAyNDgyNkU5M0Q4Ii8+IDwvcmRmOkRlc2NyaXB0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" />
    }

    show() {
        this.setState({show: true});
    }

    hide() {
        this.setState({show: false});
    }

    render() {
        const {requests, products, settings, configs, authentication} = this.props;

        return (
            <div className="video-component">
                {!this.state.show && <div onClick={this.onShow()} className="logo-container">{this.renderLogo()}</div>}
                {this.state.show && <div onClick={this.onHide()} className="close">
                    <i className="material-icons">close</i>
                </div>}

                {this.state.show && <div className="panel-container">
                    <Panel requests={requests}
                        products={products}
                        settings={settings}
                        configs={configs}
                        authentication={authentication}
                        leftTooltip
                    />
                </div>}
            </div>
        )
    }
}
