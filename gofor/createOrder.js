const axios = require("axios");
const { getAuthToken, formatDate, pickVehicle } = require("./helper");
const { postalCodes } = require("./goforPostalCodes.json");

async function createGoforOrder({
    contactNumber,
    destinationAddress,
    destinationCity,
    destinationProvince,
    destinationZip,
    items,
    deliveryDate,
    deliveryTime,
    orderNumber,
    clientName
  }) {
    try {
      const zip3letters = destinationZip.slice(0, 3);
      if (!postalCodes.includes(zip3letters)) {
        return {
          message: "Destination out of gofor service area",
          statusCode: 403,
        };
      }
      const { startDate, endDate, sameDay, skipOrder, expectedDelivery } = formatDate(deliveryDate, deliveryTime);
      if (skipOrder) {
        console.log('Gofor order skipped: ', skipOrder)
        return {
          message: "Successfully created gofor order",
          statusCode: 200,
        };
      }
      console.log('Gofor current time: ', new Date().toISOString());
      console.log('Gofor Order startDate: ', startDate);
      console.log('Gofor Order endDate: ', endDate);
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
          vehicleId: pickVehicle(items)
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
              IsCustomText: false,
              notificationType: contactNumber ? "SMS" : "None",
            },
          },
        ],
      };
      console.log('Gofor Order body: ', JSON.stringify(body));
      const token = await getAuthToken();
      const goForQuoteUrl = process.env.GOFOR_ORDER_URL;
  
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const result = await axios.post(goForQuoteUrl, body, { headers });
      console.log('Gofor Order result: ', result.data);
      const expectedDay = startDate.split('T')[0];
      return {
        message: "Successfully created gofor order, expected date:  " + expectedDay,
        expectedDeliveryDate: expectedDelivery,
        statusCode: 200,
      };
    } catch (err) {
      if (err.response?.data) {
        console.log('Gofor Order error: ', JSON.stringify(err.response?.data));
      }
      else {
        console.log('Gofor Order error: ', err.message);
      }
      return {
        message: err.response?.data?.response || err.message || "Unable to create gofor order",
        statusCode: err.response?.data?.code || 500,
      };
    }
  }

module.exports = { createGoforOrder };
