'use client';

import React from 'react';
import Link from 'next/link';
import { UserMenu } from '@/components/auth/user-menu';
import { useAuth } from '@/hooks/use-auth';

export function Header() {
  const { isAuthenticated } = useAuth();
  
  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background">
      <div className="container flex h-16 items-center px-4">
        <div className="mr-4 flex">
          <Link href="/" className="flex items-center space-x-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-primary"
            >
              <path d="M22 11V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v7Z" />
              <path d="m12 12 4 10 1.7-4.3L22 16Z" />
            </svg>
            <span className="hidden font-bold sm:inline-block">BeakDash</span>
          </Link>
        </div>
        
        <div className="flex-1" />
        
        <nav className="mx-6 flex items-center space-x-4 lg:space-x-6 hidden md:block">
          <Link
            href="/dashboard"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Dashboards
          </Link>
          <Link
            href="/datasets"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Datasets
          </Link>
          <Link
            href="/connections"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Connections
          </Link>
          <Link
            href="/widgets"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Widgets
          </Link>
        </nav>
        
        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <UserMenu />
          ) : (
            <div className="hidden sm:flex space-x-4">
              <Link 
                href="/auth"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Sign in
              </Link>
              <Link
                href="/auth/sign-up"
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}