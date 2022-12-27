const CanadaPostClient = require('canadapost-api');
const { cpUsername, cpPassword, cpCustomerNumber } = process.env
const cpClient = new CanadaPostClient(cpUsername, cpPassword, cpCustomerNumber);

exports.getRates =  async function(event, context) {
    const { 
        weight,
        length,
        width,
        height,
        originPostalCode,
        destinationPostalCode
    } = event.queryStringParameters


    // https://github.com/t3rminus/canada-post/blob/master/API.md#:~:text=getrates/default.jsf-,Arguments,-%3A
    const scenario = {
        parcelCharacteristics: {
            weight,
            dimensions: {
                length,
                width,
                height
            }
        },
        originPostalCode,
        destination: {
            domestic: {
                postalCode: destinationPostalCode
            }
        }
    }
    try {
        const response = await cpClient.getRates(scenario)
        const minPrice = response.reduce(function (acc, curr) {
            if (acc.priceDetails.due > curr.priceDetails.due) {
                return curr
            }
            else return acc
        })
        return {
            statusCode: 200,
            body: JSON.stringify({
                price: minPrice.priceDetails.due,
                serviceName: minPrice.serviceName,
                expectedDeliveryDate: minPrice.serviceStandard.expectedDeliveryDate
            })
        }
    }
    catch (error) {
        console.log(error)
        return {
            statusCode: 500,
            body: String(error.message)
        }
    }
}


exports.postOrder = async function(event, context) {
    const { 
        // https://github.com/t3rminus/canada-post/blob/master/API.md#:~:text=onestepshipping/createshipment.jsf-,Arguments,-%3A
        order
    } = event.body

    try {
        const response = await cpClient.createShipment(order)
        return {
            statusCode: 200,
            body: JSON.stringify(response)
        }
    }
    catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify(error)
        }
    }
}
