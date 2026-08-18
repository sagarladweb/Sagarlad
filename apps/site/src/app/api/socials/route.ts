import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";
import { FALLBACK_SOCIALS } from "@/lib/social-links";

export const runtime = "nodejs";

const getSocials = unstable_cache(
  async () =>
    prisma.socialLink.findMany({
      where: { active: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      select: { id: true, key: true, label: true, handle: true, href: true, icon: true, logoUrl: true, color: true },
    }),
  ["site-socials"],
  { revalidate: 3600, tags: ["socials"] }
);

export async function GET() {
  try {
    const socials = await getSocials();
    return NextResponse.json({ socials });
  } catch (err) {
    console.warn("[api/socials] DB unavailable, using fallback socials:", (err as Error).message);
    return NextResponse.json({ socials: FALLBACK_SOCIALS });
  }
}
