const { createManitoulinOrder } = require('./manitoulin/createOrder.js');
const { createUberOrder } = require('./uber/createOrder.js');
const { createGotoOrder } = require("./gofor/createOrder.js");
const { createManitoulinQuote } = require('./manitoulin/createQuote.js');
const { createUberQuote } = require('./uber/createQuote.js');
const { createGoforQuote } = require("./gofor/createQuote.js");
const { checkout, paymentIntent, paymentIntentWebhook } = require('./payments/stripe.js')

async function createOrder(body, service) {
  const {
    items,
    destinationCompany,
    contactNumber,
    destinationAddress,
    destinationCity,
    destinationProvince,
    destinationZip,
    deliveryDate,
    deliveryTime,
  } = body;

  if (service === "manitoulin") {
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
        deliveryTime,
      });
      return manitoulinResult;
    } catch (err) {
      console.log(err.message);
      return {
        data: {
          message: "Unable to create manitoulin order",
        },
        statusCode: 500,
      };
    }
  }
  if (service === "uber") {
    try {
      const uberResult = await createUberOrder(
        items,
        destinationZip,
        deliveryDate,
        deliveryTime
      );
      return uberResult;
    } catch (err) {
      console.log(err.message);
      return {
        data: {
          message: "Unable to create uber order",
        },
        statusCode: 500,
      };
    }
  }
  if (service === "gofor") {
    try {
      const goforResult = await createGotoOrder({
        items,
        destinationCompany,
        contactNumber,
        destinationAddress,
        destinationCity,
        destinationProvince,
        destinationZip,
        deliveryDate,
        deliveryTime,
      });
      return goforResult;
    } catch (err) {
      console.log(err.message);
      return {
        data: {
          message: "Unable to create gofor order",
        },
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
    deliveryTime,
  } = body;
  let manitoulinResult, uberResult, goforResult;
  try {
    manitoulinResult = await createManitoulinQuote({
      destinationCity,
      destinationProvince,
      destinationZip,
      items,
    });
  } catch (err) {
    manitoulinResult = {
      error: {
        message: "Unable to create manitoulin quote",
        statusCode: 500,
      },
    };
  }
  try {
    uberResult = await createUberQuote(
      items,
      destinationZip,
      deliveryDate,
      deliveryTime
    );
  } catch (err) {
    console.log(err);
    uberResult = {
      error: {
        message: "Unable to create uber quote",
        statusCode: 500,
      },
    };
  }
  try {
    goforResult = await createGoforQuote({
      destinationCity,
      destinationProvince,
      destinationZip,
      destinationAddress,
      contactNumber,
      items,
      deliveryDate,
      deliveryTime,
    });
  } catch (err) {
    goforResult = {
      error: {
        message: "Unable to get gofor quote",
        statusCode: 500,
      },
    };
  }
  return {
    manitoulinResult,
    uberResult,
    goforResult,
  };
}

async function createCheckout(body) {
    const { product } = body;
    try {
        return await createCheckout(product);
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

module.exports = {
    createQuote,
    createOrder,
    createCheckout,
    createPaymentIntent,
    handlePaymentIntentWebhook,
}
