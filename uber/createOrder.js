const { getUberPrice } = require('./helper.js');


async function createUberOrder (items, destinationZip, deliveryDate, deliveryTime) {
    const price = await getUberPrice(items, destinationZip, deliveryDate, deliveryTime);
    if (!price) {
        throw new Error('Unable to create Uber order');
    }
    const itemTotalPrice = items.reduce((total, item) => {
        return total + item.price * item.pieces;
    }, 0);
    const totalPrice = itemTotalPrice + price.uberPrice;
    // TODO add stripe payment logic here
    return {
        data: {
            message: 'Successfully created Uber order',
        }
    }
}

module.exports = {
    createUberOrder,
}