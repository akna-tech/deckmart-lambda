import { createUberOrder } from './createOrder.js';

export async function createUberOrder (items) {
    const { error, data } = validateUberItems(items);
    if (error) {
        return error;
    }
    return {
        data: {
            price: 40,
            message: 'Valid Uber items'
        }
    };
}