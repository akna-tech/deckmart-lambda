const axios = require('axios')
const { manitoulin_username, manitoulin_password } = process.env

async function getAuthToken () {
  const body = {
    "username": manitoulin_username,
    "password": manitoulin_password,
    "company": "MANITOULIN"
  }
  console.log(body)
  try {
    const { token } = await axios({
      method: 'post',
      url: 'https://www.mtdirect.ca/api/users/auth',
      headers: {}, 
      data: body
    });
    return token
  }
  catch (error) {
    console.log(JSON.stringify(error))
  }
}

exports.postQouting = async function(event, context) {
  // https://www.mtdirect.ca/documents/apis/onlineQuoting
  const { destinationCity, destinationProvince, destinationZip, items } = event.body
  const contact = {
    name: "Alex",
    company: "DECKMART BUILDING SUPPLIES",
    contact_method: "P",
    contact_method_value: 19058125029,
    shipment_type: "ROAD",
    shipment_terms: "PPD",
  }

  const origin = {
    city: "North York",
    province: "ON",
    postal_zip: "M9L 1P9",
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
    const response = await axios.post('https://www.mtdirect.ca/api/online_quoting/quote', body, { headers })
    return {
      statusCode: 200,
      body: JSON.stringify(response.data)
    }
  }
  catch (error) {
    console.log(JSON.stringify(error))
    return {
      statusCode: 500,
    }
  }
}
