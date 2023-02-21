export function validateUberItems (items) {
    const totalWeight = items.reduce((acc, item) => acc + item.weight, 0);
    if (totalWeight > 14) {
        return {
            error: {
                message: 'Total weight cannot exceed 14kg',
                statusCode: 400,
            }
        };
    }
    const maxLenghtinMeter = items.reduce((acc, item) => Math.max(acc, item.length), 0);
    const maxLenghtinFoot = maxLenghtinMeter * 3.28084;
    if (maxLenghtinFoot > 3) {
        return {
            error: {
                message: 'Max length cannot exceed 3 feet',
                statusCode: 400,
            }
        };
    }
    const maxWidthinMeter = items.reduce((acc, item) => Math.max(acc, item.width), 0);
    const maxWidthinFoot = maxWidthinMeter * 3.28084;
    if (maxWidthinFoot > 2) {
        return {
            error: {
                message: 'Max width cannot exceed 2 feet',
                statusCode: 400,
            }
        };
    }
    const maxHeightinMeter = items.reduce((acc, item) => Math.max(acc, item.height), 0);
    const maxHeightinFoot = maxHeightinMeter * 3.28084;
    if (maxHeightinFoot > 2) {
        return {
            error: {
                message: 'Max height cannot exceed 2 feet',
                statusCode: 400,
            }
        };
    }
    const totalPriceUSD = items.reduce((acc, item) => acc + item.price, 0);
    const totalPriceCAD = totalPriceUSD * 1.3;
    if (totalPriceCAD > 100) {
        return {
            error: {
                message: 'Total price cannot exceed $100 CAD',
                statusCode: 400,
            }
        };
    }
    // SUM[(L) x (W) x (H)]/MAX(L) =< 4
    const sumOfLWH = items.reduce((acc, item) => acc + (item.length * item.width * item.height), 0);
    if (sumOfLWH / maxLenghtinMeter > 4) {
        return {
            error: {
                message: 'Sum of (L) x (W) x (H) cannot exceed 4 times the max length',
                statusCode: 400,
            }
        };
    }
    return {
        data: {
            message: "Valid Uber order",
        }
    };
}