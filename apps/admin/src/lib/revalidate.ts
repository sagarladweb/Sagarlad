import { revalidateTag } from "next/cache";

// The admin and site are separate Next.js apps — revalidatePath here only
// touches the admin's own cache. To actually refresh the public site we call
// the site's /api/revalidate endpoint (guarded by the shared CRON_SECRET),
// which invalidates every public page in the process that serves them.
//
// Awaited with a timeout so the admin write response returns only after the
// site has confirmed revalidation (or the timeout fired). Best-effort by
// design: an unreachable site never throws — the failure is logged and the
// write still succeeds, with the ISR TTL as the eventual fallback.
export async function revalidatePublic(): Promise<boolean> {
  // Invalidate the admin's own unstable_cache (dashboard stats, category
  // pickers) so a post write refreshes admin-side data immediately.
  revalidateTag("socials", "max");
  revalidateTag("content", "max");

  let rawUrl = (process.env.SITE_URL ?? "https://sagarlad.com").trim().replace(/\/$/, "");
  if (!/^https?:\/\//i.test(rawUrl)) {
    rawUrl = `https://${rawUrl}`;
  }

  try {
    await fetch(`${rawUrl}/api/revalidate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret: process.env.CRON_SECRET }),
      signal: AbortSignal.timeout(3000),
    });
    return true;
  } catch (err) {
    console.warn("[revalidate] site refresh failed:", (err as Error).message);
    return false;
  }
}