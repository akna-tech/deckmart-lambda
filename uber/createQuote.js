import { getPriceListByPostalCode, isDeliveryTimeAcceptable } from './helper.js';

export async function createUberQuote (items, destinationZip, deliveryDate, deliveryTime) {
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



    const allowedServicePrices = [];
    switch (true) {
        case itemTotalWeightInLbs <= 30 && itemMaxLenghtInFoot <= 3 && itemMaxWidthInFoot <= 2 && itemMaxHeightInFoot <= 2 && isDeliveryTimeAcceptable(deliveryDate, deliveryTime, '15:00:00'):
            allowedServicePrices.push(postalCodeToPriceMap.uberPrice);
        case itemTotalWeightInLbs <= 250 && itemMaxLenghtInFoot <= 16 && itemMaxWidthInFoot <= 4 && itemMaxHeightInFoot <= 2 && isDeliveryTimeAcceptable(deliveryDate, deliveryTime, '11:00:00'):
            allowedServicePrices.push(postalCodeToPriceMap.toolBx250Price);
        case itemTotalWeightInLbs <= 1250 && itemMaxLenghtInFoot <= 16 && itemMaxWidthInFoot <= 4 && itemMaxHeightInFoot <= 2 && isDeliveryTimeAcceptable(deliveryDate, deliveryTime, '11:00:00'):
            allowedServicePrices.push(postalCodeToPriceMap.toolBx1250Price);
        case itemTotalWeightInLbs <= 3250 && itemMaxLenghtInFoot <= 16 && itemMaxWidthInFoot <= 4 && itemMaxHeightInFoot <= 2 && isDeliveryTimeAcceptable(deliveryDate, deliveryTime, '11:00:00'):
            allowedServicePrices.push(postalCodeToPriceMap.toolBx3250Price);
        case itemTotalWeightInLbs <= 250 && itemMaxLenghtInFoot <= 20 && itemMaxWidthInFoot <= 4 && itemMaxHeightInFoot <= 2 && !isToday && isDeliveryTimeAcceptable(deliveryDate, deliveryTime, '00:00:00'):
            allowedServicePrices.push(postalCodeToPriceMap.toolBx250LargePrice);
        case itemTotalWeightInLbs <= 1250 && itemMaxLenghtInFoot <= 20 && itemMaxWidthInFoot <= 4 && itemMaxHeightInFoot <= 2 && !isToday && isDeliveryTimeAcceptable(deliveryDate, deliveryTime, '00:00:00'):
            allowedServicePrices.push(postalCodeToPriceMap.toolBx1250LargePrice);
        case itemTotalWeightInLbs <= 3250 && itemMaxLenghtInFoot <= 20 && itemMaxWidthInFoot <= 4 && itemMaxHeightInFoot <= 2 && !isToday && isDeliveryTimeAcceptable(deliveryDate, deliveryTime, '00:00:00'):
            allowedServicePrices.push(postalCodeToPriceMap.toolBx3250LargePrice);
            break;
        default:
            throw new Error('Invalid order');
    }



    const minPrice = Math.min(...allowedServicePrices);
    return { data: {price: minPrice }};
}
