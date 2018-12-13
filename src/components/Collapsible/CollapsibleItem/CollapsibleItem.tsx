import * as React from 'react'
import './CollapsibleItem.scss'

type Props = {
    title: string,
    children: Array<JSX.Element>
};

export default class Config extends React.Component {
    public props: Props;

    constructor(props: Props) {
        super(props);
    }

    render() {
        const {title, children} = this.props;

        return (
            <li>
                <div className="collapsible-header">{title}</div>
                <div className="collapsible-body">{children}</div>
            </li>
        )
    }
}
