const axios = require("axios");
const qs = require("qs");
const { getHolidaysFromAWS } = require("../holidays.js")

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

async function formatDate(deliveryDate, deliveryTime) {
  console.log('Gofor format date -- deliveryDate: ', deliveryDate);
  console.log("Gofor format date -- deliveryTime: ", deliveryTime);
  try {
    const currentHoursLocal = parseInt(deliveryTime.split(':')[0]);

    const currentDateUTC = new Date().toLocaleString('en-GB', {
      timeZone: 'UTC',
      hour: 'numeric',
      minute: 'numeric',
      hour12: false,
    });
    console.log('Gofor format date -- currentDateUTC: ', currentDateUTC);

    const currentHoursUTC = parseInt(currentDateUTC.split(':')[0]);
    console.log('Gofor format date -- currentHoursUTC: ', currentHoursUTC);

    // calculate hour difference between UTC and Canada
    let hourDifference = currentHoursUTC - currentHoursLocal;
    if (hourDifference < 0) { // this means date is changed at UTC and not at Canada
      hourDifference = 24 + hourDifference;
    }
    console.log('Gofor format date -- hourDifference: ', hourDifference);

    // if date is changed at UTC we will add a day to delivery date later
    let isDateDifferentAtUTC = currentHoursLocal >= (24 - hourDifference);
    console.log('Gofor format date -- isDateDifferentAtUTC: ', isDateDifferentAtUTC);


    const locales = process.env.env === 'production' ? 'en-CA' : undefined;
    const timeZone = process.env.env === 'production' ? 'America/Toronto' : undefined;
    const currentDate = new Date().toLocaleString(locales, { timeZone, hourCycle: 'h23' }).split(',')[0];
    console.log('Gofor format date -- currentDate: ', currentDate);
    const today = new Date(`${currentDate} ${deliveryTime}`);
    console.log('Gofor format date -- today: ', today);

    let deliveryDateObj = new Date(`${deliveryDate} ${deliveryTime}`);
    console.log('Gofor format date -- deliveryDateObj: ', deliveryDateObj);

    const isToday = deliveryDateObj.getDate() === today.getDate() &&
      deliveryDateObj.getMonth() === today.getMonth() &&
      deliveryDateObj.getFullYear() === today.getFullYear();
    console.log('Gofor format date -- isToday: ', isToday);

    // calculate if delivery is tomorrow
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    console.log('Gofor format date -- tomorrow: ', tomorrow);

    const isTomorrow = deliveryDateObj.getDate() === tomorrow.getDate() &&
      deliveryDateObj.getMonth() === tomorrow.getMonth() &&
      deliveryDateObj.getFullYear() === tomorrow.getFullYear();
    console.log('Gofor format date -- isTomorrow: ', isTomorrow);

    // case -1
    if (today.getFullYear() > deliveryDateObj.getFullYear() ||
        (today.getFullYear() === deliveryDateObj.getFullYear() && today.getMonth() > deliveryDateObj.getMonth()) ||
        (today.getFullYear() === deliveryDateObj.getFullYear() && today.getMonth() === deliveryDateObj.getMonth() && today.getDate() > deliveryDateObj.getDate())
        ) {
        console.log('Gofor format date: case -1');
        throw new Error('Delivery date cannot be in the past');
    }

    // case 0
    if (await isBusinessDay(deliveryDateObj) && !isToday) {
      console.log('Gofor format date: case 0');
      console.log(`Gofor: delivery ${deliveryDate}`)
      const startDate = formatWithDateTime(deliveryDate, `${08 + hourDifference }:00`);
      const endDate = formatWithDateTime(deliveryDate, `${15 + hourDifference }:00`);
      console.log(`Gofor: startDate: ${startDate}`);
      console.log(`Gofor: endDate: ${endDate}`);
      console.log(`Gofor: sameDay: true`);
      console.log(`Gofor: expectedDelivery: ${deliveryDate}`);
      return {
        startDate,
        endDate,
        sameDay: true,
        expectedDelivery: deliveryDate
      }
    }


    // case 1
    if (!await isBusinessDay(deliveryDateObj)) {
      console.log('Gofor format date: case 1');
      const nextBusinessDayString = await getNextBusinessDay(deliveryDate);
      console.log(`Gofor: delivery next business day: ${nextBusinessDayString}`)
      const startDate = formatWithDateTime(nextBusinessDayString, `${08 + hourDifference }:00`);
      const endDate = formatWithDateTime(nextBusinessDayString, `${15 + hourDifference }:00`);
      console.log(`Gofor: startDate: ${startDate}`);
      console.log(`Gofor: endDate: ${endDate}`);
      console.log(`Gofor: sameDay: false`);
      console.log(`Gofor: expectedDelivery: ${nextBusinessDayString}`);
      return {
        startDate,
        endDate,
        sameDay: false,
        expectedDelivery: nextBusinessDayString
      }
    }

    // case 2
    if (isToday && currentHoursLocal < 13) {
      console.log('Gofor format date: case 2');
      console.log('Gofor: delivery today')
      const startDate = formatWithDateTime(deliveryDate, `${13 + hourDifference  }:00`);
      const endDate = formatWithDateTime(deliveryDate, `${15 + hourDifference }:00`);
      console.log(`Gofor: startDate: ${startDate}`);
      console.log(`Gofor: endDate: ${endDate}`);
      console.log(`Gofor: sameDay: true && !isDateDifferentAtUTC`);
      console.log(`Gofor: expectedDelivery: ${!isDateDifferentAtUTC ? 'Today' : deliveryDate}`);
      return {
        startDate,
        endDate,
        sameDay: true && !isDateDifferentAtUTC,
        expectedDelivery: !isDateDifferentAtUTC ? 'Today' : deliveryDate
      }
    }

    // case 3
    if (isToday && currentHoursLocal >= 13) {
      console.log('Gofor format date: case 3');
      deliveryDate = isDateDifferentAtUTC ? tomorrow.toISOString().split('T')[0] : deliveryDate;
      const nextBusinessDayString = await getNextBusinessDay(deliveryDate);
      console.log(`Gofor: delivery next business day: ${nextBusinessDayString}`)
      const startDate = formatWithDateTime(nextBusinessDayString, `${08 + hourDifference }:00`);
      const endDate = formatWithDateTime(nextBusinessDayString, `${15 + hourDifference }:00`);
      console.log(`Gofor: startDate: ${startDate}`);
      console.log(`Gofor: endDate: ${endDate}`);
      console.log(`Gofor: sameDay: false`);
      console.log(`Gofor: expectedDelivery: ${nextBusinessDayString}`);
      return {
        startDate,
        endDate,
        sameDay: false,
        expectedDelivery: nextBusinessDayString
      }
    }
    console.log('Case not matched for', deliveryDateObj)
    throw new Error('Gofor format date: no case matched')
  } catch (err) {
    console.log('ERROR Gofor formatDate: ', err);
    throw err;
  }
}

