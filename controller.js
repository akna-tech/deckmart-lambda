import { createManitoulinOrder } from './manitoulin/crateOrder.js';
import { createUberOrder } from './uber/createOrder.js';
import { createManitoulinQuote } from './manitoulin/createQuote.js';
import { createUberQuote } from './uber/createQuote.js';

export async function createOrder(body) {
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
    }
    catch (err) {
        console.log(err.message);
        manitoulinResult = {
            error: {
                message: 'Unable to create manitoulin order',
                statusCode: 500,
            }
        };
    }
    try {
        uberResult = await createUberOrder({items});
    }
    catch (err) {
        console.log(err.message);
        uberResult = {
            error: {
                message: 'Unable to create uber order',
                statusCode: 500,
            }
        };
    }
    return {
        manitoulinResult,
        uberResult,
    }  
}

export async function createQuote(body) {
    const { destinationCity, destinationProvince, destinationZip, items }  = body;
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
        console.log(err.message);
        manitoulinResult = {
            error: {
                message: 'Unable to create manitoulin quote',
                statusCode: 500,
            }
        };
    }
    try {
        uberResult = await createUberQuote(items);
    }
    catch (err) {
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
