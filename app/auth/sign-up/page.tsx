'use client';

import React from 'react';
import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      {/* Clerk authentication UI */}
      <div className="w-full max-w-md p-8">
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
  );
}