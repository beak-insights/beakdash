import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'BeakDash - Authentication',
  description: 'Sign in or register for an account',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  );
}