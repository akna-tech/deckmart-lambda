const axios = require("axios");
import { getManitoulinAuthToken } from './auth.js';
import { formatManitoulinOrderItems } from './helper.js';

// https://www.mtdirect.ca/documents/apis/onlinePickup
export async function createManitoulinOrder ({ 
  items,
  consigneeCompany, 
  consigneeContact,
  consigneeAddress,
  consigneeCity,
  consigneeProvince,
  consigneePostal,
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

  // pickup date is 1 day after now in the format YYYY-MM-DD
  const pickupDate = new Date();
  pickupDate.setDate(pickupDate.getDate() + 1);
  const pickupDateFormatted = pickupDate.toISOString().split("T")[0];
  const readyTime = '10:00';
  const closingTime = '17:00';

  const fomrattedItems = formatManitoulinOrderItems(items);

  const body = {
    requester: 'Shipper',
    shipper,
    consignee,
    items: fomrattedItems,
    description: 'test', // TODO update before release
    pickup_date: pickupDateFormatted, // TODO check date and time logic
    ready_time: readyTime,
    closing_time: closingTime,
    guaranteed_service: true,
    guaranteed_option: 'By noon',
    special_delivery_instruction: 'this is a test!!!',
    freight_charge_party: 'Prepaid',
    confirm_pickup_receipt: false,
  }

  const token = await getManitoulinAuthToken();
  const headers = {
    Authorization: `Token ${token}`,
  };
  try {
    const { data } = await axios.post(
      "https://www.mtdirect.ca/api/online_pickup/submit",
      body,
      { headers }
    );

    const { punum } = data;
    return {
      data: {
        punum,
        pickup_date: pickupDateFormatted,
        closingTime,
        readyTime
      }
    };
  } catch (err) {
    if (err.response.data && err.response.status) {
      return {
        error: {
          message: err.response.data,
          statusCode: err.response.status,
        }    
      };
    }
    console.log(err.message)
    return {
      error: {
        message: 'Unable to create manitoulin order',
        statusCode: 500,
      }    
    };
  }
};

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
