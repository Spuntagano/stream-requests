type Product = {
    sku: string,
    displayName?: string,
    cost?: {
        amount?: number,
        type?: string,
    },
    inDevelopment?: boolean
}

export default Product;