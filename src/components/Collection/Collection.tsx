import * as React from 'react';
import CollectionHeader from './CollectionHeader/CollectionHeader';
import './Collection.scss';

type Props = {
    title: string,
    children: JSX.Element|Array<JSX.Element>|Array<void>,
    tooltip?: string,
    className?: string
}

export default class Collection extends React.Component {
    public props: Props;

    constructor(props: Props) {
        super(props);
    }

    render() {
        const {title, tooltip, className, children} = this.props;

        return (
            <div className={`collection with-header ${className}`}>
                <CollectionHeader title={title} tooltip={tooltip} />
                {children}
            </div>
        )
    }
}
