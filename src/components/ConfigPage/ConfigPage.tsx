import * as React from 'react'
import {ChangeEvent, MouseEvent} from 'react';
import Authentication from '../../util/Authentication/Authentication'
import Toast from '../../util/Toast/Toast';
import RequestsForm from "./RequestsForm/RequestsForm";
import Requests from '../../types/Requests';
import Products from '../../types/Products';
import Configs from '../../types/Configs';
import Notifications from '../../types/Notifications';
import Auth from '../../types/Auth';
import Context from '../../types/Context';
import RequestReceived from "../../types/RequestReceived";
import './ConfigPage.scss'

type State = {
    configured: boolean,
    authorized: boolean,
    theme: string,
    requests: Requests,
    products: Products,
    notifications: Notifications,
    configs: Configs
}

type Props = {};

export default class ConfigPage extends React.Component {
    public authentication: Authentication;
    public toast: Toast;
    public twitch: any;
    public onUpdateConfiguration: () => (e: MouseEvent<HTMLButtonElement>) => void;
    public onUpdateNotifications: (update: string) => (e: ChangeEvent<HTMLInputElement>) => void;
    public onToggleActive: (index: number, price: string) => (e: ChangeEvent<HTMLInputElement>) => void;
    public onRequestChange: (index: number, price: string, update: string) => (e: ChangeEvent<HTMLInputElement>|ChangeEvent<HTMLTextAreaElement>) => void;
    public onDeleteRequest: (index: number, price: string) => (e: MouseEvent<HTMLButtonElement>) => void;
    public onTestNotifier: () => (e: MouseEvent<HTMLButtonElement>) => void;
    public onCopyNotificationBoxUrl: () => (e: MouseEvent<HTMLAnchorElement>) => void;
    public notificationBoxUrl: HTMLInputElement;
    public state: State;

    constructor(props: Props) {
        super(props);
        this.authentication = new Authentication();
        this.toast = new Toast();

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
            configs: {
                publicKey: '',
                version: '',
                notifierURL: '',
                relayURL: ''
            }
        };

        this.notificationBoxUrl = null;

        this.onUpdateConfiguration = () => () => this.updateConfiguration();
        this.onUpdateNotifications = (update: string) => (e: ChangeEvent<HTMLInputElement>) => this.updateNotifications(e, update);
        this.onToggleActive = (index: number, price: string) => (e: ChangeEvent<HTMLInputElement>) => this.toggleActive(e, index, price);
        this.onRequestChange = (index: number, price: string, update: string) => (e: ChangeEvent<HTMLInputElement>) => this.requestChange(e, index, price, update);
        this.onDeleteRequest = (index: number, price: string) => (e: MouseEvent<HTMLButtonElement>) => this.deleteRequest(e, index, price);
        this.onTestNotifier = () => () => this.testNotifier();
        this.onCopyNotificationBoxUrl = () => () => this.copyNotificationBoxUrl();
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

            this.twitch.configuration.onChanged(() => {
                if (!this.state.configured) {
                    try {
                        let requests: Requests = (this.twitch.configuration.broadcaster && this.twitch.configuration.broadcaster.content) ? JSON.parse(this.twitch.configuration.broadcaster.content).requests : {};
                        let notifications: Notifications = (this.twitch.configuration.broadcaster && this.twitch.configuration.broadcaster.content) ? JSON.parse(this.twitch.configuration.broadcaster.content).notifications : {};
                        let products: Products = (this.twitch.configuration.global && this.twitch.configuration.global.content) ? JSON.parse(this.twitch.configuration.global.content).products : {};
                        let configs: Configs = (this.twitch.configuration.global && this.twitch.configuration.global.content) ? JSON.parse(this.twitch.configuration.global.content).configs : {};
                        if (this.twitch.configuration.developer && this.twitch.configuration.developer.content) {
                            products = JSON.parse(this.twitch.configuration.developer.content).products;
                            configs = JSON.parse(this.twitch.configuration.developer.content).configs;
                        }

                        Object.keys(products).forEach((price) => {
                            if (!requests[price]) {
                                requests[price] = [];
                            }

                            if (requests[price].length < products[price].length) {
                                requests[price].push({title: '', description: '', active: false})
                            }
                        });

                        Object.keys(this.state.notifications).forEach((key: string) => {
                            if (typeof notifications[key] === 'undefined') {
                                notifications[key] = this.state.notifications[key];
                            }
                        });

                        this.setState(() => {
                            return {
                                configured: true,
                                requests,
                                products,
                                notifications,
                                configs
                            }
                        });
                    } catch (e) {
                        this.toast.show({html: '<i class="material-icons">error_outline</i>Invalid configuration', classes: 'error'});
                    }
                }
            });

