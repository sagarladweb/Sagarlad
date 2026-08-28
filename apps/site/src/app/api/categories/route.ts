import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";
import { FALLBACK_CATEGORIES } from "@/lib/content";

export const runtime = "nodejs";

const getCategories = unstable_cache(
  () =>
    prisma.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true },
    }),
  ["nav-categories"],
  { revalidate: 3600, tags: ["content", "categories"] }
);

export async function GET() {
  try {
    const categories = await getCategories();
    return NextResponse.json({ categories });
  } catch (err) {
    console.warn("[api/categories] DB unavailable, using fallback categories:", (err as Error).message);
    return NextResponse.json({ categories: FALLBACK_CATEGORIES });
  }
}
