import React from 'react';
import Link from 'next/link';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b bg-background sticky top-0 z-10">
        <div className="container flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-xl font-bold text-primary">
              BeakDash
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link 
                href="/dashboard" 
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Dashboards
              </Link>
              <Link 
                href="/connections" 
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Connections
              </Link>
              <Link 
                href="/datasets" 
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Datasets
              </Link>
              <Link 
                href="/widgets" 
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Widgets
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              href="/settings" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Settings
            </Link>
            <Link 
              href="/profile" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Profile
            </Link>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}