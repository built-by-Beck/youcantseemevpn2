'use server';

import { z } from 'zod';
import Stripe from 'stripe';
import type { PlanName } from '@/types';

// Ensure the Stripe secret key is provided
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY environment variable not set');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Define the input schema for the checkout session action
export const CreateCheckoutSessionInputSchema = z.object({
  plan: z.custom<PlanName>(),
  userId: z.string(),
});
export type CreateCheckoutSessionInput = z.infer<
  typeof CreateCheckoutSessionInputSchema
>;

// Map plan names to Stripe Price IDs
const priceIdMap: Record<PlanName, string> = {
  basic: process.env.STRIPE_PRICE_ID_BASIC || '',
  pro: process.env.STRIPE_PRICE_ID_PRO || '',
  family: process.env.STRIPE_PRICE_ID_FAMILY || '',
  none: '',
};

export async function createCheckoutSession(input: CreateCheckoutSessionInput) {
  const { plan, userId } = CreateCheckoutSessionInputSchema.parse(input);

  const priceId = priceIdMap[plan];
  if (!priceId || plan === 'none') {
    throw new Error(`Invalid or missing Stripe Price ID for plan: ${plan}. Please check your environment variables.`);
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002';

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${baseUrl}/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/?payment=cancelled`,
      client_reference_id: userId,
      metadata: {
        userId: userId,
        plan: plan,
      },
    });

    if (!session.id || !session.url) {
      throw new Error('Could not create Stripe session');
    }

    return {
      sessionId: session.id,
      url: session.url,
    };
  } catch (error) {
    console.error('Error creating Stripe session:', error);
    // Re-throw a more generic error to the client
    throw new Error('There was an issue creating the payment session.');
  }
}
