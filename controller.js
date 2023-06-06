const { createManitoulinOrder } = require('./manitoulin/createOrder.js');
const { createUberOrder } = require('./uber/createOrder.js');
const { createGoforOrder } = require("./gofor/createOrder.js");
const { createManitoulinQuote } = require('./manitoulin/createQuote.js');
const { createUberQuote } = require('./uber/createQuote.js');
const { createGoforQuote } = require("./gofor/createQuote.js");
const { checkout, paymentIntent, paymentIntentWebhook } = require('./payments/stripe.js');
const holidays = require('./gofor/holidays.js');
const axios = require("axios");

async function createOrder(body, service) {
  console.log(123)
  const {
    items,
    destinationCompany,
    contactNumber,
    destinationAddress,
    destinationCity,
    destinationProvince,
    destinationZip,
    deliveryDate,
    clientName,
    orderNumber
  } = body;
  
  const locales = process.env.env === 'production' ? 'en-CA' : undefined;
  const timeZone = process.env.env === 'production' ? 'America/Toronto' : undefined;
  const currentDate = new Date().toLocaleString(locales, {
    timeZone,
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  });

  if (service.toLowerCase() === "manitoulin") {
    try {
      const manitoulinResult = await createManitoulinOrder({
        items,
        consigneeCompany: destinationCompany,
        consigneeContact: contactNumber,
        consigneeAddress: destinationAddress,
        consigneeCity: destinationCity,
        consigneeProvince: destinationProvince,
        consigneePostal: destinationZip,
        deliveryDate,
        deliveryTime: currentDate,
      });
      return manitoulinResult;
    } catch (err) {
      console.log('Manitoulin order uncaught error: ', err.message);
      return {
        message: "Unable to create manitoulin order",
        statusCode: 500,
      };
    }
  }
  if (service.toLowerCase() === "uber" || service.toLowerCase() === "deckmartexpress" || service.toLowerCase() === "deckmart express") {
    try {
      const uberResult = await createUberOrder(
        items,
        destinationZip,
        deliveryDate,
        currentDate
      );
      return uberResult;
    } catch (err) {
      console.log('Uber/Deckmart Express order uncaught error: ', err.message);
      return {
        message: `Unable to create ${service} order`,
        statusCode: 500,
      };
    }
  }
  if (service.toLowerCase() === "gofor") {
    try {
      const goforResult = await createGoforOrder({
        items,
        destinationCompany,
        contactNumber,
        destinationAddress,
        destinationCity,
        destinationProvince,
        destinationZip,
        deliveryDate,
        deliveryTime: currentDate,
        orderNumber,
        clientName,
      });
      return goforResult;
    } catch (err) {
      console.log('GoFor order uncaught error: ', err.message);
      return {
        message: "Unable to create gofor order",
        statusCode: 500,
      };
    }
  }
}

async function createQuote(body) {
  const {
    destinationCity,
    destinationProvince,
    destinationZip,
    destinationAddress,
    contactNumber,
    items,
    deliveryDate,
    clientName,
    orderNumber
  } = body;

  const locales = process.env.env === 'production' ? 'en-CA' : undefined;
  const timeZone = process.env.env === 'production' ? 'America/Toronto' : undefined;
  const currentDate = new Date().toLocaleString(locales, {
    timeZone,
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  });
  const manitoulinResult = await createManitoulinQuote({
    destinationCity,
    destinationProvince,
    destinationZip,
    items,
  });

  const result = await createUberQuote(
    items,
    destinationZip,
    deliveryDate,
    currentDate
  );
  const { uberResult, deckmartExpressResult } = result;

  const goforResult = await createGoforQuote({
    destinationCity,
    destinationProvince,
    destinationZip,
    destinationAddress,
    contactNumber,
    items,
    deliveryDate,
    deliveryTime: currentDate,
    clientName,
    orderNumber,
  });
  if (!manitoulinResult.error) {
    manitoulinResult.expectedDeliveryDate = goforResult.expectedDeliveryDate 
    manitoulinResult.expectedDeliveryDate = manitoulinResult.expectedDeliveryDate ? manitoulinResult.expectedDeliveryDate : uberResult.expectedDeliveryDate || deckmartExpressResult.expectedDeliveryDate;
  }
  const quotes = [manitoulinResult, uberResult, deckmartExpressResult, goforResult];

  return {
    quotes,
  };
}

async function createCheckout(body) {
    const { product } = body;
    try {
        return await checkout(product);
    }
    catch (err) {
        return {
            error: {
                message: 'Unable to create checkout',
                statusCode: 500,
            }
        };
    }
}

async function createPaymentIntent(body) {
    const { amount } = body;
    try {
        return await paymentIntent(amount);
    }
    catch (err) {
      console.log(JSON.stringify(err))
        return {
            error: {
                message: 'Unable to create payment intent',
                statusCode: 500,
            }
        };
    }
}

async function handlePaymentIntentWebhook(body) {
    const { type, data } = body;
    try {
        return await paymentIntentWebhook(type, data);
    }
    catch (err) {
        return {
            error: {
                message: 'Payment intent webhook failed',
                statusCode: 500,
            }
        };
    }
}

async function getHolidays() {
    try {
        // const result = await axios.get('https://canada-holidays.ca/api/v1/holidays?year=2023&federal=1&optional=1');
        const result = await axios.get('https://canada-holidays.ca/api/v1/provinces/ON?year=2023&optional=false');
        console.log('result: ', result)

        const holidays = [];
        result.data.province.holidays.forEach(holiday => {
          holidays.push(holiday.date);
        });
        return holidays
    }
    catch (err) {
        console.log('Error getting holidays: ', err.message);
        return { error: 'Unable to get holidays' }
    }
}

module.exports = {
    createQuote,
    createOrder,
    createCheckout,
    createPaymentIntent,
    handlePaymentIntentWebhook,
    getHolidays
}


[
  "2023-01-01",
  "2023-04-07",
  "2023-04-10",
  "2023-05-22",
  "2023-07-01",
  "2023-08-07",
  "2023-09-04",
  "2023-09-30",
  "2023-10-09",
  "2023-11-11",
  "2023-12-25",
  "2023-12-26"
]

[
  "2023-01-01",
  "2023-02-20",
  "2023-04-07",
  "2023-05-22",
  "2023-07-01",
  "2023-09-04",
  "2023-10-09",
  "2023-12-25",
  "2023-12-26"
]