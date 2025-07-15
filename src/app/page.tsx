'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import PricingCard from '@/components/pricing-card';
import { ArrowRight, ShieldCheck, Star, Users } from 'lucide-react';
import type { Plan, PlanName } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { doc, updateDoc } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { useAuthModal } from '@/components/auth/auth-modal';

const plans: Omit<Plan, 'name'>[] = [
  {
    tier: 'basic',
    price: '$5.99',
    pricePeriod: '/month',
    description: 'Get started with essential privacy features.',
    icon: <ShieldCheck className="w-8 h-8 text-primary" />,
    features: [
      'Access to US servers',
      '1 connected device',
      'Standard speed',
      'Basic security',
    ],
    cta: 'Choose Basic',
  },
  {
    tier: 'pro',
    price: '$14.99',
    pricePeriod: '/month',
    description: 'For power users who need more.',
    icon: <Star className="w-8 h-8 text-primary" />,
    features: [
      'Access to all 7 global locations',
      '3 connected devices',
      'High-speed streaming',
      'Advanced security features',
    ],
    cta: 'Choose Pro',
    popular: true,
  },
  {
    tier: 'family',
    price: '$29.99',
    pricePeriod: '/month',
    description: 'Protect your entire family online.',
    icon: <Users className="w-8 h-8 text-primary" />,
    features: [
      'Access to all 7 global locations',
      '10 connected devices',
      'Highest speeds available',
      'Family-wide protection',
    ],
    cta: 'Choose Family',
  },
];

export default function Home() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { setOpen } = useAuthModal();

  const handleChoosePlan = async (plan: PlanName) => {
    if (!user) {
      setOpen(true);
      return;
    }

    try {
      const userRef = doc(firestore, 'users', user.uid);
      await updateDoc(userRef, { membershipTier: plan });
      toast({
        title: 'Plan Updated!',
        description: `You are now on the ${plan} plan.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Could not update your plan. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-5rem)] p-4 md:p-8">
      <div className="text-center max-w-4xl mx-auto">
        <div className="inline-block rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary mb-4">
          24-Hour Free Trial Available on All Plans
        </div>
        <h1 className="text-4xl md:text-6xl font-bold font-headline tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
          You Can't See Me. But You Can See These Prices.
        </h1>
        <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          Choose your shield. Uncompromising privacy and unrestricted access,
          tailored to your needs. Get started today and browse with confidence.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12 w-full max-w-6xl">
        {plans.map((plan) => (
          <PricingCard
            key={plan.tier}
            plan={{ ...plan, name: plan.tier }}
            onChoosePlan={() => handleChoosePlan(plan.tier)}
          />
        ))}
      </div>

      <div className="mt-12 text-center">
        <Link href="/dashboard">
          <Button size="lg" className="group" variant="ghost">
            Go to Dashboard
            <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
