import Request from './Request';
import Settings from './Settings';
import Transaction from './Transaction';

type RequestReceived = {
    request: Request,
    settings: Settings,
    transaction: Transaction,
    message: string
}

export default RequestReceived;