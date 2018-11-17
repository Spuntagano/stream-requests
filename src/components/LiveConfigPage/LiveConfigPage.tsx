import * as React from 'react'
import * as jwt from 'jsonwebtoken';
import Authentication from '../../util/Authentication/Authentication';
import Toast from '../../util/Toast/Toast';
import Requests from '../../types/Requests';
import Products from '../../types/Products';
import Product from '../../types/Product';
import RequestReceived from '../../types/RequestReceived';
import Transaction from '../../types/Transaction';
import Auth from '../../types/Auth';
import Context from '../../types/Context';
import './LiveConfigPage.scss'
import RequestsReceived from "./RequestsReceived/RequestsReceived";
import Notifications from '../../types/Notifications';
import Configs from '../../types/Configs';

type State = {
    configured: boolean,
    authorized: boolean
    theme: string,
    requests: Requests,
    products: Products,
    notifications: Notifications,
    requestsReceived: Array<RequestReceived>,
    configs: Configs
}

type Props = {};

export default class LiveConfigPage extends React.Component {
    public authentication: Authentication;
    public twitch: any;
    public state: State;
    public toast: Toast;

    constructor(props: Props) {
        super(props);
        this.authentication = new Authentication();

        //if the extension is running on twitch or dev rig, set the shorthand here. otherwise, set to null.
        // @ts-ignore
        this.twitch = window.Twitch ? window.Twitch.ext : null;
        this.state = {
            configured: false,
            authorized: false,
            theme: 'light',
            requests: {},
            products: {},
            notifications: {
                showImage: true,
                playSound: true,
                sendChat: true
            },
            requestsReceived: [],
            configs: {
                publicKey: '',
                version: '',
                notifierURL: '',
                relayURL: ''
            }
        };

        this.toast = new Toast();
        this.twitch.bits.onTransactionComplete(this.transactionComplete.bind(this));
    }

    contextUpdate(context: Context, delta: Array<string>) {
        // @ts-ignore
        if (delta.includes('theme')) {
            this.setState(() => {
                return {theme: context.theme}
            })
        }
    }

    componentDidMount() {
        if (this.twitch) {
            this.twitch.onAuthorized((auth: Auth) => {
                this.authentication.setToken(auth.token, auth.userId, auth.channelId, auth.clientId);
                this.setState(() => {
                    return {
                        authorized: true,
                    }
                });
            });

            this.twitch.listen('broadcast', (target: string, contentType: string, body: any) => {
                if (contentType ==='JWT') {
                    try {
                        jwt.verify(body, Buffer.from(this.state.configs.publicKey, 'base64'), {algorithms: ['RS256']}, (error: any, token: any) => {
                            if (this.authentication.getChannelId() !== token.channel_id) {
                                throw new Error('Invalid channel');
                            }

                            this.setState(() => {
                                return {
                                    requests: token.requests,
                                    notifications: token.notifications
                                }
                            });
                        });
                    } catch (e) {
                        throw new Error(e.message);
                    }
                }
            });

            this.twitch.configuration.onChanged(() => {
                console.log(this.twitch);
                if (!this.state.configured) {
                    try {
                        let requests: Requests = (this.twitch.configuration.broadcaster.content) ? JSON.parse(this.twitch.configuration.broadcaster.content).requests : {};
                        let notifications: Notifications = (this.twitch.configuration.broadcaster.content) ? JSON.parse(this.twitch.configuration.broadcaster.content).notifications : {};
                        let products: Products = (this.twitch.configuration.global.content) ? JSON.parse(this.twitch.configuration.global.content).products : {};
                        let configs: Configs = (this.twitch.configuration.global.content) ? JSON.parse(this.twitch.configuration.global.content).configs : {};
                        if (this.twitch.configuration.developer.content) {
                            products = (this.twitch.configuration.developer.content) ? JSON.parse(this.twitch.configuration.developer.content).products : {};
                            configs = (this.twitch.configuration.global.content) ? JSON.parse(this.twitch.configuration.global.content).configs : {};
                        }

                        Object.keys(this.state.notifications).forEach((key: string) => {
                            if (typeof notifications[key] === 'undefined') {
                                notifications[key] = this.state.notifications[key];
                            }
                        });

                        this.setState(() => {
                            return {
                                configured: true,
                                requests,
                                notifications,
                                products,
                                configs
                            }
                        });
                    } catch (e) {
                        throw new Error('Invalid configurations');
                    }
                }
            });

            this.twitch.onContext((context: Context, delta: Array<string>) => {
                this.contextUpdate(context, delta)
            });

            this.twitch.onError(() => {
                this.toast.show({html: '<i class="material-icons">error_outline</i>An error has occurred :(', classes: 'error'});
            });
        }
    }

    componentWillUnmount() {
        if (this.twitch) {
            this.twitch.unlisten('broadcast');
        }
    }

    transactionComplete(transaction: Transaction) {
        let index = -1;
        let price = '';
        let valid = false;

        Object.keys(this.state.requests).forEach((p: string) => {
            this.state.products[p].forEach((product: Product, i: number) => {
                if (transaction.product.sku === product.sku) {
                    index = i;
                    price = p.toString();
                    valid = true;
                }
            })
        });

        if (!valid) throw('Invalid transaction');

        this.authentication.makeCall(`${this.state.configs.relayURL}/notify`, 'POST', {
            requestReceived: {
                request: this.state.requests[price][index],
                notifications: this.state.notifications,
                transaction,
                version: this.state.configs.version
            },
        });

        this.setState((prevState: State) => {
            let newRequestsReceived: Array<RequestReceived> = [...prevState.requestsReceived];
            newRequestsReceived.unshift({
                request: prevState.requests[price][index],
                notifications: this.state.notifications,
                transaction,
                version: this.state.configs.version
            });

            return {requestsReceived: newRequestsReceived};
        });
    }

    render() {
        if (this.state.configured && this.state.authorized) {
            return (
                <div className="live-config-page">
                    <div className={this.state.theme === 'dark' ? 'dark-theme' : ''}>
                        <div className="background" />
                        <RequestsReceived requestsReceived={this.state.requestsReceived} theme={this.state.theme}/>
                    </div>
                </div>
            )
        } else {
            return (
                <div className="loading">
                    Loading...
                </div>
            )
        }
    }
}
