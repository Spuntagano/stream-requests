import * as React from 'react';
import {MouseEvent} from "react";
import './CollectionItem.scss'

type Props = {
    primaryContent: string,
    secondaryContent?: string,
    className?: string,
    onClick?: (e: MouseEvent<HTMLAnchorElement>) => void
    ellipsis?: boolean
    full?: boolean
}

export default class CollectionItem extends React.Component {
    public props: Props;

    constructor(props: Props) {
        super(props);
    }

    render() {
        const {primaryContent, secondaryContent, className, onClick, ellipsis, full} = this.props;

        return (
            <a className={`collection-item ${className} ${(onClick) ? 'clickable' : ''}`} onClick={onClick}>
                <div className="clearfix">
                    <div className={`primary-content ${(ellipsis) ? 'ellipsis' : ''} ${(full) ? 'full' : ''}`}>{primaryContent}</div>
                    <div className="secondary-content">{secondaryContent}</div>
                </div>
            </a>
        )
    }
}
