const { getUberPrice, calculateExpectedDay } = require('./helper.js');

async function createUberOrder (items, destinationZip, deliveryDate, deliveryTime) {
    try {
        console.log(0)
        const { uberPrice, uberSameDay, deckmartExpressPrice, deckmartExpressSameDay } = await getUberPrice(items, destinationZip, deliveryDate, deliveryTime);
        if (!uberPrice && !deckmartExpressPrice) {
            throw new Error('Unable to create Uber/DeckmartExpress order');
        }
        console.log(1)
        const sameDay = uberSameDay || deckmartExpressSameDay;
        const dateString = await calculateExpectedDay(deliveryDate, sameDay)
        return {
            statusCode: 200,
            message: 'Successfully created order, delivery: ' + dateString,
        }
    }
    catch (err) {
        console.log('Unknown Error in Uber Order: ', err);
        return {
            statusCode: 500,
            message: 'Unable to create Uber/DeckmartExpress order',
        }
    }
}

module.exports = {
    createUberOrder,
}