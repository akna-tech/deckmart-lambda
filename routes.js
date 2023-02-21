import { createOrder, createQuote } from './controller.js'

exports.order = async function (event, context) {
    const { body } = event;
    const result = await createOrder(body);
    const { error: manitoulinError } = result.manitoulinResult;
    const { error: uberError } = result.uberResult;
    const statusCode = manitoulinError && uberError ? 500 : 200;
    return {
        statusCode,
        body: JSON.stringify(result),
    };
}

exports.quote = async function (event, context) {
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