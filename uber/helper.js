const ExcelJS = require('exceljs');

async function readPriceListData() {
    const workbook = new ExcelJS.Workbook();
    const filePath = `${__dirname}/pricelist.xlsx`;
    await workbook.xlsx.readFile(filePath);

    const worksheet = workbook.getWorksheet(1);
    const postalCodeColumn = worksheet.getColumn(1);
    const postalCodeToPriceMap = new Object();
    postalCodeColumn.eachCell((cell, rowNumber) => {
        if (rowNumber < 5) {
            return;
        }   
        const postalCode = cell.value;
        const uberPrice = worksheet.getRow(rowNumber).getCell(2).value.toFixed(2);
        const toolBx250Price = worksheet.getRow(rowNumber).getCell(3).value.toFixed(2);
        const toolBx1250Price = worksheet.getRow(rowNumber).getCell(4).value.toFixed(2);
        const toolBx3250Price = worksheet.getRow(rowNumber).getCell(5).value.toFixed(2);
        const toolBx250LargePrice = worksheet.getRow(rowNumber).getCell(6).value.toFixed(2);
        const toolBx1250LargePrice = worksheet.getRow(rowNumber).getCell(7).value.toFixed(2);
        const toolBx3250LargePrice = worksheet.getRow(rowNumber).getCell(8).value.toFixed(2);
        const price = {
            uberPrice,
            toolBx250Price,
            toolBx1250Price,
            toolBx3250Price,
            toolBx250LargePrice,
            toolBx1250LargePrice,
            toolBx3250LargePrice,
        };
        postalCodeToPriceMap[postalCode] = price
    });
    return postalCodeToPriceMap;
}

async function getPriceListByPostalCode(postalCode) {
    const postalCodeToPriceMap = await readPriceListData();
    if (!postalCodeToPriceMap[postalCode]) {
        throw new Error('Postal code not found');
    }
    return postalCodeToPriceMap[postalCode];
}

function isDeliveryTimeAcceptable(deliveryDate, deliveryTime, limitTime) {
    const today = new Date();
    const deliveryDateObj = new Date(deliveryDate);
    const isToday = today.getFullYear() === deliveryDateObj.getFullYear() && today.getMonth() === deliveryDateObj.getMonth() && today.getDate() === deliveryDateObj.getDate();
    if (isToday) {
        const deliveryTimeHours = parseInt(deliveryTime.split(':')[0]);
        const deliveryTimeMinutes = parseInt(deliveryTime.split(':')[1]);
        const deliveryTimeStamp = new Date().setHours(deliveryTimeHours, deliveryTimeMinutes);

        const limitTimeHours = parseInt(limitTime.split(':')[0]);
        const limitTimeMinutes = parseInt(limitTime.split(':')[1]);
        const limitTimeStamp = new Date().setHours(limitTimeHours, limitTimeMinutes);
        if (limitTimeStamp > deliveryTimeStamp) {
            return true
        }
        return false
    }
    if (today > deliveryDateObj) {
        throw new Error('Delivery date cannot be in the past');
    }
    return true
}

async function getUberPrice(items, destinationZip, deliveryDate, deliveryTime) {
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
    return allowedServicePrice;
}

module.exports = {
    getUberPrice
}