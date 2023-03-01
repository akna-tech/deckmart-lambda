import axios from "axios";
import { getManitoulinAuthToken } from './auth.js';
import { formatManitoulinQuoteItems } from './helper.js';

const errorResponse = {
  quoteNotFound: "Could not find rate quote",
  wrongAddress: "The Destination city or province/state cannot be found in our system. Please clear the page and attempt your search by city or postal/zip first. If you still encounter difficulty, please call 1-800-265-1485 for assistance with your rate quote.",
}

export async function createManitoulinQuote({ destinationCity, destinationProvince, destinationZip, items }) {
  // https://www.mtdirect.ca/documents/apis/onlineQuoting
  const contact = {
    name: "Alex",
    company: "DECKMART BUILDING SUPPLIES",
    contact_method: "P",
    contact_method_value: 9058125029,
    shipment_type: "ROAD",
    shipment_terms: "PPD",
  }

  const origin = {
    city: "North York",
    province: "ON",
    postal_zip: "M9L1P9",
    residential_pickup: false,
    tailgate_pickup: true,
    flat_deck_pickup: true,
    inside_pickup: true,
    drop_off_at_terminal: false,
    warehouse_pickup: false,
  }

  const destination = {
    city: destinationCity.toUpperCase(),
    province: destinationProvince.toUpperCase(),
    postal_zip: destinationZip.toUpperCase(),
    residential_pickup: true,
    tailgate_pickup: true,
    flat_deck_pickup: false,
    inside_delivery: false,
    dock_pickup: false,
  }

  const formattedItems = formatManitoulinQuoteItems(items)
  const body = {
    contact,
    origin,
    destination,
    items: formattedItems,
  }

  const token = await getManitoulinAuthToken()
  const headers = {
    'Authorization': `Token ${token}` 
  }

  try {
    const result = await axios.post(
      "https://www.mtdirect.ca/api/online_quoting/quote",
      body,
      { headers }
    );
    const { data } = result
    const { id, timestamp, quote, total_charge } = data
    return {
      data: { 
        id,
        gen_date: timestamp,
        quote_num: quote,
        total_charge,
      },
    };
  }
  catch (err) {
    console.log(JSON.stringify(err))
    if (err.response.data && err.response.status) {
      if (err.response.data === errorResponse.quoteNotFound) {
        return {
          error: {
            message: 'Could not find rate quote',
            statusCode: 204,
          }
        };
      }
      if (err.response.data === errorResponse.wrongAddress) {
        return {
          error: {
            message: 'Invalid address',
            statusCode: 406,
          }
        };
      }
    }
    console.log(err.message)
    return {
      error: {
        message: 'Unable to get Manitoulin quote',
        statusCode: 500,
      }
    };
  }
};

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