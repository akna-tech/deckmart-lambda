const axios = require('axios')
const querystring = require('querystring');
const { ClientId: uberClientId, uberClientSecret: ClientSecret, customerId } = require('./config')


// create delivery
exports.postDelivery =  async function(event, context) {
    const { 
        dropoff_address,
        dropoff_name,
        dropoff_phone_number,
        manifest_items,
        pickup_address,
        pickup_name,
        pickup_phone_number,
        dropoff_notes
    } = event.body

    const { access_token, refresh_token } = await getUberCredentialsForFreight()
    const config = {
        headers: { Authorization: `Bearer ${access_token}` }
    }

    const response = await axios.post(
        `https://api.uber.com/v1/customers/${customerId}/deliveries`,
        {
            dropoff_address,
            dropoff_name,
            dropoff_phone_number,
            manifest_items,
            pickup_address,
            pickup_name,
            pickup_phone_number,
            dropoff_notes
        },
        config
    )
    
    const { status } = response
    switch (status) {
        case 500:
            return {
                statusCode: 500,
                body: JSON.stringify('unknown error')
            }
        case 429:
            return {
                statusCode: 429,
                body: JSON.stringify('account’s limits have been exceeded')
            }
        case 422:
            return {
                statusCode: 422,
                body: JSON.stringify('address undeliverable: limited couriers')
            }
        case 200:
            return {
                statusCode: 200,
                body: JSON.stringify({
                    fee: response.data.fee,
                    currency: response.data.currency,
                    dropoff_eta: response.data.dropoff_eta,
                })
            }
    }
}

exports.postQuote = async function(event, context) {
    const { 
        dropoff_address,
        pickup_address,
        pickup_ready_dt,
        pickup_phone_number,
        manifest_total_value,
    } = event.body

    const { access_token, refresh_token } = await getUberCredentialsForFreight()
    const config = {
        headers: { Authorization: `Bearer ${access_token}` }
    }

    const response = await axios.post(
        `https://api.uber.com/v1/customers/${customer_id}/delivery_quotes`,
        {
            dropoff_address,
            pickup_address,
            pickup_ready_dt,
            pickup_phone_number,
            manifest_total_value,
        },
        config
    )
}

async function getUberCredentialsForFreight() {
    return getUberCredentials('freight.loads')
}

async function getUberCredentials(scope) {
    const { access_token, refresh_token } = axios.post('https://login.uber.com/oauth/v2/token', querystring.stringify({
        client_id: ClientId,
        client_secret: ClientSecret,
        grant_type: "client_credentials",
        scope
    }))
    return { access_token, refresh_token }
}
