const { getPriceListByPostalCode, isDeliveryTimeAcceptable } = require('./helper.js');

async function createUberQuote (items, destinationZip, deliveryDate, deliveryTime) {
    const zip3Letter = destinationZip.slice(0, 3);
    const postalCodeToPriceMap = await getPriceListByPostalCode(zip3Letter);
    const itemTotalWeight = items.reduce((acc, item) => acc + item.weight * item.pieces, 0);

    const itemTotalWeightInLbs = itemTotalWeight * 2.20462;
    const itemMaxLenghtInCm = items.reduce((acc, item) => Math.max(acc, item.length), 0);
    const itemMaxWidthInCm = items.reduce((acc, item) => Math.max(acc, item.width), 0);
    const itemMaxHeightInCm = items.reduce((acc, item) => Math.max(acc, item.height), 0);
    const itemMaxLenghtInFoot = itemMaxLenghtInCm * 0.0328084;
    const itemMaxWidthInFoot = itemMaxWidthInCm * 0.0328084;
    const itemMaxHeightInFoot = itemMaxHeightInCm * 0.0328084;

    let allowedServicePrice;
    switch (true) {
        case itemTotalWeightInLbs <= 30 && itemMaxLenghtInFoot <= 3 && itemMaxWidthInFoot <= 2 && itemMaxHeightInFoot <= 2 && isDeliveryTimeAcceptable(deliveryDate, deliveryTime, '15:00:00'):
            allowedServicePrice= postalCodeToPriceMap.uberPrice;
            break;
        case itemTotalWeightInLbs <= 250 && itemMaxLenghtInFoot <= 16 && itemMaxWidthInFoot <= 4 && itemMaxHeightInFoot <= 2 && isDeliveryTimeAcceptable(deliveryDate, deliveryTime, '11:00:00'):
            allowedServicePrice= postalCodeToPriceMap.toolBx250Price;
            break;
        case itemTotalWeightInLbs <= 1250 && itemMaxLenghtInFoot <= 16 && itemMaxWidthInFoot <= 4 && itemMaxHeightInFoot <= 2 && isDeliveryTimeAcceptable(deliveryDate, deliveryTime, '11:00:00'):
            allowedServicePrice= postalCodeToPriceMap.toolBx1250Price;
            break;
        case itemTotalWeightInLbs <= 3250 && itemMaxLenghtInFoot <= 16 && itemMaxWidthInFoot <= 4 && itemMaxHeightInFoot <= 2 && isDeliveryTimeAcceptable(deliveryDate, deliveryTime, '11:00:00'):
            allowedServicePrice= postalCodeToPriceMap.toolBx3250Price;
            break;
        case itemTotalWeightInLbs <= 250 && itemMaxLenghtInFoot <= 20 && itemMaxWidthInFoot <= 4 && itemMaxHeightInFoot <= 2 && isDeliveryTimeAcceptable(deliveryDate, deliveryTime, '00:00:00'):
            allowedServicePrice= postalCodeToPriceMap.toolBx250LargePrice;
            break;
        case itemTotalWeightInLbs <= 1250 && itemMaxLenghtInFoot <= 20 && itemMaxWidthInFoot <= 4 && itemMaxHeightInFoot <= 2 && isDeliveryTimeAcceptable(deliveryDate, deliveryTime, '00:00:00'):
            allowedServicePrice= postalCodeToPriceMap.toolBx1250LargePrice;
            break;
        case itemTotalWeightInLbs <= 3250 && itemMaxLenghtInFoot <= 20 && itemMaxWidthInFoot <= 4 && itemMaxHeightInFoot <= 2 && isDeliveryTimeAcceptable(deliveryDate, deliveryTime, '00:00:00'):
            allowedServicePrice= postalCodeToPriceMap.toolBx3250LargePrice;
            break;
        default:
            throw new Error('Invalid order');
    }
    console.log('returning: ', allowedServicePrice)
    return { data: {price: allowedServicePrice }};
}

module.exports = {
    createUberQuote,
};