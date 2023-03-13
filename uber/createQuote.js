const { getUberPrice } = require('./helper.js');

async function createUberQuote (items, destinationZip, deliveryDate, deliveryTime) {
    try {
        const price = await getUberPrice(items, destinationZip, deliveryDate, deliveryTime);
        return {
            carrier: "uber",
            price: Number(price),
            error: false,
            errorMessage: "",
        }
    }
    catch (err) {
        console.log(err.message);
        return {
            carrier: "uber",
            price: null,
            error: true,
            errorMessage: "Unable to get Uber quote"
        }

    }
}

module.exports = {
    createUberQuote,
};