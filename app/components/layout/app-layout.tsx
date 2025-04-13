'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { Spinner } from '@/components/ui/spinner';
import Sidebar from '@/components/layout/sidebar-fixed';
import { useSidebarStore } from '@/store/sidebar-store';
import Link from 'next/link';
import { signOut } from 'next-auth/react';

// Icons
import { 
  User, 
  LogOut
} from 'lucide-react';

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
    const user = session.user;
    const { collapsed } = useSidebarStore();
    
    return (
      <div className="flex min-h-screen bg-background">
        {/* Import enhanced sidebar with space switching */}
        <Sidebar />
        
        {/* Main content */}
        <div className={`flex flex-col flex-1 transition-all duration-300 ${collapsed ? 'ml-16' : 'ml-64'}`}>
          <header className="h-16 border-b bg-card flex items-center justify-between px-4 sticky top-0 z-10">
            <h2 className="text-lg font-medium">
              {pathname.includes('/spaces/') ? 'Space Details' : 
               pathname === '/spaces' ? 'Spaces' :
               pathname === '/dashboard' ? 'Dashboard' :
               pathname === '/datasets' ? 'Datasets' :
               pathname === '/connections' ? 'Connections' :
               pathname === '/widgets' ? 'Widgets' :
               pathname === '/profile' ? 'Profile' :
               pathname === '/settings' ? 'Settings' : 'Dashboard'}
            </h2>
            <div className="flex items-center gap-4">
              <div className="text-sm hidden md:block">
                {user?.name || user?.email || 'User'}
              </div>
              <button 
                onClick={() => router.push('/profile')}
                className="p-1 rounded-full bg-muted hover:bg-muted/80"
              >
                {user?.image ? (
                  <img 
                    src={user.image} 
                    alt={user?.name || 'User'} 
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                    {(user?.name?.charAt(0) || user?.email?.charAt(0) || 'U').toUpperCase()}
                  </div>
                )}
              </button>
            </div>
          </header>
          <main className="flex-1 p-4 md:p-6">
            {children}
          </main>
          <footer className="border-t p-4 text-center text-sm text-muted-foreground">
            BeakDash &copy; {new Date().getFullYear()} - AI-Powered Dashboard Creator
          </footer>
        </div>
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