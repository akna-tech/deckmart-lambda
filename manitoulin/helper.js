function getItemClass (item) {
    const { length, width, height, weight } = item;
    const volumeCubicCM = length * width * height;
    const volumeCubicFoot = volumeCubicCM / 28316.8;
    const weightPounds = weight * 2.20462;
    const density = weightPounds / volumeCubicFoot;

    switch (true) {
        case (0 < density && density <= 1):
            return '500';
        case (1 < density && density <= 2):
            return '400';
        case (2 < density && density <= 3):
            return '300';
        case (3 < density && density <= 4):
            return '250';
        case (4 < density && density <= 5):
            return '200';
        case (5 < density && density <= 6):
            return '175';
        case (6 < density && density <= 7):
            return '150';
        case (7 < density && density <= 8):
            return '125';
        case (8 < density && density <= 9):
            return '110';
        case (9 < density && density <= 10.5):
            return '100';
        case (10.5 < density && density <= 12):
            return '92.5';
        case (12 < density && density <= 13.5):
            return '85';
        case (13.5 < density && density <= 15):
            return '77.5';
        case (15 < density && density <= 22.5):
            return '70';
        case (22.5 < density && density <= 30):
            return '65';
        case (30 < density && density <= 35):
            return '60';
        case (35 < density && density <= 50):
            return '55';
        case (50 < density):
            return '50';
        default:
            throw new Error('Invalid density');
    }
}

function formatManitoulinOrderItems (items) {
    const formattedItems = items.map(item => {
        if (item.length > 304.8 || item.width > 304.8 || item.height > 304.8) {
            throw new Error('Manitoulin does not support items with dimensions greater than 10 foot');
        }
        return {
            item_class: getItemClass(item),
            weight_units: 'KG',
            dimension_units: 'CM',
            package_code: 'SKIDS',
            pieces: item.pieces,
            length: Math.round(item.length),
            width: Math.round(item.width),
            height: Math.round(item.height),
            weight: Math.round(item.weight),
        }
    })
    return formattedItems;
}

function formatManitoulinQuoteItems (items) {
    const formattedItems = items.map(item => {
        if (item.length > 304.8 || item.width > 304.8 || item.height > 304.8) {
            throw new Error('Manitoulin does not support items with dimensions greater than 10 foot');
        }
        return {
            class_value: getItemClass(item),
            pieces: item.pieces,
            package_code_value: 'SK',
            description: item.description.slice(0, 34),
            length: Math.round(item.length),
            width: Math.round(item.width),
            height: Math.round(item.height),
            total_weight: Math.round(item.weight),
            weight_unit_value: 'KGS',
            unit_value: 'C',
        }
    })
    return formattedItems;
}

module.exports = {
    formatManitoulinOrderItems,
    formatManitoulinQuoteItems,
}
