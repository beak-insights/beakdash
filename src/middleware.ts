import { NextRequest, NextResponse } from 'next/server';

// Define paths that require authentication
const protectedPaths = [
  '/dashboard',
  '/connections',
  '/datasets',
  '/profile',
  '/settings',
  '/widgets',
  '/api/dashboards',
  '/api/widgets',
  '/api/connections',
  '/api/datasets',
  '/api/spaces',
  '/api/user/profile',
];

// Define paths that are available without authentication
const publicPaths = [
  '/',
  '/auth',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/logout',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the path is protected
  const isProtectedPath = protectedPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
  
  // Check if the path is public (not requiring auth)
  const isPublicPath = publicPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
  
  // Get the authentication token
  const authToken = request.cookies.get('authToken')?.value;
  
  // Handle resource paths (CSS, JS, images, etc.)
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/') ||
    pathname.includes('.') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next();
  }
  
  // If it's a protected path and there's no auth token, redirect to login
  if (isProtectedPath && !authToken) {
    const redirectUrl = new URL('/auth', request.url);
    redirectUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(redirectUrl);
  }
  
  // If it's a login/register page and user is already logged in, redirect to dashboard
  if (pathname === '/auth' && authToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // For all other requests, continue
  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};