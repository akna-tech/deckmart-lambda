const { getUberPrice } = require('./helper.js');

async function createUberQuote (items, destinationZip, deliveryDate, deliveryTime) {
    try {
        const { uberPrice, uberSameDay, deckmartExpressPrice, deckmartExpressSameDay } = await getUberPrice(items, destinationZip, deliveryDate, deliveryTime);
        if (uberPrice) {
            return {
                uberResult: {
                    carrier: "uber",
                    price: uberPrice,
                    sameDay: uberSameDay,
                    error: false,
                    errorMessage: null
                },
                deckmartExpressResult: {
                    carrier: "deckmartExpress",
                    price: null,
                    error: true,
                    errorMessage: "Uber price found, skipping Deckmart Express"
                }
            }
        }
        if (deckmartExpressPrice) {
            return {
                deckmartExpressResult: {
                    carrier: "deckmartExpress",
                    price: deckmartExpressPrice,
                    sameDay: deckmartExpressSameDay,
                    error: false,
                    errorMessage: null
                },
                uberResult: {
                    carrier: "uber",
                    price: null,
                    error: true,
                    errorMessage: "Unable to get Uber quote"
                }
            }
        }
    }
    catch (err) {
        console.log('Unknown Error in Uber Quote: ', err);
        return {
            uberResult: {
                carrier: "uber",
                price: null,
                error: true,
                errorMessage: "Unable to get Uber quote"
            },
            deckmartExpressResult: {
                carrier: "deckmartExpress",
                price: null,
                error: true,
                errorMessage: "Unable to get Deckmart Express quote"
            }
        }

    }
}

module.exports = {
    createUberQuote,
};