'use client';

import { useState } from 'react';
import type { PlanName, ServerData, ServerLocation } from '@/types';
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
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '../ui/badge';

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

export default function DashboardClient() {
  const [currentPlan, setCurrentPlan] = useState<PlanName>('basic');
  const { toast } = useToast();

  const availableRegions = planPermissions[currentPlan];

  const handleDownload = (serverName: string) => {
    toast({
      title: 'Download Started',
      description: `Downloading configuration for ${serverName}...`,
    });
  };

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
                onValueChange={(value) => setCurrentPlan(value as PlanName)}
              >
                <SelectTrigger id="plan-switcher" className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Select a plan" />
                </SelectTrigger>
                <SelectContent>
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

      <Tabs defaultValue={availableRegions[0]} className="w-full">
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
    </div>
  );
}
