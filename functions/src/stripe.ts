import * as functions from "firebase-functions";
import Stripe from "stripe";

const stripe = new Stripe(functions.config().stripe.secret_key, {
  apiVersion: '2020-08-27', // Use your preferred API version
});

export const createStripeCheckoutSession = functions.https.onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const { planId } = req.body;

  if (!planId) {
    return res.status(400).send('Missing planId in request body');
  }

  // Map your planId to your Stripe Price ID
  const priceIdMap: { [key: string]: string } = {
    'basic': 'price_12345', // Replace with your Basic plan Stripe Price ID
    'pro': 'price_67890',   // Replace with your Pro plan Stripe Price ID
    // Add other planId to priceId mappings
  };

  const priceId = priceIdMap[planId];

  if (!priceId) {
    return res.status(400).send(`Invalid planId: ${planId}`);
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription', // Or 'payment' if not a subscription
      success_url: `${functions.config().app.url}/dashboard?payment=success`, // Replace with your success URL
      cancel_url: `${functions.config().app.url}/pricing?payment=cancelled`, // Replace with your cancel URL
      // Optional: Add customer information if you have it
      // customer_email: req.user.email, // If using Firebase Auth and passing user info
    });

    res.status(200).send({ sessionId: session.id });

  } catch (error) {
    console.error('Error creating Stripe checkout session:', error);
    res.status(500).send('Error creating Stripe checkout session');
  }
});