import * as React from 'react';
import {MouseEvent} from 'react';
import Requests from '../../../types/Requests';
import Request from '../../../types/Request';
import Products from '../../../types/Products';
import "./RequestsList.scss";

type Props = {
    requests: Requests,
    products: Products,
    theme: string,
}

type State = {
    price: string,
    index: number,
    showInfo: boolean
}

export default class RequestsList extends React.Component {
    public twitch: any;
    public props: Props;
    public state: State;
    public onPurchaseRequest: (sku: string) => (e: MouseEvent<HTMLAnchorElement>) => void;
    public onShowRequest: (price: string, index: number) => (e: MouseEvent<HTMLAnchorElement>) => void;
    public onShowRequests: () => () => void;
    public tooltip: any;


    constructor(props: Props) {
        super(props);
        // @ts-ignore
        this.twitch = window.Twitch ? window.Twitch.ext : null;
        // this.twitch.bits.setUseLoopback(true);
        this.twitch.bits.onTransactionComplete(this.transactionComplete.bind(this));
        this.onPurchaseRequest = (sku: string) => (e: MouseEvent<HTMLAnchorElement>) => this.purchaseRequest(e, sku);
        this.onShowRequest = (price: string, index: number) => (e: MouseEvent<HTMLAnchorElement>) => this.showRequest(e, price, index);
        this.onShowRequests = () => () => this.showRequests();
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

    renderRequests() {
        const {requests, products} = this.props;

        return Object.keys(products).map((price) => {
            if (requests[price]) {
                return requests[price].map((request: Request, index: number) => {
                    if (request.active) {
                        return <a key={`request-${price}-${index}`} className="collection-item" onClick={this.onShowRequest(price, index)}>
                            <div className="clearfix">
                                <div className="primary-content">{request.title}</div>
                                <div className="secondary-content">{price} bits</div>
                            </div>
                        </a>
                    }
                });
            }
        });
    }

    renderRequest() {
        const {requests, products} = this.props;

        return <div className="request">
            <div className="card horizontal">
                <div className="card-stacked">
                    <div className="card-content">
                        <a onClick={this.onShowRequests()} className="card-close"><i className="material-icons">close</i></a>
                        <span className="card-title">{requests[this.state.price][this.state.index].title}</span>
                        <div className="clearfix">
                            <span className="card-sub-title">{this.state.price} bits</span>
                        </div>
                        <p>{requests[this.state.price][this.state.index].description}</p>
                    </div>
                    <div className="card-action">
                        <a className="waves-effect waves-light btn" onClick={this.onPurchaseRequest(products[this.state.price][this.state.index].sku)}>Request</a>
                        <a className="show-bits-balance right" onClick={this.twitch.bits.showBitsBalance}>Show bits balance</a>
                    </div>
                </div>
            </div>
        </div>
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
            }
        });
    }

    purchaseRequest(e: MouseEvent<HTMLAnchorElement>, sku: string) {
        this.twitch.bits.useBits(sku);
    }

    transactionComplete() {
        this.showRequests();
    }

    render() {
        const {theme, requests} = this.props;

        let count = 0;
        Object.keys(requests).map((price) => {
            if (requests[price]) {
                requests[price].map((request) => {
                    if (request.active) {
                        count++;
                    }
                })
            }
        });

        return (
            <div className="requests-list">
                <div className={theme === 'light' ? 'requests-list-light' : 'requests-list-dark'}>
                    <div className={`collection with-header ${this.state.showInfo ? '' : ''}`}>
                        <div className="collection-header">
                            Stream Requests
                            <i className="material-icons right tooltipped" data-name="bottom" data-tooltip="Stream request is a new way to interact with the streamer. It allows viewers to exchange bits for requests listed below.">info_outline</i>
                        </div>
                        <div className={this.state.showInfo ? 'hide' : ''}>
                            {!count && <div className="collection-item center-align no-item">The broadcaster has no active requests for now</div>}
                            {this.renderRequests()}
                        </div>
                    </div>
                    <div className={`request-container scale-transition ${this.state.showInfo ? 'scale-in' : 'scale-out'}`}>
                        {this.state.showInfo && this.renderRequest()}
                    </div>
                </div>
            </div>
        )
    }
}
