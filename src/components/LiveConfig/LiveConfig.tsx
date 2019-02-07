import * as React from 'react'
import Authentication from '../../lib/Authentication/Authentication';
import Requests from '../../types/Requests';
import Products from '../../types/Products';
import RequestReceived from '../../types/RequestReceived';
import Transaction from '../../types/Transaction';
import Settings from '../../types/Settings';
import Configs from '../../types/Configs';
import Collection from "../Collection/Collection";
import './LiveConfig.scss';
import CollectionItem from '../Collection/CollectionItem/CollectionItem';
import Toast from '../../lib/Toast/Toast';

type State = {
    requestsReceived: Array<RequestReceived>,
}

type Props = {
    requests?: Requests,
    products?: Products,
    settings?: Settings,
    configs?: Configs,
    authentication?: Authentication
};

export default class LiveConfig extends React.Component {
    public twitch: any;
    public toast: Toast;
    public state: State;
    public props: Props;

    constructor(props: Props) {
        super(props);

        // @ts-ignore
        this.twitch = window.Twitch ? window.Twitch.ext : null;
        this.toast = new Toast();
        this.state = {
            requestsReceived: [],
        };

        this.twitch.bits.onTransactionComplete(this.transactionComplete.bind(this));
    }

    componentDidMount() {
        const {authentication, configs} = this.props;

        if (this.twitch) {
            this.twitch.onAuthorized(async () => {
                try {
                    let transactionFetch: any = await authentication.makeCall(`${configs.relayURL}/transaction?limit=50`);
                    let trans = (await transactionFetch.json()).transactions;

                    this.setState(() => {
                        return {
                            requestsReceived: trans.map((transaction: any) => {
                                return {
                                    request: {
                                        title: transaction.title
                                    },
                                    transaction: {
                                        displayName: transaction.displayName,
                                        product: {
                                            cost: {
                                                amount: transaction.price,
                                                type: 'bits'
                                            }
                                        },
                                    },
                                    message: transaction.message
                                }
                            })
                        }
                    });
                } catch(e) {
                    this.toast.show({html: '<i class="material-icons">error_outline</i>Error fetching requests', classes: 'error'});
                }
            });
        }
    }

    componentWillUnmount() {
        if (this.twitch) {
            this.twitch.unlisten('broadcast');
        }
    }

    transactionComplete(transaction: Transaction) {
        const {configs, authentication} = this.props;

        setTimeout(async () => {
            try {
                let transactionFetch: any = await authentication.makeCall(`${configs.relayURL}/transaction?limit=50`);
                let trans = (await transactionFetch.json()).transactions;

                this.setState(() => {
                    return {
                        requestsReceived: trans.map((transaction: any) => {
                            return {
                                request: {
                                    title: transaction.title
                                },
                                transaction: {
                                    displayName: transaction.displayName,
                                    product: {
                                        cost: {
                                            amount: transaction.price,
                                            type: 'bits'
                                        }
                                    },
                                },
                                message: transaction.message
                            }
                        })
                    }
                });
            } catch(e) {
                this.toast.show({html: '<i class="material-icons">error_outline</i>Error fetching requests', classes: 'error'});
            }
        }, 2000);
    }

    renderCollectionItems() {
        if (!this.state.requestsReceived.length) {
            return <CollectionItem primaryContent="Incoming requests will appear here" full />
        }

        return this.state.requestsReceived.map((requestReceived, index) => {
            return <CollectionItem
                key={`collection-item-${index}`}
                primaryContent={`${requestReceived.transaction.displayName} requested ${requestReceived.request.title} ${(requestReceived.message) ? 'Message: ' + requestReceived.message: ''}`}
                secondaryContent={`${requestReceived.transaction.product.cost.amount} ${requestReceived.transaction.product.cost.type}`}
            />
        });
    }

    render() {
        return (
            <div className="live-config">
                <Collection
                    className="no-border"
                    title="Stream Requests"
                    tooltip="Keep this window open to see incoming requests"
                >
                    {this.renderCollectionItems()}
                </Collection>
            </div>
        )
    }
}
