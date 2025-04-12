import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Simple middleware for path-based protection
export function middleware(request: NextRequest) {
  // For now, just pass through all requests
  // Later we can implement proper authentication checks
  return NextResponse.next();
}

// See https://nextjs.org/docs/app/building-your-application/routing/middleware
export const config = {
  matcher: [
    // Skip all internal paths (_next)
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};