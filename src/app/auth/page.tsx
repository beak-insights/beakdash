import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';

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

          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Sign in to your account</h2>
              <p className="text-sm text-muted-foreground mt-2">
                Enter your credentials below to access your dashboards
              </p>
            </div>

            <form className="space-y-4">
              <div className="space-y-2">
                <label 
                  htmlFor="username" 
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  placeholder="Enter your username"
                />
              </div>
              <div className="space-y-2">
                <label 
                  htmlFor="password" 
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  placeholder="Enter your password"
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md font-medium"
              >
                Sign In
              </button>
            </form>

            <div className="mt-4 text-center text-sm">
              <span className="text-muted-foreground">Don't have an account? </span>
              <a href="#" className="text-primary hover:underline">
                Register
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}