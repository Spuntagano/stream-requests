import * as React from 'react'
import RequestReceived from '../../../types/RequestReceived';
import './RequestReceived.scss';

type Props = {
    requestsReceived: Array<RequestReceived>,
    theme: string
}

export default class RequestsReceived extends React.Component {
    public props: Props;

    constructor(props: Props) {
        super(props);
    }

    renderRequestsReceived() {
        const {requestsReceived} = this.props;

        return requestsReceived.map((requestReceived: RequestReceived, index: number) => {
            return <div key={`request-${index}`} className="collection-item">
                <div className="clearfix">
                    <div className="primary-content">{requestReceived.transaction.displayName} requested {requestReceived.request.title}</div>
                    <div className="secondary-content">{requestReceived.transaction.product.cost.amount} {requestReceived.transaction.product.cost.type}</div>
                </div>
            </div>
        });
    }

    render() {
        const {theme} = this.props;

        return (
            <div className="requests-received">
                <div className={theme === 'light' ? 'requests-received-light' : 'requests-received-dark'}>
                    <div className="collection with-header">
                        <div className="collection-header"><h4>Request received</h4></div>
                        {this.renderRequestsReceived()}
                    </div>
                </div>
            </div>
        )
    }
}
