import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// List of routes that don't require authentication
const publicRoutes = ['/auth', '/api/auth/login', '/api/auth/register'];

// List of API routes that should be checked for valid authentication
const apiRoutes = ['/api'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Allow public routes without authentication
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }
  
  // Check for authentication token in cookies
  const authToken = request.cookies.get('authToken')?.value;
  
  // For API routes, return 401 if not authenticated
  if (pathname.startsWith('/api') && !authToken) {
    return NextResponse.json(
      { message: 'Authentication required' },
      { status: 401 }
    );
  }
  
  // For other routes, redirect to login if not authenticated
  if (!authToken) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth';
    url.searchParams.set('returnUrl', pathname);
    return NextResponse.redirect(url);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Exclude static files and api/auth routes from middleware
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)',
  ],
};