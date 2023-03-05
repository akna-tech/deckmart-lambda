const { createManitoulinOrder } = require('./manitoulin/createOrder.js');
const { createUberOrder } = require('./uber/createOrder.js');
const { createManitoulinQuote } = require('./manitoulin/createQuote.js');
const { createUberQuote } = require('./uber/createQuote.js');

async function createOrder(body, service) {
    const {
        items,
        destinationCompany, 
        contactNumber,
        destinationAddress,
        destinationCity,
        destinationProvince,
        destinationZip,
        deliveryDate,
        deliveryTime,
    } = body;

    if (service === 'manitoulin') {
        try {
            const manitoulinResult = await createManitoulinOrder({
                items,
                consigneeCompany: destinationCompany,
                consigneeContact: contactNumber,
                consigneeAddress: destinationAddress,
                consigneeCity: destinationCity,
                consigneeProvince: destinationProvince,
                consigneePostal: destinationZip,
                deliveryDate,
                deliveryTime,
            });
            return manitoulinResult;
        }
        catch (err) {
            console.log(err.message);
            return {
                data: {
                    message: 'Unable to create manitoulin order',
                },
                statusCode: 500,
            };
        }
    }
    if (service === 'uber') {
        try {
            const uberResult = await createUberOrder(items, destinationZip, deliveryDate, deliveryTime);
            return uberResult;
        }
        catch (err) {
            console.log(err.message);
            return {
                data: {
                    message: 'Unable to create uber order'
                },
                statusCode: 500
            };
        }
    }
}

async function createQuote(body) {
    const { destinationCity, destinationProvince, destinationZip, items, deliveryDate, deliveryTime }  = body;
    let manitoulinResult, uberResult;
    try {
        manitoulinResult = await createManitoulinQuote({
            destinationCity,
            destinationProvince,
            destinationZip,
            items,
        });
    }
    catch (err) {
        manitoulinResult = {
            error: {
                message: 'Unable to create manitoulin quote',
                statusCode: 500,
            }
        };
    }
    try {
        uberResult = await createUberQuote(items, destinationZip, deliveryDate, deliveryTime );
    }
    catch (err) {
        console.log(err);
        uberResult = {
            error: {
                message: 'Unable to create uber quote',
                statusCode: 500,
            }
        };
    }
    return {
        manitoulinResult,
        uberResult,
    }
}

module.exports = {
    createQuote,
    createOrder,
}