import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow login page and auth API routes
  if (pathname === "/admin" || pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Allow static files and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // For API routes under /api/admin, block unauthenticated requests.
  // NextAuth v5 uses "authjs.session-token"; v4 used "next-auth.session-token".
  if (pathname.startsWith("/api/admin")) {
    const sessionToken =
      request.cookies.get("authjs.session-token")?.value
      ?? request.cookies.get("__Secure-authjs.session-token")?.value
      ?? request.cookies.get("next-auth.session-token")?.value
      ?? request.cookies.get("__Secure-next-auth.session-token")?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.next();
  }

  // For page routes under /admin/*, always pass through.
  // The server component layout handles auth and shows an inline
  // session-expired page when needed — no redirect, no loop.
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
