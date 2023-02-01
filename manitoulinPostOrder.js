const axios = require("axios");
const { manitoulin_username, manitoulin_password } = process.env;

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

exports.postOrder = async function (event, context) {
  // https://www.mtdirect.ca/documents/apis/onlinePickup
  const { 
    items,
    consigneeCompany, 
    consigneeContact,
    consigneeAddress,
    consigneeCity,
    consigneeProvince,
    consigneePostal,
  } = event.body

  const shipper = {
    company: "DECKMART BUILDING SUPPLIES",
    contact: "Alex",
    address: "601 Garyray Dr",
    private_residence: false, // ???
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

  const body = {
    requester: 'Shipper',
    shipper,
    consignee,
    items,
    description: 'test order',
    pickup_date: pickupDateFormatted, // ???
    ready_time: '10:00', // ???
    closing_time: '17:00', // ???
    guaranteed_service: true, // ???
    guaranteed_option: 'By noon', // ??? or 4pm
    special_delivery_instruction: 'this is a test!!!',
    freight_charge_party: 'Prepaid',
    confirm_pickup_receipt: false, // ???
  }

  const token = await getAuthToken();
  const headers = {
    Authorization: `Token ${token}`,
  };
  try {
    const { data } = await axios.post(
      "https://www.mtdirect.ca/api/online_pickup/submit",
      body,
      { headers }
    );
    const { puNumber, pickup_date, ready_time, closing_time } = data;
    return {
      statusCode: 200,
      body: {
        puNumber,
        pickup_date,
        ready_time,
        closing_time
      },
    };
  } catch (err) {
    if (err.response.data && err.response.status) {
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
