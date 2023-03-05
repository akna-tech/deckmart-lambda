async function createUberOrder (items) {
    if (error) {
        return error;
    }
    return {
        data: {
            price: 40,
            message: 'Valid Uber items'
        }
    };
}

module.exports = {
    createUberOrder,
}