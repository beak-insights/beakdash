import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Simple middleware for path-based protection
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthRoute = pathname.startsWith('/auth');
  const isPublicRoute = isAuthRoute || pathname === '/' || pathname.startsWith('/api/health');
  
  // For now, just pass through all requests
  // Later we can implement proper authentication checks
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};