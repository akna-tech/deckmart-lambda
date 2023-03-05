const { createOrder, createQuote } = require('./controller.js')

async function order (event, context) {
    try {
        const body = JSON.parse(event.body);
        const { service } = event.queryStringParameters;
        const result = await createOrder(body, service.toLowerCase());
        return {
            statusCode: result.statusCode,
            body: JSON.stringify(result.data),
        };
    }
    catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: {
                    message: 'Unable to create order'
                }
            }),
        };
    }
}

async function quote (event, context) {
    const body = JSON.parse(event.body);
    const result = await createQuote(body);
    const { error: manitoulinError } = result.manitoulinResult;
    const { error: uberError } = result.uberResult;
    const statusCode = manitoulinError && uberError ? 500 : 200;
    return {
        statusCode,
        body: JSON.stringify(result),
    };
}

module.exports = {
    order,
    quote
}
