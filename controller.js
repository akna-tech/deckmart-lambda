const { createManitoulinOrder } = require('./manitoulin/createOrder.js');
const { createUberOrder } = require('./uber/createOrder.js');
const { createManitoulinQuote } = require('./manitoulin/createQuote.js');
const { createUberQuote } = require('./uber/createQuote.js');

async function createOrder(body, service) {
    const {
        items,
        consigneeCompany, 
        consigneeContact,
        consigneeAddress,
        consigneeCity,
        consigneeProvince,
        consigneePostal,
    } = body;
    let manitoulinResult, uberResult;
    if (service === 'manitoulin') {
        try {
            manitoulinResult = await createManitoulinOrder({
                items,
                consigneeCompany,
                consigneeContact,
                consigneeAddress,
                consigneeCity,
                consigneeProvince,
                consigneePostal,
            });
            return manitoulinResult;
        }
        catch (err) {
            console.log(err.message);
            manitoulinResult = {
                error: {
                    message: 'Unable to create manitoulin order',
                    statusCode: 500,
                }
            };
            return manitoulinResult;
        }
    }
    if (service === 'uber') {
        try {
            uberResult = await createUberOrder({items});
            return uberResult;
        }
        catch (err) {
            console.log(err.message);
            uberResult = {
                error: {
                    message: 'Unable to create uber order',
                    statusCode: 500,
                }
            };
            return uberResult;
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