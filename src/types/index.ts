export type PlanName = 'basic' | 'pro' | 'family' | 'none';

export interface Plan {
  name: string;
  price: string;
  pricePeriod: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
  cta: string;
  popular?: boolean;
}

export type SignalStrength = 'high' | 'medium' | 'low';

export interface ServerLocation {
  name: string;
  country: string;
  signal: SignalStrength;
  flag: string; // emoji
}

export type Region = 'US' | 'UK' | 'Europe' | 'Asia';

export type ServerData = Record<Region, ServerLocation[]>;
