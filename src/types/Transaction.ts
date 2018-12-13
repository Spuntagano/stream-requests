import Product from './Product';

type transaction = {
    displayName: string,
    initiator: string,
    product: Product,
    transactionId: string,
    transactionReceipt?: string,
    topic?: string,
    expires?: string,
    data?: {
        product: Product,
        time: string,
        transactionId: string,
        userId: string,
    },
    userId: string
}

export default transaction;