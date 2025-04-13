'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/lib/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Spinner } from '@/components/ui/spinner';

interface DashboardProps {
  children: React.ReactNode;
}

export function DashboardClient({ children }: DashboardProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  // Check if the user is authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth?callbackUrl=/dashboard');
    }
  }, [isLoading, isAuthenticated, router]);

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // If authenticated, render the dashboard
  if (isAuthenticated) {
    return (
      <div className="flex flex-col min-h-screen">
        <header className="bg-primary text-primary-foreground shadow-md">
          <div className="container mx-auto px-4 py-3 flex justify-between items-center">
            <h1 className="text-xl font-bold">BeakDash</h1>
            <div className="flex items-center gap-4">
              <div className="text-sm">
                {user?.name || user?.username}
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
                    {(user?.name || user?.username || 'U').charAt(0).toUpperCase()}
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

  // Default return null while redirecting
  return null;
}