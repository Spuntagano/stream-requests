import * as React from 'react'
import {ChangeEvent} from 'react';

type Props = {
    checked: boolean,
    label: string,
    onChange: (e: ChangeEvent<HTMLInputElement>) => void
    className?: string,
}

export default class Switch extends React.Component {
    public props: Props;

    constructor(props: Props) {
        super(props);
    }

    render() {
        const {checked, label, className, onChange} = this.props;

        return (
            <div className={`clearfix ${className}`}>
                <div className="left label">{label}</div>
                <div className="switch left">
                    <label>
                        Off
                        <input type="checkbox" checked={checked} onChange={onChange} />
                        <span className="lever" />
                        On
                    </label>
                </div>
            </div>
        )
    }
}
