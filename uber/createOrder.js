const { getUberPrice } = require('./helper.js');


async function createUberOrder (items, destinationZip, deliveryDate, deliveryTime) {
    try {
        const { uberPrice, uberSameDay, deckmartExpressPrice, deckmartExpressSameDay } = await getUberPrice(items, destinationZip, deliveryDate, deliveryTime);
        if (!uberPrice && !deckmartExpressPrice) {
            throw new Error('Unable to create Uber/DeckmartExpress order');
        }
        const dateString = uberSameDay || deckmartExpressSameDay ? 'Same Day' : 'Next Day';
        return {
            statusCode: 200,
            message: 'Successfully created order, delivery: ' + dateString,
        }
    }
    catch (err) {
        console.log(err);
        return {
            statusCode: 500,
            message: 'Unable to create Uber/DeckmartExpress order',
        }
    }
}

module.exports = {
    createUberOrder,
}