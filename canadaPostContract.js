const { host, customerNumber } = process.env;

exports.createOrder =  async function(event, context) {
    const DeckmartCompanyName = "DeckMart";
    const DeckmartContactPhone = "1 (905) 856-1177";
    const DeckmartAddressDeatails = {
        "address-line-1": "100 Marycroft Ave",
        "city": "ONTARIO",
        "prov-state": "ON",
        "country-code": "CA",
        "postal-zip-code": "L4L5Y4"
    }
    
    const { 
        shippingPoint,
        serviceCode,
        recieverName,
        recieverPhoneNumber,
        recieverAddressLine1,
        recieverCity,
        recieverProvinceCode,
        recieverCountryCode,
        recieverPostalCode,
        recieverEmail, // can be removed
        parcelWeight, // in kg
        parcelLength, // in cm
        parcelWidth,
        parcelHeight,
        parcelUnpackaged
    } = event.body




    let requestBody = {
        "shipment": {
        //   "group-id": "grp1",
          "requested-shipping-point": shippingPoint,
          "cpc-pickup-indicator": true,
          "delivery-spec": {
            "service-code": serviceCode,
            "sender": {
              "company": DeckmartCompanyName,
              "contact-phone": DeckmartContactPhone,
              "address-details": DeckmartAddressDeatails
            },
            "destination": {
              "name": recieverName,
              "client-voice-number": recieverPhoneNumber,
              "address-details": {
                "address-line-1": recieverAddressLine1,
                "city": recieverCity,
                "prov-state": recieverProvinceCode,
                "country-code": recieverCountryCode,
                "postal-zip-code": recieverPostalCode
              }
            },
            "options": {
              "option": {
                "option-code": "SO"
              }
            },
            "parcel-characteristics": {
              "weight": parcelWeight,
              "dimensions": {
                "length": parcelLength,
                "width": parcelWidth,
                "height": parcelHeight
              },
              "unpackaged": parcelUnpackaged,
            },
            "notification": {
              "email": recieverEmail,
              "on-shipment": true,
              "on-exception": false,
              "on-delivery": true
            },
            "preferences": {
              "show-postage-rate": false,
            },
            "settlement-info": {
              "contract-id": 40662505,
              "intended-method-of-payment": "Account"
            }
          }
        }
      }

}