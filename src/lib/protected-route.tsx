'use client';

import { useAuth } from '@/providers/auth-provider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function ProtectedRoute(props: P) {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading && !user) {
        router.push('/auth');
      }
    }, [user, isLoading, router]);

    // Show loading state or redirect to login
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          <span className="ml-2">Loading...</span>
        </div>
      );
    }

    // If not authenticated, don't render the component
    if (!user) {
      return null;
    }

    // If authenticated, render the wrapped component
    return <Component {...props} />;
  };
}