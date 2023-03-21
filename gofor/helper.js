const axios = require("axios");
const qs = require("qs");

async function getAuthToken() {
  const body = qs.stringify({
    grant_type: "password",
    username: process.env.GOFOR_USERNAME,
    password: process.env.GOFOR_PASSWORD,
  });

  var params = new URLSearchParams();
  params.append("grant_type", "password");
  params.append("username", process.env.GOFOR_USERNAME);
  params.append("password", process.env.GOFOR_PASSWORD);

  const goForTokenUrl = process.env.GOFOR_TOKEN_URL;
  const { data } = await axios({
    method: "get",
    url: goForTokenUrl,
    data: params,
    headers: {
      "content-type": "application/x-www-form-urlencoded;charset=utf-8",
    },
  });
  return data.access_token;
}

function formatDate(deliveryDate, deliveryTime) {
  try {
    // calculate if deliveryDate is today
    const today = new Date();
    const deliveryDateObj = new Date(deliveryDate);
    const isToday = deliveryDateObj.getDate() === today.getDate() &&
      deliveryDateObj.getMonth() === today.getMonth() &&
      deliveryDateObj.getFullYear() === today.getFullYear();
    
    // if deliveryDate is earlier then today, throw error
    if (today.getFullYear() > deliveryDateObj.getFullYear() ||
        (today.getFullYear() <= deliveryDateObj.getFullYear() && today.getMonth() > deliveryDateObj.getMonth()) ||
        (today.getFullYear() <= deliveryDateObj.getFullYear() && today.getMonth() <= deliveryDateObj.getMonth() && today.getDate() > deliveryDateObj.getDate())
        ) {
        throw new Error('Delivery date cannot be in the past');
    }

    // if deliveryDate is not today, set delivery window from 11am to 3pm
    if (!isToday) {
      const startDate = formatWithDateTime(deliveryDate, '11:00');
      const endDate = formatWithDateTime(deliveryDate, '15:00');
      return {
        startDate,
        endDate,
        sameDay: true,
      }
    }

    let currentDate = new Date(`${deliveryDate} ${deliveryTime}`);

    // if deliveryTime is before 12pm, set deliveryDate to tomorrow
    if (currentDate.getHours() > 11) {
      const startDate = formatWithDateTime(deliveryDate, '11:00', 1);
      const endDate = formatWithDateTime(deliveryDate, '15:00', 1);
      return {
        startDate,
        endDate,
        sameDay: false,
      }
    }
    const startDate = formatWithDateTime(deliveryDate, deliveryTime, 0, 1);
    const endDate = formatWithDateTime(deliveryDate, deliveryTime, 0, 4);
    return { startDate, endDate, sameDay: true };
  } catch (err) {
    console.log('Error in gofor formatDate function: ', err);
    throw err;
  }
}

function formatWithDateTime(deliveryDate, deliveryTime, addDays = 0, addHours = 0) {
  const dateString = new Date(`${deliveryDate} ${deliveryTime}`);
  const year = dateString.getFullYear();
  let month = dateString.getMonth() + 1;
  month = ("0" + month).slice(-2);
  let day = dateString.getDate() + addDays;
  day = ("0" + day).slice(-2);
  let hour = dateString.getHours() + addHours;
  hour = ("0" + hour).slice(-2);
  let minute = dateString.getMinutes();
  minute = ("0" + minute).slice(-2);
  return `${year}-${month}-${day} ${hour}:${minute}`;
}

function pickVehicle(items) {
  const maxItemMeasuresInCmAndKg = items.reduce((measures, item) => {
    measures.maxLength = Math.max(measures.maxLength, item.length);
    measures.maxWidth = Math.max(measures.maxWidth, item.width);
    measures.maxHeight = Math.max(measures.maxHeight, item.height);
    measures.maxWeight = Math.max(measures.maxWeight, item.weight);
    measures.totalWeight += item.weight;
    measures.totalVolume += item.length * item.width * item.height;
    return measures;
  }, {
    maxLength: 0,
    maxWidth: 0,
    maxHeight: 0,
    maxWeight: 0,
    totalWeight: 0,
    totalVolume: 0,
  });

  const maxItemMeasures = {
    maxLength: maxItemMeasuresInCmAndKg.maxLength / 30.48,
    maxWidth: maxItemMeasuresInCmAndKg.maxWidth / 30.48,
    maxHeight: maxItemMeasuresInCmAndKg.maxHeight / 30.48,
    maxWeight: maxItemMeasuresInCmAndKg.maxWeight * 2.20462,
    totalWeight: maxItemMeasuresInCmAndKg.totalWeight * 2.20462,
    totalVolume: maxItemMeasuresInCmAndKg.totalVolume / 28316.8
  };
  switch (true) {
    case maxItemMeasures.maxLength <= 3 && maxItemMeasures.maxWidth <= 3 && maxItemMeasures.maxHeight <= 2 && maxItemMeasures.maxWeight <= 50 && maxItemMeasures.totalWeight <= 250 && maxItemMeasures.totalVolume <= 3*3*2:
      return "16";
    case maxItemMeasures.maxLength <= 10 && maxItemMeasures.maxWidth <= 3.75 && maxItemMeasures.maxHeight <= 4 && maxItemMeasures.maxWeight <= 60 && maxItemMeasures.totalWeight <= 2000 && maxItemMeasures.totalVolume <= 10*3.75*4:
      return "1";
    case maxItemMeasures.maxLength <= 14 && maxItemMeasures.maxWidth <= 5 && maxItemMeasures.maxHeight <= 6 && maxItemMeasures.maxWeight <= 150 && maxItemMeasures.totalWeight <= 3500 && maxItemMeasures.totalVolume <= 14*5*6:
      return "17";
    // TODO uncomment when this is also available vehicle
    // case maxItemMeasures.maxLength <= 26 && maxItemMeasures.maxWidth <= 28 && maxItemMeasures.maxHeight <= 48 && maxItemMeasures.totalWeight <= 10000:
    //   return "34";
    default:
      throw new Error("No vehicle found");
  }
}

module.exports = {
  getAuthToken,
  formatDate,
  pickVehicle,
};
