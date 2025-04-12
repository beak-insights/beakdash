import { FC, ComponentType, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
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
  const router = useRouter();
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);
  
  // Handle client-side rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Handle unauthenticated access
  useEffect(() => {
    if (isClient && !isLoading && !user) {
      // Redirect to login page
      router.push(`/auth?callbackUrl=${encodeURIComponent(pathname)}`);
    }
  }, [isClient, isLoading, user, router, pathname]);

  // Show loading during authentication check
  if (isLoading || !isClient || !user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-pulse text-primary font-semibold">Loading...</div>
      </div>
    );
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
    <ProtectedRoute component={Component} props={props} />
  );
}