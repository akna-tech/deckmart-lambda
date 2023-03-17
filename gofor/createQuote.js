const axios = require("axios");
const { getAuthToken, formatDate, pickVehicle } = require("./helper");
const { postalCodes } = require("./goforPostalCodes.json");

async function createGoforQuote({
  contactNumber,
  destinationAddress,
  destinationCity,
  destinationProvince,
  destinationZip,
  items,
  deliveryDate,
  deliveryTime,
  clientName,
  orderNumber,
}) {
  try {
    const zip3letters = destinationZip.slice(0, 3);
    if (!postalCodes.includes(zip3letters)) {
      return {
        carrier: "gofor",
        price: null,
        error: true,
        errorMessage: "Destination out of gofor service area",
      };
    }
    const { startDate, endDate } = formatDate(deliveryDate, deliveryTime);
    const vehicleId = pickVehicle(items);
    const itemsDetails = items.map((item, index) => ({
      itemId: index,
      quantity: item.pieces,
      dimension: {
        unit: "CM",
        width: item.width,
        length: item.length,
        height: item.height,
      },
      weight: {
        unit: "KG",
        weight: item.weight,
      },
    }));

    const body = {
      deliveryType: "Scheduled",
      schedule: {
        startDate,
        endDate,
      },
      requestedVehicle: {
        vehicleId,
      },
      customerType: "",
      pickUp: {
        pickUpType: "Curbside",
        pickUpContact: {
          firstName: "Alex",
          companyName: "DECKMART BUILDING SUPPLIES",
          mobile: {
            code: "",
            number: 9058125029,
          },
          email: {
            address: "",
          },
        },
        pickUpAddress: {
          addressLine1: "601 Garyray Dr",
          city: "NORTH YORK",
          postalCode: "M9L1P9",
          stateOrProvince: "ON",
          country: "CA",
        },
      },
      dropOffs: [
        {
          dropOffType: "Curbside",
          dropOffContact: {
            firstName: clientName,
            mobile: {
              code: "",
              number: contactNumber,
            },
            email: {
              address: "",
            },
          },
          dropOffAddress: {
            addressLine1: destinationAddress,
            city: destinationCity,
            postalCode: destinationZip.toUpperCase(),
            stateOrProvince: destinationProvince.toUpperCase(),
            country: "CA",
          },
          orderNumber,
          items: itemsDetails,
          specialInstructions: "",
          dropOffNotification: {
            notificationType: "None",
            IsCustomText: false,
          },
        },
      ],
    };

    const token = await getAuthToken();
    const goForQuoteUrl = process.env.GOFOR_QUOTE_URL;

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const result = await axios.post(goForQuoteUrl, body, { headers });
    const { data } = result;
    return {
      carrier: "gofor",
      price: data.qtInfo[0].TotalQuoteValue,
      error: false,
      errorMessage: "",
    };
  } catch (err) {
    console.log('err', err)
    console.log(err.response?.data);

    const errorMessage = err.response?.data?.response || "Unable to create gofor quote";
    return {
      carrier: "gofor",
      price: null,
      error: true,
      errorMessage,
    };
  }
}

module.exports = { createGoforQuote };
