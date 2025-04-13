'use client';

import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Spinner } from '@/components/ui/spinner';

interface DashboardProps {
  children: React.ReactNode;
}

export function DashboardClient({ children }: DashboardProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  // Check if the user is authenticated
  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth');
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
    return <>{children}</>;
  }

  // Default return null while redirecting
  return null;
}