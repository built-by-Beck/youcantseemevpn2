'use client';

import DashboardClient from '@/components/dashboard/dashboard-client';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold font-headline tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
          Connection Dashboard
        </h1>
        <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
          Manage your secure connection, view available servers, and download
          configuration files. You are in control.
        </p>
      </div>
      <DashboardClient />
    </div>
  );
}
