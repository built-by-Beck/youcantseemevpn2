import Stripe from 'stripe';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { doc, updateDoc } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import type { PlanName } from '@/types';

// Ensure Stripe secret key is provided
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY environment variable not set');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get('stripe-signature') ?? '';

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`❌ Error message: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    
    // Retrieve metadata we set during checkout
    const userId = session.metadata?.userId;
    const plan = session.metadata?.plan as PlanName;

    if (!userId || !plan) {
      console.error('❌ Missing metadata in Stripe session');
      return NextResponse.json({ error: 'Missing metadata' }, { status: 400 });
    }

    try {
      const userRef = doc(firestore, 'users', userId);
      await updateDoc(userRef, {
        membershipTier: plan,
        isActive: true,
        stripeCustomerId: session.customer, // Save customer ID for future management
        stripeSubscriptionId: session.subscription, // Save subscription ID
      });
      console.log(`✅ User ${userId} successfully subscribed to ${plan} plan.`);
    } catch (error) {
      console.error(`🔥 Error updating user in Firestore:`, error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }
  }

  // Handle subscription cancellation
  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription;
    const customerId = subscription.customer as string;

    // We need to find the user by their Stripe customer ID
    // This requires a query, which is more complex. For now, we'll log it.
    // In a real app, you would query Firestore for the user with this customerId
    // and then update their status.
    console.log(`❗ Subscription cancelled for customer: ${customerId}. Manual update needed.`);
    // Example of what you would do:
    // const userQuery = query(collection(firestore, 'users'), where('stripeCustomerId', '==', customerId));
    // const querySnapshot = await getDocs(userQuery);
    // if (!querySnapshot.empty) {
    //   const userDoc = querySnapshot.docs[0];
    //   await updateDoc(userDoc.ref, { isActive: false, membershipTier: 'none' });
    // }
  }


  return NextResponse.json({ received: true });
}
