'use client';

import React from 'react';
import { useAuth } from '@/lib/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Spinner } from '@/components/ui/spinner';
import { Header } from '@/components/layout/header';

interface WidgetsClientProps {
  children: React.ReactNode;
}

export function WidgetsClient({ children }: WidgetsClientProps) {
  const { isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  // Check if the user is authenticated
  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth?callbackUrl=/widgets');
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

  // If authenticated, render the widgets page
  if (isAuthenticated && user) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1">
          {children}
        </main>
      </div>
    );
  }

  // Default return null while redirecting
  return null;
}