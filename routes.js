const { createOrder, createQuote, createCheckout, createPaymentIntent, handlePaymentIntentWebhook, getHolidays } = require('./controller.js')

async function order (event, context) {
    try {
        const body = JSON.parse(event.body);
        const { service } = event.queryStringParameters;
        const result = await createOrder(body, service.toLowerCase());
        return {
            statusCode: result.statusCode,
            body: JSON.stringify({
                message: result.message
            }),
        };
    }
    catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Unable to create order'
            }),
        };
    }
}

async function quote (event, context) {
    try {
        const body = JSON.parse(event.body);
        const result = await createQuote(body);
        return {
            statusCode: 200,
            body: JSON.stringify(result),
        };
    }
    catch (error) {
        console.log('Uncaught error in Quote route: ', error.message || 'Unknown error')
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: {
                    message: 'Internal error'
                }
            }),
        };
    }
    
}

async function checkout (event) {
    const body = JSON.parse(event.body);
    const result = await createCheckout(body);
    const { error: uberError } = result.uberResult;
    const statusCode = manitoulinError && uberError ? 500 : 200;
    return {
        statusCode,
        body: JSON.stringify(result),
    };
}

async function paymentIntent (event, context) {
    const body = JSON.parse(event.body);
    const result = await createPaymentIntent(body);
    const { error } = result;
    const statusCode = error ? 500 : 200;
    return {
        statusCode,
        body: JSON.stringify(result),
    };
}

async function paymentIntentWebhook (event) {
    const body = JSON.parse(event.body);
    const result = await createQuote(body);
    const { error } = result;
    const statusCode = error ? 500 : 200;
    return {
        statusCode,
        body: JSON.stringify(result),
    };
}

async function holiday (event) {
    const result = await getHolidays();
    const { error } = result;
    const statusCode = error ? 500 : 200;
    return {
        statusCode,
        body: JSON.stringify(result),
    };
}

module.exports = {
    order,
    quote,
    checkout,
    paymentIntent,
    paymentIntentWebhook,
    holiday,
}
