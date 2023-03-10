const { createOrder, createQuote, createCheckout,  } = require('./controller.js')

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
    try {
        const result = await createQuote(body);
        return {
            statusCode: 200,
            body: JSON.stringify(result),
        };
    }
    catch (error) {
        console.log('Error in quote route: ', error.message || 'Unknown error')
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

async function paymentIntent (event) {
    const body = JSON.parse(event.body);
    console.log('Body is: ', body);
    const result = await createQuote(body);
    const { error } = result;
    const statusCode = error ? 500 : 200;
    console.log('Result is: ', result);
    return {
        statusCode,
        body: JSON.stringify(result),
    };
}

async function paymentIntentWebhook (event) {
    const body = JSON.parse(event.body);
    console.log('Body is: ', body);
    const result = await createQuote(body);
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
