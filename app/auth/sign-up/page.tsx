'use client';

import React from 'react';
import Link from 'next/link';
import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Left side with illustration/branding */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-muted p-12">
        <div>
          <Link href="/" className="text-2xl font-bold text-primary">
            BeakDash
          </Link>
          <h1 className="mt-12 text-4xl font-bold tracking-tight text-foreground">
            Create your BeakDash account
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Join thousands of users building powerful dashboards with AI assistance
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} BeakDash. All rights reserved.
        </div>
      </div>

      {/* Right side with Clerk auth */}
      <div className="flex items-center justify-center w-full lg:w-1/2">
        <div className="w-full max-w-md p-8">
          <div className="lg:hidden mb-8">
            <Link href="/" className="text-2xl font-bold text-primary">
              BeakDash
            </Link>
          </div>
          
          {/* Clerk authentication UI */}
          <SignUp 
            appearance={{
              elements: {
                formButtonPrimary: 'bg-primary text-primary-foreground hover:bg-primary/90',
                card: 'shadow-none',
                headerTitle: 'text-2xl font-bold',
                headerSubtitle: 'text-sm text-muted-foreground'
              }
            }}
            path="/auth/sign-up"
            routing="path"
            signInUrl="/auth"
            afterSignUpUrl="/dashboard"
          />
        </div>
      </div>
    </div>
  );
}