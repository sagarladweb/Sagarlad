import { auth } from "@/lib/auth";
import type { Session } from "next-auth";

/**
 * Verify session is authenticated admin.
 * Also checks Origin/Referer for CSRF on mutating requests (POST/PUT/DELETE)
 * by inspecting the request method from headers (set by Next.js).
 *
 * Returns Session if valid, null otherwise.
 */
export async function requireAdmin(request?: Request): Promise<Session | null> {
  let session: Session | null = null;
  try {
    session = await auth();
  } catch (err) {
    console.warn("[requireAdmin] auth() failed:", (err as Error).message);
    return null;
  }

  if (!session?.user || session.user.role !== "ADMIN") {
    console.warn("[requireAdmin] Unauthorized access attempt");
    return null;
  }

  // CSRF check on mutating requests (if request object provided)
  if (request) {
    const method = request.method;
    if (method === "POST" || method === "PUT" || method === "DELETE" || method === "PATCH") {
      const origin = request.headers.get("origin");
      const referer = request.headers.get("referer");
      const source = origin || referer;
      if (source) {
        try {
          const sourceHost = new URL(source).host;
          // Derive allowed host: AUTH_URL > request Host header > localhost fallback
          const allowed = process.env.AUTH_URL
            || request.headers.get("host")
            || "localhost:3001";
          const allowedHost = new URL(`https://${allowed}`).host;
          if (sourceHost !== allowedHost) {
            console.warn("[requireAdmin] CSRF blocked:", sourceHost, "!=", allowedHost);
            return null;
          }
        } catch {
          console.warn("[requireAdmin] CSRF: invalid origin/referer");
          return null;
        }
      }
    }
  }

  return session;
}
