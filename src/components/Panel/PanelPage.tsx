import * as React from 'react'
import Authentication from '../../util/Authentication/Authentication'
import RequestsList from './RequestsList/RequestsList';
import Requests from '../../types/Requests';
import Products from '../../types/Products';
import Auth from '../../types/Auth';
import Context from '../../types/Context';
import Toast from '../../util/Toast/Toast';
import Configs from '../../types/Configs';
import * as jwt from "jsonwebtoken";
import './PanelPage.scss';

type State = {
    configured: boolean,
    authorized: boolean,
    theme: string,
    isVisible: boolean,
    requests: Requests,
    products: Products,
    configs: Configs
}

type Props = {};

export default class PanelPage extends React.Component {
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
        this.toast = new Toast();
        this.state = {
            configured: false,
            authorized: false,
            theme: 'light',
            isVisible: true,
            requests: {},
            products: {},
            configs: {
                publicKey: '',
                version: '',
                notifierURL: '',
                relayURL: ''
            }
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
        if (this.twitch) {
            this.twitch.onAuthorized((auth: Auth) => {
                console.log(auth.token);
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
                                    requests: token.requests
                                }
                            });
                        });
                    } catch (e) {
                        throw new Error(e.message);
                    }
                }
            });

            this.twitch.configuration.onChanged(() => {
                if (!this.state.configured) {
                    try {
                        let requests: Requests = (this.twitch.configuration.broadcaster.content) ? JSON.parse(this.twitch.configuration.broadcaster.content).requests : {};
                        let products: Products = (this.twitch.configuration.global.content) ? JSON.parse(this.twitch.configuration.global.content).products : {};
                        let configs: Configs = (this.twitch.configuration.global.content) ? JSON.parse(this.twitch.configuration.global.content).configs : {};
                        if (this.twitch.configuration.developer.content) {
                            products = (this.twitch.configuration.developer.content) ? JSON.parse(this.twitch.configuration.developer.content).products : {};
                            configs = (this.twitch.configuration.global.content) ? JSON.parse(this.twitch.configuration.global.content).configs : {};
                        }

                        this.setState(() => {
                            return {
                                configured: true,
                                requests,
                                products,
                                configs
                            }
                        });
                    } catch (e) {
                        throw new Error('Invalid configurations');
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
        if (this.state.configured && this.state.authorized && this.state.isVisible) {
            return (
                <div className="panel">
                    <div className={this.state.theme === 'dark' ? 'dark-theme' : ''}>
                        <div className="background" />
                        <RequestsList theme={this.state.theme} requests={this.state.requests} products={this.state.products}/>
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
