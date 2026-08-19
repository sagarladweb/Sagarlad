import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

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

export async function POST(req: Request) {
  const secret = req.headers.get("x-revalidate-secret") || (await req.json().catch(() => ({}))).secret;
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  for (const path of PATHS) {
    revalidatePath(path, "page");
  }
  return NextResponse.json({ revalidated: true, paths: PATHS.length });
}