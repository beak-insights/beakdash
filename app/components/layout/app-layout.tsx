'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { Spinner } from '@/components/ui/spinner';
import Sidebar from '@/components/layout/sidebar';
import { signOut } from 'next-auth/react';


interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  
  // Set mounted state when component mounts
  useEffect(() => {
    setMounted(true);
  }, []);

  // Check if the user is authenticated
  useEffect(() => {
    if (mounted && status === 'unauthenticated') {
      console.log('User is not authenticated, redirecting to login');
      router.push(`/auth?callbackUrl=${pathname}`);
    }
  }, [mounted, status, router, pathname]);

  // Navigation is handled by the Sidebar component

  // Handle log out
  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  // Show loading spinner while checking auth
  if (!mounted || status === 'loading') {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // If authenticated, render the layout with sidebar
  if (status === 'authenticated' && session?.user) {
    return (
      <div className="flex h-screen w-full bg-gray-100 overflow-hidden font-fira-sans">
        <Sidebar />
        
        <div className="flex flex-col flex-1 w-full overflow-hidden">
          <main className="flex-1 w-full overflow-y-auto">
            {children}
          </main>
    
          <footer className="border-t p-4 text-center text-sm text-muted-foreground w-full">
            BeakDash &copy; {new Date().getFullYear()} - AI-Powered Dashboard Creator
          </footer>
        </div>
      </div>
    );
  }

  // Show loading indicator while redirecting
  return (
    <div className="flex h-screen w-full items-center justify-center font-fira-sans">
      <div className="text-center">
        <Spinner size="lg" />
        <p className="mt-4 text-muted-foreground">Redirecting to login...</p>
      </div>
    </div>
  );
}