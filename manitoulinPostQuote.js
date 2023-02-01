const axios = require('axios')
const { manitoulin_username, manitoulin_password } = process.env

const errorResponse = {
  quoteNotFound: "Could not find rate quote",
  wrongAddress: "The Destination city or province/state cannot be found in our system. Please clear the page and attempt your search by city or postal/zip first. If you still encounter difficulty, please call 1-800-265-1485 for assistance with your rate quote.",
}

async function getAuthToken() {
  const body = {
    username: manitoulin_username,
    password: manitoulin_password,
    company: "MANITOULIN",
  };
  try {
    const result = await axios({
      method: "post",
      url: "https://www.mtdirect.ca/api/users/auth",
      data: body,
    });
    const { token } = result.data;
    return token;
  } catch (error) {
    console.log("error getting auth", JSON.stringify(error));
  }
}

exports.postQouting = async function(event, context) {
  // https://www.mtdirect.ca/documents/apis/onlineQuoting
  const { destinationCity, destinationProvince, destinationZip, items } = event.body
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

  const body = {
    contact,
    origin,
    destination,
    items,
  }

  const token = await getAuthToken()
  const headers = {
    'Authorization': `Token ${token}` 
  }

  try {
    const { data } = await axios.post(
      "https://www.mtdirect.ca/api/online_quoting/quote",
      body,
      { headers }
    );
    const { id, timestamp, quote, total_charge } = data
    return {
      statusCode: 200,
      body: { 
        id,
        gen_date: timestamp,
        quote_num: quote,
        total_charge,
      },
    };
  }
  catch (err) {
    if (err.response.data && err.response.status) {
      if (err.response.data === errorResponse.quoteNotFound) {
        return {
          body: 'Could not find rate quote',
          statusCode: 204,
        };
      }
      if (err.response.data === errorResponse.wrongAddress) {
        return {
          body: 'Invalid address',
          statusCode: 406,
        };
      }
      return {
        body: err.response.data,
        statusCode: err.response.status,
      };
    }
    console.log(err.message)
    return {
      body: "internal error",
      statusCode: 500,
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