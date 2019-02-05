import * as React from 'react'
import Authentication from '../lib/Authentication/Authentication'
import Requests from '../types/Requests';
import Products from '../types/Products';
import Settings from '../types/Settings';
import Auth from '../types/Auth';
import Context from '../types/Context';
import Toast from '../lib/Toast/Toast';
import Configs from '../types/Configs';
import Loading from './Loading/Loading';
import {ReactElement} from 'react';
import configs from '../../configs';

type State = {
    configured: boolean,
    theme: string,
    isVisible: boolean,
    requests: Requests,
    products: Products,
    settings: Settings,
    configs: Configs
}

export default class App extends React.Component {
    public authentication: Authentication;
    public twitch: any;
    public state: State;
    public toast: Toast;

    constructor(props: {}) {
        super(props);
        this.authentication = new Authentication();

        const url = new URL(window.location.href);
        const state = url.searchParams.get('state') || 'released';

        // @ts-ignore
        this.twitch = window.Twitch ? window.Twitch.ext : null;
        this.toast = new Toast();
        this.state = {
            configured: false,
            theme: 'light',
            isVisible: true,
            requests: {},
            products: {},
            settings: {},
            configs: configs[state]
        }
    }

    contextUpdate(context: Context, delta: Array<string>) {
        // @ts-ignore
        if (delta.includes('theme')) {
            this.setState(() => {
                return {theme: context.theme}
            })
        }
    }

    visibilityChanged(isVisible: boolean) {
        this.setState(() => {
            return {
                isVisible
            }
        })
    }

    componentDidMount() {
        setTimeout(() => {
            location.reload();
        }, 60*60*1000);

        if (this.twitch) {
            this.twitch.onAuthorized(async (auth: Auth) => {
                try {
                    this.authentication.setToken(auth.token, auth.userId, auth.channelId, auth.clientId);

                    let promises: any = await Promise.all([
                        this.authentication.makeCall(`${this.state.configs.relayURL}/request`),
                        this.authentication.makeCall(`${this.state.configs.relayURL}/product`),
                        this.authentication.makeCall(`${this.state.configs.relayURL}/setting`)
                    ]);

                    let requests = (await promises[0].json()).requests;
                    let products = (await promises[1].json()).products;
                    let settings = (await promises[2].json()).settings;

                    let empty = true;
                    Object.keys(products).forEach((price) => {
                        requests[price] = requests[price] || [];

                        if (requests[price].length) {
                            empty = false;
                        }
                    });

                    if (empty) {
                        try {
                            requests = JSON.parse(this.twitch.configuration.broadcaster.content).requests;
                            settings.flushConfigs = true;
                        } catch (e) {
                            requests = {};
                        }
                    }

                    Object.keys(products).forEach((price) => {
                        if (!requests[price]) {
                            requests[price] = [];
                        }

                        if (requests[price].length < products[price].length) {
                            requests[price].push({title: '', description: '', active: false});
                        }
                    });

                    this.setState(() => {
                        return {
                            requests,
                            products,
                            settings,
                            configured: true
                        }
                    });
                } catch (e) {
                    this.toast.show({
                        html: '<i class="material-icons">error_outline</i>Error while fetching infos',
                        classes: 'error'
                    });
                }
            });

            this.twitch.listen('broadcast', (target: string, contentType: string, body: any) => {
                if (contentType ==='application/json') {
                    try {
                        const json = JSON.parse(body);
                        if (json.requests) {
                            this.setState(() => {
                                return {
                                    requests: json.requests,
                                    settings: json.settings
                                }
                            });
                        }
                    } catch(e) {
                        console.error('misformed json received');
                    }
                }
            });

            this.twitch.onError(() => {
                this.toast.show({html: '<i class="material-icons">error_outline</i>An error has occurred :(', classes: 'error'});
            });

            this.twitch.onVisibilityChanged((isVisible: boolean) => {
                this.visibilityChanged(isVisible)
            });

            this.twitch.onContext((context: Context, delta: Array<string>) => {
                this.contextUpdate(context, delta)
            })
        }
    }

    componentWillUnmount() {
        if (this.twitch) {
            this.twitch.unlisten('broadcast')
        }
    }

    render() {
        const children = React.Children.map(this.props.children, (child: ReactElement<any>) => {
            return React.cloneElement(child, {
                requests: this.state.requests,
                products: this.state.products,
                settings: this.state.settings,
                configs: this.state.configs,
                authentication: this.authentication
            });
        });

        return (
            <div className={`app ${(this.state.theme) === 'dark' ? 'dark-theme' : ''}`}>
                {this.state.configured && this.state.isVisible && children}
                {(!this.state.configured || !this.state.isVisible) && <Loading />}
            </div>
        )

    }
}
