import Request from './Request';
import Notifications from './Notifications';
import Transaction from './Transaction';

type RequestReceived = {
    request: Request,
    notifications: Notifications,
    transaction: Transaction,
    version: string
}

export default RequestReceived;