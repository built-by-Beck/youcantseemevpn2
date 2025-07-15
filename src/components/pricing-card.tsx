import type { Plan } from '@/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, ArrowRight, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface PricingCardProps {
  plan: Plan;
  onChoosePlan: (planId: string) => Promise<void>; // Modified to accept planId and return a Promise
  isLoading?: boolean;
}

export default function PricingCard({
  plan,
  onChoosePlan,
  isLoading,
}: PricingCardProps) {
  return (
    <Card
      className={cn(
        'flex flex-col border-2 hover:border-primary transition-all duration-300 relative',
        plan.popular ? 'border-primary' : 'border-border'
      )}
    >
      {plan.popular && (
        <Badge className="absolute -top-3 right-4 bg-accent text-accent-foreground">
          Most Popular
        </Badge>
      )}
      <CardHeader className="items-center text-center">
        {plan.icon}
        <CardTitle className="text-2xl font-headline mt-4 capitalize">
          {plan.name}
        </CardTitle>
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold text-primary">{plan.price}</span>
          <span className="text-muted-foreground">{plan.pricePeriod}</span>
        </div>
        <CardDescription>{plan.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <ul className="space-y-3">
          {plan.features.map((feature, i) => (
            <li key={i} className="flex items-center gap-3">
              <Check className="w-5 h-5 text-primary" />
              <span className="text-muted-foreground">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full group"
          onClick={() => onChoosePlan(plan.id)} // Pass the plan ID to onChoosePlan
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <>
              {plan.cta}
              <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
