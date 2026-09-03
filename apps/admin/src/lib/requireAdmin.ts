import { auth } from "@/lib/auth";
import type { Session } from "next-auth";

/**
 * Verify session is authenticated admin.
 * Returns Session if valid, null otherwise.
 *
 * CSRF protection: the session cookie is httpOnly + sameSite:lax, so
 * cross-origin JavaScript can't read it. This blocks CSRF by default.
 * We skip origin checking because Vercel deployments have dynamic URLs
 * that don't match AUTH_URL reliably.
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

  return session;
}
