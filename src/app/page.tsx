
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import PricingCard from '@/components/pricing-card';
import { ArrowRight, ShieldCheck, Star, Users, Loader2 } from 'lucide-react';
import type { Plan, PlanName } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useAuthModal } from '@/components/auth/auth-modal';
import { createCheckoutSession } from '@/app/actions/stripe';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const plans: Omit<Plan, 'name' | 'id'>[] = [
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
  const [loadingPlan, setLoadingPlan] = useState<PlanName | null>(null);
  const router = useRouter();

  const handleChoosePlan = async (plan: PlanName) => {
    if (!user) {
      setOpen(true);
      return;
    }

    if (plan === 'none') return;
    setLoadingPlan(plan);
    
    try {
      const { url } = await createCheckoutSession({ plan, userId: user.uid });
      if (url) {
        router.push(url);
      } else {
        throw new Error('Could not create a checkout session URL.');
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast({
        title: 'Error',
        description:
          error.message ||
          'Could not create a checkout session. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-5rem)] p-4 md:p-8">
      <div className="text-center max-w-4xl mx-auto">
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
            plan={{ ...plan, name: plan.tier, id: plan.tier }}
            onChoosePlan={() => handleChoosePlan(plan.tier as PlanName)}
            isLoading={loadingPlan === plan.tier}
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
