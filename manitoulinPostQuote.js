const axios = require('axios')
const { manitoulin_username, manitoulin_password } = process.env

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
    city: destinationCity,
    province: destinationProvince,
    postal_zip: destinationZip,
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
    const response = await axios.post(
      "https://www.mtdirect.ca/api/online_quoting/quote",
      body,
      { headers }
    );
    return {
      statusCode: 200,
      body: { total: responsedata.total_charge },
    };
  }
  catch (err) {
    if (err.response.data && err.response.status) {
      if (err.response.data === 'Could not find rate quote') {
        return {
          body: 'Could not find rate quote',
          statusCode: 204,
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
//     "destinationCity": "CALGARY",
//     "destinationProvince": "AB",
//     "destinationZip": "T2A1A1",
//     "items": [
//       {
//         "class_value": "50",
//         "pieces": "10",
//         "package_code_value": "PL",
//         "description": "Pallettes",
//         "total_weight": "35",
//         "weight_unit_value": "LBS",
//         "length": 40,
//         "width": 48,
//         "height": 3,
//         "unit_value": "I"
//       }
//     ]
//   }
// }