            this.twitch.onError(() => {
                this.toast.show({html: '<i class="material-icons">error_outline</i>An error has occurred :(', classes: 'error'});
            });

            this.twitch.onContext((context: Context, delta: Array<string>) => {
                this.contextUpdate(context, delta)
            });
        }
    }

    componentWillUnmount() {
        if (this.twitch) {
            this.twitch.unlisten('broadcast');
        }
    }

    requestChange(e: ChangeEvent<HTMLInputElement>, index: number, price: string, update: string) {
        const value = e.target.value;
        this.setState((prevState: State) => {
            let newRequests: Requests = Object.assign({}, prevState.requests);
            if (newRequests[price][newRequests[price].length-1][update].length && prevState.requests[price].length < prevState.products[price].length) {
                newRequests[price].push({title: '', description: '', active: false});
            }

            if (!newRequests[price][index].description.length && !newRequests[price][index].title.length && value.length) {
                newRequests[price][index].active = true;
            }

            if (update === 'title' && !newRequests[price][index].description.length && !value.length) {
                newRequests[price][index].active = false;
            }

            if (update === 'description' && !newRequests[price][index].title.length && !value.length) {
                newRequests[price][index].active = false;
            }

            newRequests[price][index][update] = value;
            return {requests: newRequests};
        });
    }

    updateConfiguration() {
        let requests: Requests = {};
        Object.keys(this.state.requests).forEach((price) => {
            requests[price] = this.state.requests[price].filter((request) => {
                return !!(request.title.length || request.description.length);
            });
        });

        let configuration = {requests, notifications: this.state.notifications};
        this.authentication.makeCall(`${this.state.configs.relayURL}/sign`, 'POST', configuration).then((res: any) => {
            this.twitch.configuration.set('broadcaster', this.state.configs.version, JSON.stringify(configuration));
            res.json().then((body: any) => {
                this.twitch.send('broadcast', 'JWT', body.token);

                this.toast.show({html: '<i class="material-icons">done</i>Configurations saved!', classes: 'success'});
            });
        }).catch(() => {
            this.toast.show({html: '<i class="material-icons">done</i>Error saving configurations!', classes: 'error'});
        });
    }

    updateNotifications(e: ChangeEvent<HTMLInputElement>, update: string) {
        let target = e.target;
        this.setState((prevState: State) => {
            let newNotifications: Notifications = Object.assign({}, prevState.notifications);
            newNotifications[update] = target.checked;

            return {notifications: newNotifications};
        });
    }

    deleteRequest(e: MouseEvent<HTMLButtonElement>, index: number, price: string) {
        this.setState((prevState: State) => {
            let newRequests: Requests = Object.assign({}, prevState.requests);

            if (newRequests[price].length-1 === index) {
                newRequests[price][index] = {title: '', description: '', active: false};
            } else {
                newRequests[price].splice(index, 1);
            }

            return {requests: newRequests};
        });
    }

    testNotifier() {
        let requestReceived: RequestReceived = {
            request: {
                title: 'test request',
                description: 'request description',
                active: true
            },
            transaction: {
                displayName: "bits user",
                initiator: "other",
                product: {
                    displayName: "test SKU",
                    sku: "test1000-1",
                    cost: {
                        amount: 1000,
                        type: "bits"
                    },
                },
                transactionID: String(Math.random()),
                userId: "0",
            },
            notifications: this.state.notifications,
            version: this.state.configs.version
        };

        this.authentication.makeCall(`${this.state.configs.relayURL}/notify`, 'POST', {
            requestReceived,
        }).then(() => {
            this.toast.show({html: '<i class="material-icons">done</i>Notification sent', classes: 'success'});
        }).catch(() => {
            this.toast.show({html: '<i class="material-icons">error_outline</i>Error sending notification!', classes: 'error'});
        });
    }

    copyNotificationBoxUrl() {
        this.notificationBoxUrl.select();
        document.execCommand("copy");

        this.toast.show({html: '<i class="material-icons">done</i>Notification URL copied!', classes: 'success'});
    }

    toggleActive(e: ChangeEvent<HTMLInputElement>, index: number, price: string) {
        let target = e.target;
        this.setState((prevState: State) => {
            let newRequests: Requests = Object.assign({}, prevState.requests);
            newRequests[price][index].active = target.checked;
            return {requests: newRequests};
        });
    }

    render() {
        if (this.state.configured && this.state.authorized) {
            return (
                <div className="config-page">
                    <div className={this.state.theme === 'dark' ? 'dark-theme' : ''}>
                        <h2>Requests settings</h2>
                        <RequestsForm
                            requests={this.state.requests}
                            products={this.state.products}
                            onRequestChange={this.onRequestChange}
                            onDeleteRequest={this.onDeleteRequest}
                            onToggleActive={this.onToggleActive}
                        />

                        <h2>Notifications settings</h2>
                        <div className="notification-box">
                            <div className="input-field notification-box-url">
                                <input ref={(el) => this.notificationBoxUrl = el} readOnly id="notification-box-url" type="text" value={`${this.state.configs.notifierURL}/#/${this.authentication.getChannelId()}`} />
                                <label className="active" htmlFor="notification-box-url">Notification box URL (Add as browser source in OBS)</label>
                            </div>

                            <a className="copy-notification-box-url" onClick={this.onCopyNotificationBoxUrl()}><i className="material-icons">insert_link</i> Copy link</a>
                            <button className="btn waves-effect waves-light" onClick={this.onTestNotifier()}>Test notification</button>
                        </div>

                        <div className="notifications">
                            <div className="clearfix">
                                <div className="left label">Show image</div>
                                <div className="switch left">
                                    <label>
                                        Off
                                        <input type="checkbox" checked={this.state.notifications.showImage} onChange={this.onUpdateNotifications('showImage')} />
                                        <span className="lever" />
                                        On
                                    </label>
                                </div>
                            </div>

                            <div className="clearfix">
                                <div className="left label">Play sound</div>
                                <div className="switch left">
                                    <label>
                                        Off
                                        <input type="checkbox" checked={this.state.notifications.playSound} onChange={this.onUpdateNotifications('playSound')} />
                                        <span className="lever" />
                                        On
                                    </label>
                                </div>
                            </div>

                            <div className="clearfix">
                                <div className="left label">Send to chat</div>
                                <div className="switch left">
                                    <label>
                                        Off
                                        <input type="checkbox" checked={this.state.notifications.sendChat} onChange={this.onUpdateNotifications('sendChat')} />
                                        <span className="lever" />
                                        On
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div>
                            <button className="btn waves-effect waves-light" onClick={this.onUpdateConfiguration()}>Save settings</button>
                        </div>
                    </div>
                </div>
            )
        } else {
            return (
                <div className="loading">
                    <div className="loading-sign">
                        <div className="preloader-wrapper big active">
                            <div className="spinner-layer spinner-blue-only">
                                <div className="circle-clipper left">
                                    <div className="circle" />
                                </div>
                                <div className="gap-patch">
                                    <div className="circle" />
                                </div>
                                <div className="circle-clipper right">
                                    <div className="circle" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )
        }
    }
}
