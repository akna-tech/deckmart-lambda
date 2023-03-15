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
    let startDate = new Date(`${deliveryDate} ${deliveryTime}`);
    const endDateString = new Date(
      startDate.setHours(startDate.getHours() + 1)
    );
    const endYear = endDateString.getFullYear();
    let endMonth = endDateString.getMonth() + 1;
    endMonth = ("0" + endMonth).slice(-2);
    let endDay = endDateString.getDate();
    endDay = ("0" + endDay).slice(-2);
    let endHour = endDateString.getHours();
    endHour = ("0" + endHour).slice(-2);
    let endMinute = endDateString.getMinutes();
    endMinute = ("0" + endMinute).slice(-2);

    startDate = `${deliveryDate} ${deliveryTime}`;
    const endDate = `${endYear}-${endMonth}-${endDay} ${endHour}:${endMinute}`;
    return { startDate, endDate };
  } catch (err) {
    console.log(err);
  }
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

  // convert total volume in cubic cm to cubic feet
  const totalVolumeInCubicFeet = maxItemMeasuresInCmAndKg.totalVolume / 28316.8;

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
