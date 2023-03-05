import ExcelJS from 'exceljs';

// export function validateUberItems (items) {
//     const totalWeight = items.reduce((acc, item) => acc + item.weight, 0);
//     if (totalWeight > 14) {
//         return {
//             error: {
//                 message: 'Total weight cannot exceed 14kg',
//                 statusCode: 400,
//             }
//         };
//     }
//     const maxLenghtinMeter = items.reduce((acc, item) => Math.max(acc, item.length), 0);
//     const maxLenghtinFoot = maxLenghtinMeter * 3.28084;
//     if (maxLenghtinFoot > 3) {
//         return {
//             error: {
//                 message: 'Max length cannot exceed 3 feet',
//                 statusCode: 400,
//             }
//         };
//     }
//     const maxWidthinMeter = items.reduce((acc, item) => Math.max(acc, item.width), 0);
//     const maxWidthinFoot = maxWidthinMeter * 3.28084;
//     if (maxWidthinFoot > 2) {
//         return {
//             error: {
//                 message: 'Max width cannot exceed 2 feet',
//                 statusCode: 400,
//             }
//         };
//     }
//     const maxHeightinMeter = items.reduce((acc, item) => Math.max(acc, item.height), 0);
//     const maxHeightinFoot = maxHeightinMeter * 3.28084;
//     if (maxHeightinFoot > 2) {
//         return {
//             error: {
//                 message: 'Max height cannot exceed 2 feet',
//                 statusCode: 400,
//             }
//         };
//     }
//     const totalPriceUSD = items.reduce((acc, item) => acc + item.price, 0);
//     const totalPriceCAD = totalPriceUSD * 1.3;
//     if (totalPriceCAD > 100) {
//         return {
//             error: {
//                 message: 'Total price cannot exceed $100 CAD',
//                 statusCode: 400,
//             }
//         };
//     }
//     // SUM[(L) x (W) x (H)]/MAX(L) =< 4
//     const sumOfLWH = items.reduce((acc, item) => acc + (item.length * item.width * item.height), 0);
//     if (sumOfLWH / maxLenghtinMeter > 4) {
//         return {
//             error: {
//                 message: 'Sum of (L) x (W) x (H) cannot exceed 4 times the max length',
//                 statusCode: 400,
//             }
//         };
//     }
//     return {
//         data: {
//             message: "Valid Uber order",
//         }
//     };
// }

async function readPriceListData() {
    const workbook = new ExcelJS.Workbook();
    const filePath = './Toronto_Uber_ToolBx.xlsx';
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

export async function getPriceListByPostalCode(postalCode) {
    const postalCodeToPriceMap = await readPriceListData();
    return postalCodeToPriceMap[postalCode];
}

export function isDeliveryTimeAcceptable(deliveryDate, deliveryTime, limitTime) {
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
