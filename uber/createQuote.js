const { getUberPrice } = require('./helper.js');

async function createUberQuote (items, destinationZip, deliveryDate, deliveryTime) {
    const price = await getUberPrice(items, destinationZip, deliveryDate, deliveryTime);
    return { data: { price: Number(price) }};
}

module.exports = {
    createUberQuote,
};