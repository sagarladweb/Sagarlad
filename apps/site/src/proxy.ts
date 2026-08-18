import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// After every rebuild hashed CSS/JS chunk names rotate. Browsers heuristically
// cache HTML pages (s-maxage only applies to CDNs), so a cached page can
// reference a CSS chunk that the new build deleted -> 404 -> unstyled site.
// Forcing revalidation of HTML documents fixes it; static assets stay immutable.
export function proxy(request: NextRequest) {
  // Production-only pass-through for HTML revalidation (see header below).
  // In dev, returning undefined keeps the middleware off the request path:
  // middleware + streaming was the source of "Connection closed." browser
  // console errors (aborted RSC streams), and dev has no stale-HTML problem.
  if (process.env.NODE_ENV !== "production") return;

  const response = NextResponse.next();
  const acceptsHtml = request.headers.get("accept")?.includes("text/html");
  if (acceptsHtml) {
    response.headers.set("Cache-Control", "private, no-cache, must-revalidate");
  }
  return response;
}

export const config = {
  matcher: "/((?!_next/static|_next/image|api|favicon.ico|.*\\..*).*)",
};