function getItemClass (item) {
    const { length, width, height, weight } = item;
    const volumeCubicCM = length * width * height;
    const volumeCubicFoot = volumeCubicCM / 28316.8;
    const weightPounds = weight * 2.20462;
    const density = weightPounds / volumeCubicFoot;
    switch (density) {
        case 0 < density && density <= 1:
            return '500';
        case 1 < density && density <= 2:
            return '400';
        case 2 < density && density <= 3:
            return '300';
        case 3 < density && density <= 4:
            return '250';
        case 4 < density && density <= 5:
            return '200';
        case 5 < density && density <= 6:
            return '175';
        case 6 < density && density <= 7:
            return '150';
        case 7 < density && density <= 8:
            return '125';
        case 8 < density && density <= 9:
            return '110';
        case 9 < density && density <= 10.5:
            return '100';
        case 10.5 < density && density <= 12:
            return '92.5';
        case 12 < density && density <= 13.5:
            return '85';
        case 13.5 < density && density <= 15:
            return '77.5';
        case 15 < density && density <= 22.5:
            return '70';
        case 22.5 < density && density <= 30:
            return '65';
        case 30 < density && density <= 35:
            return '60';
        case 35 < density && density <= 50:
            return '55';
        case 50 < density:
            return '50';
        default:
            throw new Error('Invalid density');
    }
}

export function formatManitoulinOrderItems (items) {
    const formattedItems = items.map(item => {
        item.item_class = getItemClass(item);
        item.weight_units = 'KG';
        item.dimension_units = 'CM';
        item.package_code = 'SKIDS';
        delete item.description;
        return item;
    })
    return formattedItems;
}

export function formatManitoulinQuoteItems (items) {
    const formattedItems = items.map(item => {
        item.class_value = getItemClass(item);
        item.weight_unit_value = 'KGS';
        item.dimension_units = 'C';
        item.package_code_value = 'SK'
        item.total_weight = item.weight;
        item.description = 'test'; // TODO - get description from item
        delete item.weight;
        return item;
    })
    return formattedItems;
}

// items example
// [
//   {
//     "height": 49,
//     "length": 32,
//     "pieces": 1,
//     "weight": 1.405,
//     "width": 48,
//     "description": "Some item description",
//   },
// ]