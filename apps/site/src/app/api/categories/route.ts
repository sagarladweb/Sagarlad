import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

// Static mirror of prisma/seed.ts categories so the nav menu still works
// when Supabase free tier pauses the DB.
const FALLBACK_CATEGORIES = [
  "Life Lessons",
  "Money",
  "Books",
  "Productivity",
  "Startups",
  "Anxiety",
  "Confidence",
  "Habits",
  "Happiness",
  "Health",
  "Relationship",
  "Motivation",
  "Technology",
  "Career",
  "Soft Skills",
  "Mindset",
  "Communication",
  "Emotional Intelligence",
].map((name) => ({
  id: `fallback-${name.toLowerCase().replace(/ /g, "-")}`,
  name,
  slug: name.toLowerCase().replace(/ /g, "-"),
}));

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
