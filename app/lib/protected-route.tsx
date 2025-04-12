import React, { ComponentType, FC } from 'react';
import { redirect } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';

interface ProtectedRouteProps {
  component: ComponentType<any>;
  props?: Record<string, any>;
}

/**
 * Higher-order component that protects routes from unauthenticated access
 * 
 * @param component Component to protect
 * @param props Props to pass to the component
 * @returns Protected component
 */
export const ProtectedRoute: FC<ProtectedRouteProps> = ({ component: Component, props = {} }) => {
  const { user, isLoading } = useAuth();

  // Show loading state while auth is being checked
  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    redirect('/auth');
    return null;
  }

  // Render the protected component
  return <Component {...props} />;
};

/**
 * HOC function to create a protected component
 * 
 * @param Component Component to protect
 * @returns Protected component
 */
export function withProtection<P extends object>(Component: ComponentType<P>): FC<P> {
  return (props: P) => (
    <ProtectedRoute component={Component} props={props as Record<string, any>} />
  );
}