import * as React from 'react';
import './CollectionHeader.scss';

type Props = {
    title: string,
    tooltip: string
}

export default class CollectionHeader extends React.Component {
    public props: Props;
    public tooltip: any;

    constructor(props: Props) {
        super(props);

        // @ts-ignore
        this.tooltip = M.Tooltip;

        this.state = {
            price: null,
            index: null,
            showInfo: false
        }
    }

    componentDidMount() {
        this.tooltip.init(document.querySelectorAll('.tooltipped'));
    }

    render() {
        const {title, tooltip} = this.props;

        return (
            <div className="collection-header">
                <div>{title}</div>
                {tooltip && <i className="material-icons right tooltipped" data-name="bottom" data-tooltip={tooltip}>info_outline</i>}
            </div>
        )
    }
}
