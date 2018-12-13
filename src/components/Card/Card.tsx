import * as React from 'react';
import Action from '../../types/Action';
import './Card.scss';

type Props = {
    title: string,
    subtitle: string,
    className: string
    onClose: () => void,
    mainAction: Action,
    secondaryAction: Action,
    children: Array<JSX.Element>
}

export default class RequestsList extends React.Component {
    public props: Props;

    constructor(props: Props) {
        super(props);
    }

    render() {
        const {title, subtitle, className, onClose, mainAction, secondaryAction, children} = this.props;

        return (
            <div className={`card horizontal ${className}`}>
                <div className="card-stacked">
                    <div className="card-content">
                        {onClose && <a onClick={onClose} className="card-close"><i className="material-icons">close</i></a>}
                        <span className="card-title">{title}</span>
                        <div className="clearfix">
                            <span className="card-sub-title">{subtitle}</span>
                        </div>
                        {children}
                    </div>
                    {(mainAction || secondaryAction) && <div className="card-action">
                        {mainAction && <a className="waves-effect waves-light btn" onClick={mainAction.onClick}>{mainAction.text}</a>}
                        {secondaryAction && <a className="secondary-action right" onClick={secondaryAction.onClick}>{secondaryAction.text}</a>}
                    </div>}
                </div>
            </div>
        )
    }
}
