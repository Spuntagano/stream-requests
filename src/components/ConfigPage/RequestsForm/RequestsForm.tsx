import * as React from 'react'
import {ChangeEvent, MouseEvent} from 'react';
import Requests from '../../../types/Requests';
import Request from '../../../types/Request';
import Products from '../../../types/Products';
import './RequestsForm.scss';

type Props = {
    requests: Requests,
    products: Products,
    onRequestChange: (index: number, price: string, update: string) => (e: ChangeEvent<HTMLInputElement>|ChangeEvent<HTMLTextAreaElement>) => void;
    onDeleteRequest: (index: number, price: string) => (e: MouseEvent<HTMLButtonElement>) => void;
}

export default class RequestsForm extends React.Component {
    public props: Props;
    public collapsible: HTMLElement;
    public materialize: any;

    constructor(props: Props) {
        super(props);

        this.collapsible = null;
        // @ts-ignore
        this.materialize = M;
    }

    componentDidMount() {
        this.materialize.Collapsible.init(this.collapsible, {
            onOpenStart: () => {
                document.querySelectorAll('.materialize-textarea').forEach((el: HTMLElement) => {
                    this.materialize.textareaAutoResize(el);
                });
            }
        });
    }

    renderRequestsFormGroup() {
        const { requests, products } = this.props;

        return Object.keys(products).map((price: string) => {
            let counter = 0;
            requests[price].forEach((request) => {
                if (request.title || request.description) {
                    counter++;
                }
            });

            return <li key={`request-form-group-${price}`}>
                <div className="collapsible-header">{price} bits requests ({counter} / {products[price].length})</div>
                <div className="collapsible-body">{this.renderRequestsForm(price)}</div>
            </li>
        });
    }

    renderRequestsForm(price: string) {
        const {requests, onRequestChange, onDeleteRequest} = this.props;

        return requests[price].map((request: Request, index: number) => {
            return <div key={`request-form-${price}-${index}`} className="clearfix">
                <div className="input-container request-form left">
                    <div className="input-field">
                        <input id={`request-form-title-${price}-${index}`} type="text" value={request.title} onChange={onRequestChange(index, price, 'title')}/>
                        <label className="active" htmlFor={`request-form-title-${price}-${index}`}>Title</label>
                    </div>
                    <div className="input-field">
                        <textarea id={`request-form-description-${price}-${index}`} className="materialize-textarea" value={request.description} onChange={onRequestChange(index, price, 'description')}/>
                        <label className="active" htmlFor={`request-form-description-${price}-${index}`}>Description</label>
                    </div>
                </div>
                <button disabled={requests[price].length-1 === index && !request.title.length && !request.description.length} className="btn waves-effect waves-light delete-request btn-floating left" onClick={onDeleteRequest(index, price)}>
                    <i className="material-icons">close</i>
                </button>
            </div>;
        });
    }

    render() {
        return (
            <div className="requests-form">
                <ul ref={el => this.collapsible = el} className="collapsible">
                    {this.renderRequestsFormGroup()}
                </ul>
            </div>
        )
    }
}
