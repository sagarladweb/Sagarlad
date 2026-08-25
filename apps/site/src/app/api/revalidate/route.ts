import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import crypto from "node:crypto";

export const runtime = "nodejs";

// The admin app runs as a separate Next.js process, so its own revalidatePath
// calls can never reach this app's route cache. Instead the admin calls this
// endpoint (with the shared CRON_SECRET) after every write, and we invalidate
// every public page here — in the process that actually serves them.
const PATHS = [
  "/",
  "/blog",
  "/blog/[slug]",
  "/books",
  "/videos",
  "/videos/[slug]",
  "/quotes",
  "/content",
  "/content/[slug]",
];

// Tags on the unstable_cache helpers in src/lib/content.ts. revalidatePath
// refreshes ISR page caches but does NOT invalidate unstable_cache data, so
// categories/videos/books/quotes would otherwise stay stale for up to a week.
const TAGS = ["content", "categories", "videos", "books", "quotes", "socials"];

function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

export async function POST(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 });
  }

  const token = req.headers.get("x-revalidate-secret") ?? "";
  if (!constantTimeCompare(token, secret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  for (const path of PATHS) {
    revalidatePath(path, "page");
  }
  for (const tag of TAGS) {
    revalidateTag(tag, "max");
  }
  return NextResponse.json({ revalidated: true, paths: PATHS.length, tags: TAGS.length });
}
