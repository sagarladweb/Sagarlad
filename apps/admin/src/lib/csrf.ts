import { NextResponse } from "next/server";

/**
 * Simple Origin/Referer check for same-origin CSRF protection on admin API
 * routes. Works without tokens — relies on the browser's automatic SameSite
 * cookie policy blocking cross-origin requests (which would lack the session).
 *
 * Use on POST/PUT/DELETE handlers. Returns null if the request is valid,
 * or a 403 NextResponse if it fails.
 */
export function csrfCheck(request: Request): NextResponse | null {
  const method = request.method;
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") {
    return null; // Safe methods don't need CSRF protection
  }

  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");

  // If no Origin or Referer, it's suspicious (curl/Postman bypass this,
  // but same-origin browsers always send one).
  if (!origin && !referer) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Check Origin header first (more reliable), then Referer
  const source = origin || referer || "";
  const allowed = process.env.AUTH_URL || "http://localhost:3001";

  try {
    const sourceHost = new URL(source).host;
    const allowedHost = new URL(allowed).host;
    if (sourceHost !== allowedHost) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return null;
}
