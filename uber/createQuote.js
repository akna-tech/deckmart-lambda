import { validateUberItems } from './helper.js';

export async function createUberQuote(items) {
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