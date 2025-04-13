'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Spinner } from '@/components/ui/spinner';

interface DashboardProps {
  children: React.ReactNode;
}

export function DashboardClient({ children }: DashboardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Set mounted state when component mounts
  useEffect(() => {
    setMounted(true);
  }, []);

  // Debug session state
  useEffect(() => {
    console.log('Session status:', status);
    console.log('Session data:', session);
  }, [session, status]);

  // Check if the user is authenticated
  useEffect(() => {
    if (mounted && status === 'unauthenticated') {
      console.log('User is not authenticated, redirecting to login');
      router.push('/auth?callbackUrl=/dashboard');
    }
  }, [mounted, status, router]);

  // Show loading spinner while checking auth
  if (!mounted || status === 'loading') {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // If authenticated, render the dashboard
  if (status === 'authenticated' && session?.user) {
    const user = session.user;
    
    return (
      <div className="flex flex-col min-h-screen">
        <header className="bg-primary text-primary-foreground shadow-md">
          <div className="container mx-auto px-4 py-3 flex justify-between items-center">
            <h1 className="text-xl font-bold">BeakDash</h1>
            <div className="flex items-center gap-4">
              <div className="text-sm">
                {user?.name || 'User'}
              </div>
              <button 
                onClick={() => router.push('/profile')}
                className="p-1 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20"
              >
                {user?.image ? (
                  <img 
                    src={user.image} 
                    alt={user?.name || 'User'} 
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary-foreground/30 flex items-center justify-center">
                    {(user?.name || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
              </button>
            </div>
          </div>
        </header>
        <main className="flex-1 container mx-auto px-4 py-6">
          {children}
        </main>
      </div>
    );
  }

  // Show loading indicator while redirecting
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="text-center">
        <Spinner size="lg" />
        <p className="mt-4 text-muted-foreground">Redirecting to login...</p>
      </div>
    </div>
  );
}