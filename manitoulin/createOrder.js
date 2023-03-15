const axios = require("axios");
const { getManitoulinAuthToken } = require('./auth.js');
const { formatManitoulinOrderItems } = require('./helper.js');

// https://www.mtdirect.ca/documents/apis/onlinePickup
async function createManitoulinOrder ({ 
  items,
  consigneeCompany, 
  consigneeContact,
  consigneeAddress,
  consigneeCity,
  consigneeProvince,
  consigneePostal,
  deliveryDate,
  deliveryTime,
}) {
  const shipper = {
    company: "DECKMART BUILDING SUPPLIES",
    contact: "Alex",
    address: "601 Garyray Dr",
    private_residence: false,
    city: "North York",
    province: "ON",
    postal: "M9L1P9",
    phone: "9058125029",
  }

  const consignee = {
    company: consigneeCompany,
    contact: consigneeContact,
    address: consigneeAddress,
    city: consigneeCity.toUpperCase(),
    province: consigneeProvince.toUpperCase(),
    postal: consigneePostal.toUpperCase(),
  }

  const deliveryTimeHours = parseInt(deliveryTime.split(':')[0]);
  const deliveryTimeMinutes = parseInt(deliveryTime.split(':')[1]);
  const deliveryTimeStamp = new Date().setHours(deliveryTimeHours, deliveryTimeMinutes);

  const openingTimeStamp = Math.round(deliveryTimeStamp / 900000) * 900000;
  const openingTimeWithSeconds = new Date(openingTimeStamp).toTimeString().split(' ')[0]
  const openingTime = openingTimeWithSeconds.split(':')[0] + ':' + openingTimeWithSeconds.split(':')[1]

  const closingTimeStamp = openingTimeStamp + 1800000;
  const closingTimeWithSeconds = new Date(closingTimeStamp).toTimeString().split(' ')[0]
  const closingTime = closingTimeWithSeconds.split(':')[0] + ':' + closingTimeWithSeconds.split(':')[1]

  const formattedItems = formatManitoulinOrderItems(items);

  const body = {
    requester: 'Shipper',
    shipper,
    consignee,
    items: formattedItems,
    description: 'test', // TODO update before release
    pickup_date: deliveryDate,
    ready_time: openingTime,
    closing_time: closingTime,
    guaranteed_service: false,
    freight_charge_party: 'Prepaid',
    confirm_pickup_receipt: false,
  }

  const token = await getManitoulinAuthToken();
  const headers = {
    Authorization: `Token ${token}`,
  };
  try {
    // TODO add stripe payment logic here
    
    const { data } = await axios.post(
      "https://www.mtdirect.ca/api/online_pickup/submit",
      body,
      { headers }
    );

    const { punum } = data;
    console.log('manitoulin order punum', punum)
    return {
      message: 'Successfully created manitoulin order',
      statusCode: 200,
    };
  } catch (err) {
    if (err.response.data && err.response.status) {
      return {
        message: err.response.data,
        statusCode: err.response.status,
      };
    }
    console.log(err.message)
    return {
      message: 'Unable to create manitoulin order',
      statusCode: 500,
    };
  }
};

module.exports = {
  createManitoulinOrder,
}

// example request body
// {
//   "body": {
//     "consigneeCompany": "Test",
//     "consigneeContact": "Test",
//     "consigneeAddress": "Test",
//     "consigneeCity": "Toronto",
//     "consigneeProvince": "ON",
//     "consigneePostal": "T2A1A1",
//     "items": [
//       {
//         "item_class": "250",
//         "pieces": 10,
//         "package_code": "argo",
//         "weight": 5,
//         "weight_units": "kg",
//         "length": 40,
//         "width": 5,
//         "height": 48,
//         "dimension_units": "CM"
//       }
//     ]
//   }
// }
