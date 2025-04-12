// Simple middleware without Clerk for now
 
// We'll implement a simpler middleware that doesn't rely on Clerk for now
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
 
export function middleware(request: NextRequest) {
  // Return early so we don't conflict with Clerk's middleware
  return NextResponse.next();
}
 
export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};