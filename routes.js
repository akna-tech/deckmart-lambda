import { createOrder, createQuote } from './controller.js'

async function order (event, context) {
    const { body } = event;
    const { service } = event.queryStringParameters;
    const result = await createOrder(body, service);
    if (!result) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: {
                    message: 'Unable to create order',
                    statusCode: 500,
                }
            }),
        };
    }
    const { error } = result;
    if (error) {
        return {
            statusCode: error.statusCode || 500,
            body: JSON.stringify({
                error: {
                    message: error.message || 'Unable to create order',
                }
            }),
        };
    }
    return {
        statusCode: 200,
        body: JSON.stringify(result),
    };
}

async function quote (event, context) {
    const { body } = event;
    const result = await createQuote(body);
    const { error: manitoulinError } = result.manitoulinResult;
    const { error: uberError } = result.uberResult;
    const statusCode = manitoulinError && uberError ? 500 : 200;
    return {
        statusCode,
        body: JSON.stringify(result),
    };
}

export {
    order,
    quote
}
