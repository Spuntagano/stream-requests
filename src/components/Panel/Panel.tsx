import * as React from 'react';
import {MouseEvent} from 'react';
import Requests from '../../types/Requests';
import Products from '../../types/Products';
import Collection from '../Collection/Collection';
import Card from '../Card/Card';
import Configs from '../../types/Configs';
import Settings from '../../types/Settings';
import Transaction from '../../types/Transaction';
import Authentication from '../../lib/Authentication/Authentication';
import {ChangeEvent} from 'react';
import Textarea from '../Textarea/Textarea';
import CollectionItem from '../Collection/CollectionItem/CollectionItem';
import './Panel.scss';

type Props = {
    requests?: Requests,
    products?: Products,
    settings?: Settings,
    configs?: Configs,
    authentication?: Authentication
}

type State = {
    price: string,
    index: number,
    showInfo: boolean,
    message: string
}

export default class Panel extends React.Component {
    public twitch: any;
    public props: Props;
    public state: State;
    public onPurchaseRequest: (sku: string) => (e: MouseEvent<HTMLAnchorElement>) => void;
    public onShowRequest: (price: string, index: number) => (e: MouseEvent<HTMLAnchorElement>) => void;
    public onShowRequests: () => () => void;
    public onMessageChange: () => (e: ChangeEvent<HTMLTextAreaElement>) => void;

    constructor(props: Props) {
        super(props);
        // @ts-ignore
        this.twitch = window.Twitch ? window.Twitch.ext : null;
        this.twitch.bits.onTransactionComplete(this.transactionComplete.bind(this));
        this.onPurchaseRequest = (sku: string) => (e: MouseEvent<HTMLAnchorElement>) => this.purchaseRequest(e, sku);
        this.onShowRequest = (price: string, index: number) => (e: MouseEvent<HTMLAnchorElement>) => this.showRequest(e, price, index);
        this.onShowRequests = () => () => this.showRequests();
        this.onMessageChange = () => (e: ChangeEvent<HTMLTextAreaElement>) => this.messageChange(e);

        this.state = {
            price: null,
            index: null,
            showInfo: false,
            message: ''
        }
    }

    showRequest(e: MouseEvent<HTMLAnchorElement>, price: string, index: number) {
        this.setState(() => {
            return {
                showInfo: true,
                price,
                index,
            }
        });
    }

    showRequests() {
        this.setState(() => {
            return {
                showInfo: false,
                message: ''
            }
        });
    }

    purchaseRequest(e: MouseEvent<HTMLAnchorElement>, sku: string) {
        this.twitch.bits.useBits(sku);
    }

    transactionComplete(transaction: Transaction) {
        const {authentication, configs} = this.props;
        const message = this.state.message;

        setTimeout(() => {
            authentication.makeCall(`${configs.relayURL}/pubsub`, 'POST', {
                transactionId: transaction.transactionId,
                message
            });
        }, 2000);

        this.showRequests();
    }

    messageChange(e: ChangeEvent<HTMLTextAreaElement>) {
        const value = e.target.value;

        this.setState(() => {
            return {message: value};
        });
    }

    renderCollectionItems() {
        const {requests, products} = this.props;

        let count = 0;
        Object.keys(products).forEach((price) => {
            if (requests[price]) {
                requests[price].forEach((request) => {
                    if (request.active) {
                        count++;
                    }
                });
            }
        });

        if (!count) {
            return <CollectionItem primaryContent="The broadcaster has no active requests for now" full />
        }

        const items: Array<JSX.Element> = [];
        Object.keys(products).forEach((price) => {
            if (requests[price]) {
                requests[price].forEach((request, index) => {
                    if (request.active) {
                        items.push(<CollectionItem
                            key={`collection-item-${price}-${index}`}
                            className="ellipsis"
                            primaryContent={request.title}
                            secondaryContent={`${price} bits`}
                            onClick={this.onShowRequest(price, index)}
                            ellipsis
                        />)
                    }
                })
            }
        });

        return items;
    }

    render() {
        const {requests, products} = this.props;

        return (
            <div className="panel">
                <Collection
                    title="Stream Requests"
                    tooltip="Stream request is a new way to interact with the streamer. It allows viewers to exchange bits for requests listed below."
                    className="no-border"
                >
                    {this.renderCollectionItems()}
                </Collection>
                <div className={`request-container scale-transition ${this.state.showInfo ? 'scale-in' : 'scale-out'}`}>
                    {this.state.showInfo && <Card
                      title={requests[this.state.price][this.state.index].title}
                      subtitle={`${this.state.price} bits`}
                      className="fullscreen"
                      onClose={this.onShowRequests()}
                      mainAction={{
                          text: 'Request',
                          onClick: this.onPurchaseRequest(products[this.state.price][this.state.index].sku)
                      }}
                      secondaryAction={{
                          text: 'Show bits balance',
                          onClick: this.twitch.bits.showBitsBalance
                      }}>
                        <p className="description">{requests[this.state.price][this.state.index].description}</p>
                        <Textarea value={this.state.message} label="Message" id="request-message" onChange={this.onMessageChange()} />
                    </Card>}
                </div>
            </div>
        )
    }
}
