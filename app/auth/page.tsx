import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { AuthForms } from './auth-forms';

export const metadata: Metadata = {
  title: 'BeakDash - Authentication',
  description: 'Sign in or register for an account',
};

export default function AuthPage() {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Left side with illustration/branding */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-muted p-12">
        <div>
          <Link href="/" className="text-2xl font-bold text-primary">
            BeakDash
          </Link>
          <h1 className="mt-12 text-4xl font-bold tracking-tight text-foreground">
            Welcome to your dashboard creation platform
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Create powerful, interactive dashboards with AI assistance
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} BeakDash. All rights reserved.
        </div>
      </div>

      {/* Right side with auth forms */}
      <div className="flex items-center justify-center w-full lg:w-1/2">
        <div className="w-full max-w-md p-8">
          <div className="lg:hidden mb-8">
            <Link href="/" className="text-2xl font-bold text-primary">
              BeakDash
            </Link>
          </div>
          
          {/* Auth forms component with login/register functionality */}
          <AuthForms defaultView="login" />
        </div>
      </div>
    </div>
  );
}