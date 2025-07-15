'use server';
/**
 * @fileOverview A flow for creating a Stripe checkout session.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import Stripe from 'stripe';
import type { PlanName } from '@/types';

// Ensure the Stripe secret key is provided
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY environment variable not set.');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
});

// IMPORTANT: Replace these with your actual Stripe Price IDs from your Stripe Dashboard.
// You can find these in the "Products" section of your Stripe account.
const priceIds: Record<Exclude<PlanName, 'none'>, string> = {
  basic: process.env.STRIPE_PRICE_ID_BASIC || 'price_1P...REPLACE_ME_BASIC',
  pro: process.env.STRIPE_PRICE_ID_PRO || 'price_1P...REPLACE_ME_PRO',
  family: process.env.STRIPE_PRICE_ID_FAMILY || 'price_1P...REPLACE_ME_FAMILY',
};

export const CreateCheckoutSessionInputSchema = z.object({
  plan: z.custom<PlanName>((val) => val !== 'none'),
  userId: z.string(),
});
export type CreateCheckoutSessionInput = z.infer<
  typeof CreateCheckoutSessionInputSchema
>;

export const CreateCheckoutSessionOutputSchema = z.object({
  sessionId: z.string(),
  url: z.string().nullable(),
});
export type CreateCheckoutSessionOutput = z.infer<
  typeof CreateCheckoutSessionOutputSchema
>;

export async function createCheckoutSession(
  input: CreateCheckoutSessionInput
): Promise<CreateCheckoutSessionOutput> {
  return createCheckoutSessionFlow(input);
}

const createCheckoutSessionFlow = ai.defineFlow(
  {
    name: 'createCheckoutSessionFlow',
    inputSchema: CreateCheckoutSessionInputSchema,
    outputSchema: CreateCheckoutSessionOutputSchema,
  },
  async ({ plan, userId }) => {
    const priceId = priceIds[plan as Exclude<PlanName, 'none'>];

    if (!priceId || priceId.includes('REPLACE_ME')) {
      throw new Error(
        `Stripe Price ID for plan "${plan}" is not configured. Please check your environment variables.`
      );
    }
    
    // Default to a development URL, but use a production URL if available
    const domain = process.env.PROD_URL || 'http://localhost:9002';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${domain}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${domain}/`,
      client_reference_id: userId, // Pass the Firebase User ID
      subscription_data: {
        metadata: {
          userId: userId, // Store user ID in subscription metadata
          plan: plan,
        },
      },
    });

    return {
      sessionId: session.id,
      url: session.url,
    };
  }
);
