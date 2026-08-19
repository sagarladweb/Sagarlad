import { revalidateTag } from "next/cache";

// The admin and site are separate Next.js apps — revalidatePath here only
// touches the admin's own cache. To actually refresh the public site we call
// the site's /api/revalidate endpoint (guarded by the shared CRON_SECRET),
// which invalidates every public page in the process that serves them.
export function revalidatePublic() {
  revalidateTag("socials", "max");
  revalidateTag("content", "max");
  const siteUrl = (process.env.SITE_URL ?? "https://sagarlad.com").replace(/\/$/, "");
  fetch(`${siteUrl}/api/revalidate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ secret: process.env.CRON_SECRET }),
    keepalive: true,
  }).catch(() => {
    // Best-effort: the site will still refresh on its ISR TTL if unreachable.
  });
}