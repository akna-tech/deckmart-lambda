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
        const deliveryTimeSeconds = parseInt(deliveryTime.split(':')[2]);
        const deliveryTimeStamp = new Date().setHours(deliveryTimeHours, deliveryTimeMinutes, deliveryTimeSeconds);

        const limitTimeHours = parseInt(limitTime.split(':')[0]);
        const limitTimeMinutes = parseInt(limitTime.split(':')[1]);
        const limitTimeSeconds = parseInt(limitTime.split(':')[2]);
        const limitTimeStamp = new Date().setHours(limitTimeHours, limitTimeMinutes, limitTimeSeconds);
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

module.exports = {
    getPriceListByPostalCode,
    isDeliveryTimeAcceptable,
}