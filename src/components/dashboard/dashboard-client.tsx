'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Download,
  Server,
  SignalHigh,
  SignalLow,
  SignalMedium,
  ShieldAlert,
  Copy,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '../ui/badge';
import type { PlanName, ServerData, ServerLocation } from '@/types';
import { useUserData } from '@/hooks/use-user-data';
import { doc, updateDoc } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';

const serverData: ServerData = {
  US: [
    { name: 'New York, NY', country: 'USA', signal: 'high', flag: '🇺🇸' },
    { name: 'Dallas, TX', country: 'USA', signal: 'medium', flag: '🇺🇸' },
    { name: 'Los Angeles, CA', country: 'USA', signal: 'high', flag: '🇺🇸' },
  ],
  UK: [
    { name: 'London', country: 'UK', signal: 'high', flag: '🇬🇧' },
    { name: 'Manchester', country: 'UK', signal: 'medium', flag: '🇬🇧' },
  ],
  Europe: [
    { name: 'Amsterdam', country: 'Netherlands', signal: 'high', flag: '🇳🇱' },
    { name: 'Frankfurt', country: 'Germany', signal: 'low', flag: '🇩🇪' },
    { name: 'Paris', country: 'France', signal: 'high', flag: '🇫🇷' },
  ],
  Asia: [
    { name: 'Tokyo', country: 'Japan', signal: 'high', flag: '🇯🇵' },
    { name: 'Singapore', country: 'Singapore', signal: 'medium', flag: '🇸🇬' },
  ],
};

const planPermissions: Record<PlanName, (keyof ServerData)[]> = {
  basic: ['US'],
  pro: ['US', 'UK', 'Europe', 'Asia'],
  family: ['US', 'UK', 'Europe', 'Asia'],
  none: [],
};

const SignalIcon = ({ signal }: { signal: ServerLocation['signal'] }) => {
  switch (signal) {
    case 'high':
      return <SignalHigh className="w-5 h-5 text-primary" />;
    case 'medium':
      return <SignalMedium className="w-5 h-5 text-yellow-400" />;
    case 'low':
      return <SignalLow className="w-5 h-5 text-red-500" />;
  }
};

const NoPlanState = () => (
  <Card className="bg-card/50 border-2 border-primary/20 mt-6">
    <CardHeader className="items-center text-center">
      <ShieldAlert className="w-12 h-12 text-destructive" />
      <CardTitle className="text-2xl mt-4">No Active Plan</CardTitle>
      <CardDescription>
        You do not have an active VPN plan. Please choose a plan to secure your
        connection.
      </CardDescription>
    </CardHeader>
    <CardContent className="text-center">
      <Button asChild>
        <a href="/#pricing">View Plans</a>
      </Button>
    </CardContent>
  </Card>
);

export default function DashboardClient() {
  const { user } = useAuth();
  const { userData, setUserData } = useUserData();
  const { toast } = useToast();
  const [webhookUrl, setWebhookUrl] = useState('');

  useEffect(() => {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
    setWebhookUrl(`${baseUrl}/api/stripe-webhook`);
  }, []);

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(webhookUrl);
    toast({
      title: 'Copied!',
      description: 'The webhook URL has been copied to your clipboard.',
    });
  };

  const handleDownload = (serverName: string) => {
    toast({
      title: 'Download Started',
      description: `Downloading configuration for ${serverName}...`,
    });
  };

  const handleSimulatePlanChange = async (newPlan: PlanName) => {
    if (!user) return;
    try {
      const userRef = doc(firestore, 'users', user.uid);
      await updateDoc(userRef, { membershipTier: newPlan });
      if (userData) {
        setUserData({ ...userData, membershipTier: newPlan });
      }
      toast({
        title: 'Plan Simulation Updated',
        description: `Your plan has been set to ${newPlan}.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Could not update your plan simulation.',
        variant: 'destructive',
      });
    }
  };

  const currentPlan = userData?.membershipTier || 'none';
  const availableRegions = planPermissions[currentPlan];
  const defaultTab = availableRegions.length > 0 ? availableRegions[0] : 'US';

  return (
    <div className="space-y-8">
      <Card className="bg-card/50 border-2 border-primary/20">
        <CardHeader>
          <CardTitle>Your Account</CardTitle>
          <CardDescription>
            View your current plan and switch between simulations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="grid gap-1.5 flex-1">
              <Label htmlFor="plan-switcher">Simulate Plan</Label>
              <Select
                value={currentPlan}
                onValueChange={(value) =>
                  handleSimulatePlanChange(value as PlanName)
                }
              >
                <SelectTrigger
                  id="plan-switcher"
                  className="w-full sm:w-[200px]"
                >
                  <SelectValue placeholder="Select a plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                  <SelectItem value="family">Family</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Current Plan</p>
              <p className="text-2xl font-bold font-headline text-primary capitalize">
                {currentPlan}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {currentPlan === 'none' ? (
        <NoPlanState />
      ) : (
        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
            {Object.keys(serverData).map((region) => (
              <TabsTrigger
                key={region}
                value={region}
                disabled={!availableRegions.includes(region as keyof ServerData)}
              >
                {region}
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.entries(serverData).map(([region, locations]) => (
            <TabsContent key={region} value={region}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                {locations.map((loc) => (
                  <Card
                    key={loc.name}
                    className="hover:shadow-primary/20 hover:shadow-lg transition-shadow duration-300"
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <Server className="w-8 h-8 text-accent" />
                        <Badge variant="outline">{loc.flag}</Badge>
                      </div>
                      <CardTitle className="pt-2">{loc.name}</CardTitle>
                      <CardDescription>{loc.country}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <SignalIcon signal={loc.signal} />
                        <span className="text-sm text-muted-foreground capitalize">
                          {loc.signal} Signal
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDownload(loc.name)}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Config
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Developer Info</CardTitle>
          <CardDescription>
            Use this information to configure your Stripe webhook.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-3 bg-muted rounded-md">
            <code className="text-sm text-muted-foreground break-all">
              {webhookUrl}
            </code>
            <Button variant="ghost" size="icon" onClick={handleCopyToClipboard}>
              <Copy className="h-4 w-4" />
              <span className="sr-only">Copy webhook URL</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
