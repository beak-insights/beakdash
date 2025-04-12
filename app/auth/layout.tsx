import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';

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
    <div className="flex min-h-screen flex-col bg-muted/40">
      <header className="px-4 lg:px-6 h-14 flex items-center border-b bg-background">
        <Link href="/" className="flex items-center gap-2 font-semibold">
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
          <span>BeakDash</span>
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-10">
        <div className="w-full max-w-md mx-auto rounded-lg border bg-card text-card-foreground shadow-sm">
          {children}
        </div>
      </main>
      <footer className="border-t py-4 px-6 flex justify-center text-sm text-muted-foreground">
        <div className="flex gap-4">
          <Link href="/terms" className="hover:underline">Terms</Link>
          <Link href="/privacy" className="hover:underline">Privacy</Link>
          <Link href="/help" className="hover:underline">Help</Link>
        </div>
      </footer>
    </div>
  );
}