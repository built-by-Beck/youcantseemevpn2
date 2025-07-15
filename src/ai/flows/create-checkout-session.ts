'use server';
/**
 * @fileOverview A Genkit flow for creating a Stripe checkout session.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import Stripe from 'stripe';
import type { PlanName } from '@/types';

// Ensure the Stripe secret key is provided
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY environment variable not set');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Define the input schema for the checkout session flow
export const CreateCheckoutSessionInputSchema = z.object({
  plan: z.custom<PlanName>(),
  userId: z.string(),
});
export type CreateCheckoutSessionInput = z.infer<
  typeof CreateCheckoutSessionInputSchema
>;

// Define the output schema for the checkout session flow
export const CreateCheckoutSessionOutputSchema = z.object({
  sessionId: z.string(),
  url: z.string().nullable(),
});
export type CreateCheckoutSessionOutput = z.infer<
  typeof CreateCheckoutSessionOutputSchema
>;

// Map plan names to Stripe Price IDs
// IMPORTANT: Replace these with your actual Stripe Price IDs
const priceIdMap: Record<PlanName, string> = {
  basic: process.env.STRIPE_PRICE_ID_BASIC || 'price_1P...REPLACE_ME',
  pro: process.env.STRIPE_PRICE_ID_PRO || 'price_1P...REPLACE_ME',
  family: process.env.STRIPE_PRICE_ID_FAMILY || 'price_1P...REPLACE_ME',
  none: '', // Should not happen
};

// Main exported function to be called from the client
export async function createCheckoutSession(
  input: CreateCheckoutSessionInput
): Promise<CreateCheckoutSessionOutput> {
  return createCheckoutSessionFlow(input);
}

// Define the Genkit flow
const createCheckoutSessionFlow = ai.defineFlow(
  {
    name: 'createCheckoutSessionFlow',
    inputSchema: CreateCheckoutSessionInputSchema,
    outputSchema: CreateCheckoutSessionOutputSchema,
  },
  async ({ plan, userId }) => {
    const priceId = priceIdMap[plan];
    if (!priceId || plan === 'none') {
      throw new Error(`Invalid plan selected: ${plan}`);
    }
    
    if (priceId.includes('REPLACE_ME')) {
      throw new Error(`Stripe Price ID for plan "${plan}" is not configured in the environment variables.`);
    }

    // Get the base URL for success/cancel URLs
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002';

    // Create a Stripe checkout session
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
  }
);
