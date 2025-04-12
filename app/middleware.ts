import { NextRequest, NextResponse } from 'next/server';

// Paths that don't require authentication
const publicPaths = ['/auth', '/api/auth/login', '/api/auth/register'];

// Function to check if a path is public
const isPublicPath = (path: string) => {
  return publicPaths.some(publicPath => {
    if (publicPath.endsWith('*')) {
      const prefix = publicPath.slice(0, -1);
      return path.startsWith(prefix);
    }
    return path === publicPath;
  });
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for public paths, API routes except protected ones, and static assets
  if (
    isPublicPath(pathname) || 
    (pathname.startsWith('/api') && !pathname.startsWith('/api/dashboard')) || 
    pathname.startsWith('/_next') || 
    pathname.includes('/public/')
  ) {
    return NextResponse.next();
  }

  // Check if the user is authenticated by looking for session cookie
  const sessionCookie = request.cookies.get('session');
  
  // If no session cookie found, redirect to login
  if (!sessionCookie) {
    const loginUrl = new URL('/auth', request.url);
    
    // Preserve the original URL to redirect back after login
    loginUrl.searchParams.set('callbackUrl', encodeURI(request.url));
    
    return NextResponse.redirect(loginUrl);
  }

  // If session cookie exists, allow the request to proceed
  return NextResponse.next();
}

export const config = {
  // Only run middleware on specific paths that need protection
  matcher: [
    // Skip static files
    '/((?!_next/static|_next/image|favicon.ico|.*\\.).*)',
    // API routes
    '/api/:path*',
  ],
};