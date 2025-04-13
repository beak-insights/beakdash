import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { runMigrations } from "@/lib/db";

// Track if migrations have run
let migrationStatus = {
  hasRun: false,
  isRunning: false
};

// Middleware for authentication protection and running migrations
export async function middleware(request: NextRequest) {
  // Only run migrations once per server instance
  if (!migrationStatus.hasRun && !migrationStatus.isRunning) {
    migrationStatus.isRunning = true;
    try {
      console.log('Running database migrations...');
      await runMigrations();
      console.log('Database migrations completed successfully');
    } catch (error) {
      console.error('Error running migrations:', error);
    } finally {
      migrationStatus.hasRun = true;
      migrationStatus.isRunning = false;
    }
  }
  const { pathname } = request.nextUrl;
  
  // Check if the path should be protected (requires authentication)
  const isProtectedPath = 
    pathname.startsWith('/dashboard') || 
    pathname.startsWith('/profile') ||
    pathname.startsWith('/datasets') ||
    pathname.startsWith('/connections') ||
    pathname.startsWith('/widgets') ||
    pathname.startsWith('/settings');
  
  // Check if the path is for authentication
  const isAuthPath = 
    pathname.startsWith('/auth') || 
    pathname === '/';

  // Skip middleware for API and resource paths
  if (
    pathname.startsWith('/api') || 
    pathname.startsWith('/_next') || 
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  try {
    // Get the token (session) from the request
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET || "your-secret-key-change-in-production",
    });
    
    const isAuthenticated = !!token;
    console.log(
      `Middleware: Path "${pathname}" is ${isProtectedPath ? 'protected' : 'public'}, user is ${isAuthenticated ? 'authenticated' : 'not authenticated'}`
    );

    // If the user is trying to access a protected route but is not authenticated
    if (isProtectedPath && !isAuthenticated) {
      console.log(`Redirecting to /auth from ${pathname}`);
      const url = new URL('/auth', request.url);
      url.searchParams.set('callbackUrl', encodeURI(pathname));
      return NextResponse.redirect(url);
    }

    // If the user is authenticated and trying to access auth pages, redirect to dashboard
    if (isAuthenticated && isAuthPath) {
      console.log('User is authenticated, redirecting from auth to dashboard');
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Otherwise, proceed normally
    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);
    // In case of error, allow the request to proceed
    return NextResponse.next();
  }
}

// See https://nextjs.org/docs/app/building-your-application/routing/middleware
export const config = {
  matcher: [
    // Match all paths except API routes, static files, and images
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};