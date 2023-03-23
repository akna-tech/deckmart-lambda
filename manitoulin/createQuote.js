const axios = require("axios");
const { getManitoulinAuthToken } = require('./auth.js');
const { formatManitoulinQuoteItems } = require('./helper.js');

const errorResponse = {
  quoteNotFound: "Could not find rate quote",
  wrongAddress: "The Destination city or province/state cannot be found in our system. Please clear the page and attempt your search by city or postal/zip first. If you still encounter difficulty, please call 1-800-265-1485 for assistance with your rate quote.",
}

async function createManitoulinQuote({ destinationCity, destinationProvince, destinationZip, items }) {
  // https://www.mtdirect.ca/documents/apis/onlineQuoting
  try {
    const contact = {
      name: "Alex",
      company: "DECKMART BUILDING SUPPLIES",
      contact_method: "P",
      contact_method_value: 9058125029,
      shipment_type: "ROAD",
      shipment_terms: "PPD",
    }

    const origin = {
      city: "NORTH YORK",
      province: "ON",
      postal_zip: "M9L1P9",
      residential_pickup: false,
      tailgate_pickup: false,
      flat_deck_pickup: false,
      inside_pickup: false,
      drop_off_at_terminal: false,
      warehouse_pickup: true,
    }
    const destination = {
      city: destinationCity.toUpperCase(),
      province: destinationProvince.toUpperCase(),
      postal_zip: destinationZip.toUpperCase(),
      residential_delivery: false,
      tailgate_delivery: true,
      flat_deck_delivery: false,
      inside_delivery: false,
      dock_pickup: false,
    }

    const formattedItems = formatManitoulinQuoteItems(items)
    const bodyParameters = {
      contact,
      origin,
      destination,
      items: formattedItems,
    }

    const token = await getManitoulinAuthToken()
    const headers = {
      'Authorization': `Token ${token}` 
    }

    const result = await axios.post(
      "https://www.mtdirect.ca/api/online_quoting/quote",
      bodyParameters,
      { headers }
    );
    const { data } = result
    const { id, timestamp, quote, total_charge } = data
    return {
      carrier: "manitoulin",
      price: Number(total_charge).toFixed(2),
      error: false,
      errorMessage: "",
    }
  }
  catch (err) {
    if (err.response?.data) {
      console.log('Error Manitoulin Quote: ', JSON.stringify(err.response.data))
    }
    else {
      console.log('Unknown Manitoulin quote error: ', err.message)
    }

    let errorMessage;
    if (err.response?.data[0] === errorResponse.quoteNotFound) 
      errorMessage = 'Could not find rate quote'
    else if (err.response.data[0] === errorResponse.wrongAddress) 
      errorMessage = 'Invalid address'
    else 
      errorMessage = 'Unable to get Manitoulin quote'

    return {
      carrier: "manitoulin",
      price: null,
      error: true,
      errorMessage,
    }
  }
};

module.exports = {
  createManitoulinQuote
}

// example request body
// {
//   "body": {
//     "destinationCity": "TOLEDO",
//     "destinationProvince": "ON",
//     "destinationZip": "K0E1Y0",
//     "items": [
//       {
//         "class_value": "70",
//         "pieces": 1,
//         "package_code_value": "BX",
//         "description": "Buckles CB 8L & CC Strap 86 Ultrafl",
//         "total_weight": 1405,
//         "weight_unit_value": "LBS",
//         "length": 32,
//         "width": 48,
//         "height": 49,
//         "unit_value": "I"
//       },
//       {
//         "class_value": "70",
//         "pieces": 1,
//         "package_code_value": "BX",
//         "description": "CC Strap 86 Ultraflex",
//         "total_weight": 1330,
//         "weight_unit_value": "LBS",
//         "length": 32,
//         "width": 48,
//         "height": 79,
//         "unit_value": "I"
//       }
//     ]
//   }
// }