const { createOrder, createQuote, createCheckout, createPaymentIntent, handlePaymentIntentWebhook } = require('./controller.js')

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

async function checkout (event, context) {
    const body = JSON.parse(event.body);
    console.log('Body is: ', body);
    const result = await createCheckout(body);
    const { error: uberError } = result.uberResult;
    const statusCode = manitoulinError && uberError ? 500 : 200;
    console.log('Result is: ', result);
    return {
        statusCode,
        body: JSON.stringify(result),
    };
}

async function paymentIntent (event, context) {
    const body = JSON.parse(event.body);
    console.log('Body is: ', body);
    const result = await createPaymentIntent(body);
    const { error } = result;
    const statusCode = error ? 500 : 200;
    console.log('Result is: ', result);
    return {
        statusCode,
        body: JSON.stringify(result),
    };
}

async function paymentIntentWebhook (event, context) {
    const body = JSON.parse(event.body);
    console.log('Body is: ', body);
    const event = event.body;
    const result = await handlePaymentIntentWebhook(body);
    const { error } = result;
    const statusCode = error ? 500 : 200;
    console.log('Result is: ', result);
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
}
