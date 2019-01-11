import * as React from 'react'

type Props = {
    onOpenStart: () => void,
    children: Array<JSX.Element>|JSX.Element
};

export default class Collapsible extends React.Component {
    public collapsible: HTMLElement;
    public materialize: any;
    public props: Props;

    constructor(props: Props) {
        super(props);

        // @ts-ignore
        this.materialize = M;
        this.collapsible = null;
    }

    componentDidMount() {
        this.materialize.Collapsible.init(this.collapsible, {
            onOpenStart: this.props.onOpenStart
        });
    }

    render() {
        return (
            <ul ref={el => this.collapsible = el} className="collapsible">
                {this.props.children}
            </ul>
        )
    }
}