function formatWithDateTime(deliveryDate, deliveryTime, addDays = 0, addHours = 0) {
  const dateString = new Date(`${deliveryDate} ${deliveryTime}`);
  dateString.setDate(dateString.getDate() + addDays);
  dateString.setHours(dateString.getHours() + addHours, dateString.getMinutes());

  const year = dateString.getFullYear();
  let month = dateString.getMonth() + 1;
  month = ("0" + month).slice(-2);
  let day = dateString.getDate();
  day = ("0" + day).slice(-2);
  let hour = dateString.getHours();
  hour = ("0" + hour).slice(-2);
  let minute = dateString.getMinutes();
  minute = ("0" + minute).slice(-2);
  return `${year}-${month}-${day} ${hour}:${minute}`;
}

async function isBusinessDay(dateString, allowSaturday = false) {
  const date = new Date(dateString);
  const day = date.getDay();
  const holidays = await getHolidaysFromAWS();
  const result = day !== 0 && (day !== 6 || allowSaturday) && !holidays.includes(dateString);
  console.log('Gofor isBusinessDay: ', day, dateString, result)
  return result;
}

async function getNextBusinessDay(dateString, allowSaturday = false) {
  const nextDay = new Date(dateString);
  nextDay.setDate(nextDay.getDate() + 1);
  const nextDayString = nextDay.toISOString().split('T')[0];
  return await isBusinessDay(nextDayString, allowSaturday) ? nextDayString : await getNextBusinessDay(nextDayString, allowSaturday);
}

function pickVehicle(items) {
  const maxItemMeasuresInCmAndKg = items.reduce((measures, item) => {
    measures.maxLength = Math.max(measures.maxLength, item.length);
    measures.maxWidth = Math.max(measures.maxWidth, item.width);
    measures.maxHeight = Math.max(measures.maxHeight, item.height);
    measures.maxWeight = Math.max(measures.maxWeight, item.weight);
    measures.totalWeight += item.weight * item.pieces;
    measures.totalVolume += item.length * item.width * item.height * item.pieces;
    return measures;
  }, {
    maxLength: 0,
    maxWidth: 0,
    maxHeight: 0,
    maxWeight: 0,
    totalWeight: 0,
    totalVolume: 0,
  });
  console.log('Gofor: pick vehicle maxItemMeasuresInCmAndKg in cm: ', maxItemMeasuresInCmAndKg)
  const maxItemMeasures = {
    maxLength: maxItemMeasuresInCmAndKg.maxLength / 30.48,
    maxWidth: maxItemMeasuresInCmAndKg.maxWidth / 30.48,
    maxHeight: maxItemMeasuresInCmAndKg.maxHeight / 30.48,
    maxWeight: maxItemMeasuresInCmAndKg.maxWeight * 2.20462,
    totalWeight: maxItemMeasuresInCmAndKg.totalWeight * 2.20462,
    totalVolume: maxItemMeasuresInCmAndKg.totalVolume * 3.53146667 * 0.00001,
  };

  console.log('Gofor: pick vehicle maxItemMeasures: ', maxItemMeasures)
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
      console.log('Gofor pickVehicle: no vehicle found')
      console.log('Gofor pickVehicle: maxItemMeasures: ', JSON.stringify(maxItemMeasures))
      throw new Error("No vehicle found");
  }
}

module.exports = {
  getAuthToken,
  formatDate,
  pickVehicle,
  getNextBusinessDay,
  isBusinessDay
};
