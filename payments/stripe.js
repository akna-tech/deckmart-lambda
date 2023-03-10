export const checkout = async(product) => {
    const session = await stripe.checkout.sessions.create({ 
        payment_method_types: ["card"], 
        line_items: [ 
        { 
            price_data: { 
            currency: "usd", 
            product_data: { 
                name: product.name, 
            }, 
            unit_amount: product.price * 100, 
            }, 
            quantity: product.quantity, 
        }, 
        ], 
        mode: "payment", 
        success_url: "http://localhost:3000/success", 
        cancel_url: "http://localhost:3000/cancel", 
    }); 
    return { id: session.id }; 
}

export const paymentIntent = async() => {
    const stripe = require('stripe')(process.env.STRIPE_KEY);
    const paymentIntent = await stripe.paymentIntents.create({
        amount: 1099,
        currency: 'usd',
    });
    const clientSecret = paymentIntent.client_secret;
    // Pass the client secret to the client
}

export const paymentIntentWebhook = async (type, data) => {  
    // Handle the event
    switch (type) {
      case 'payment_intent.succeeded':
        const paymentIntent = data.object;
        console.log('PaymentIntent was successful!');
        break;
      case 'payment_method.attached':
        const paymentMethod = data.object;
        console.log('PaymentMethod was attached to a Customer!');
        break;
      // ... handle other event types
      default:
        console.log(`Unhandled event type ${type}`);
    }
  
    // Return a 200 response to acknowledge receipt of the event
    return {received: true};
}
