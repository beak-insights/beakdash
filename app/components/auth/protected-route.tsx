'use client';

import React, { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Spinner } from '@/components/ui/spinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const isLoading = status === 'loading';
  const isUnauthenticated = status === 'unauthenticated';

  useEffect(() => {
    // If the user is not authenticated, redirect to login
    if (isUnauthenticated) {
      router.push('/auth');
    }
  }, [isUnauthenticated, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // Only render children if authenticated
  return session ? <>{children}</> : null;
}