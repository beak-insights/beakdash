'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { Spinner } from '@/components/ui/spinner';
import Link from 'next/link';
import { signOut } from 'next-auth/react';

// Icons
import { 
  LayoutDashboard, 
  Database, 
  Link as LinkIcon, 
  BarChart, 
  Settings, 
  User, 
  LogOut, 
  ChevronLeft,
  ChevronRight,
  Layers
} from 'lucide-react';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Set mounted state when component mounts
  useEffect(() => {
    setMounted(true);
    
    // Check local storage for sidebar collapsed state
    const savedState = localStorage.getItem('sidebar-collapsed');
    if (savedState) {
      setSidebarCollapsed(savedState === 'true');
    }
  }, []);

  // Save sidebar state to local storage
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('sidebar-collapsed', String(sidebarCollapsed));
    }
  }, [sidebarCollapsed, mounted]);

  // Check if the user is authenticated
  useEffect(() => {
    if (mounted && status === 'unauthenticated') {
      console.log('User is not authenticated, redirecting to login');
      router.push(`/auth?callbackUrl=${pathname}`);
    }
  }, [mounted, status, router, pathname]);

  // Nav items
  const navItems = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
      active: pathname === '/dashboard' || pathname.startsWith('/dashboard/'),
    },
    {
      label: 'Spaces',
      href: '/spaces',
      icon: <Layers className="w-5 h-5" />,
      active: pathname === '/spaces' || pathname.startsWith('/spaces/'),
    },
    {
      label: 'Datasets',
      href: '/datasets',
      icon: <Database className="w-5 h-5" />,
      active: pathname === '/datasets' || pathname.startsWith('/datasets/'),
    },
    {
      label: 'Connections',
      href: '/connections',
      icon: <LinkIcon className="w-5 h-5" />,
      active: pathname === '/connections' || pathname.startsWith('/connections/'),
    },
    {
      label: 'Widgets',
      href: '/widgets',
      icon: <BarChart className="w-5 h-5" />,
      active: pathname === '/widgets' || pathname.startsWith('/widgets/'),
    },
    {
      label: 'Profile',
      href: '/profile',
      icon: <User className="w-5 h-5" />,
      active: pathname === '/profile',
    },
    {
      label: 'Settings',
      href: '/settings',
      icon: <Settings className="w-5 h-5" />,
      active: pathname === '/settings',
    },
  ];

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
    
    return (
      <div className="flex min-h-screen bg-background">
        {/* Sidebar - always visible, even on mobile, but collapsible */}
        <aside 
          className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r bg-card transition-all duration-300 
            ${sidebarCollapsed ? 'w-16' : 'w-64'}`}
        >
          <div className="flex h-16 items-center justify-between px-4 border-b">
            {!sidebarCollapsed && (
              <h1 className="text-xl font-bold">BeakDash</h1>
            )}
            <button 
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className={`p-2 rounded-md hover:bg-muted ${sidebarCollapsed ? 'ml-auto mr-auto' : ''}`}
              aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </button>
          </div>
          
          <nav className="flex flex-col gap-1 px-2 py-4 flex-1">
            {navItems.map((item, index) => (
              <Link 
                key={index}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors
                  ${item.active ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'hover:bg-muted'}
                  ${sidebarCollapsed ? 'justify-center' : ''}`}
                title={sidebarCollapsed ? item.label : ''}
              >
                {item.icon}
                {!sidebarCollapsed && <span>{item.label}</span>}
              </Link>
            ))}
          </nav>
          
          <div className="border-t p-4">
            <button
              onClick={handleLogout} 
              className={`flex items-center gap-3 w-full px-3 py-2 rounded-md hover:bg-destructive/10 text-destructive
                ${sidebarCollapsed ? 'justify-center' : ''}`}
              title={sidebarCollapsed ? "Log Out" : ''}
            >
              <LogOut className="w-5 h-5" />
              {!sidebarCollapsed && <span>Log Out</span>}
            </button>
          </div>
        </aside>
        
        {/* Main content */}
        <div className={`flex flex-col flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
          <header className="h-16 border-b bg-card flex items-center justify-between px-4 sticky top-0 z-10">
            <h2 className="text-lg font-medium">
              {navItems.find(item => item.active)?.label || 'Dashboard'}
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