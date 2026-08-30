/**
 * Deterministic engagement seeder.
 *
 * Assigns organic-looking views + likes to every post based on:
 *   - post age (days since publishedAt)
 *   - featured flag
 *   - category name
 *   - title hash (unique variance per post)
 *
 * Same inputs → same outputs. Run once; re-run safely (skips posts that
 * already have non-zero views).
 */
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// ── DB connection (same pattern as seed.ts) ──────────────────────────
function parsePgUrl(url: string) {
  const at = url.lastIndexOf("@");
  const creds = url.slice("postgresql://".length, at);
  const colon = creds.lastIndexOf(":");
  const user = decodeURIComponent(creds.slice(0, colon));
  const password = decodeURIComponent(creds.slice(colon + 1));
  const rest = url.slice(at + 1);
  const slash = rest.indexOf("/");
  const hostPort = rest.slice(0, slash);
  const database = rest.slice(slash + 1).split("?")[0];
  const colonIdx = hostPort.lastIndexOf(":");
  const host = hostPort.slice(0, colonIdx);
  const port = Number(hostPort.slice(colonIdx + 1)) || 5432;
  return { user, password, host, port, database };
}

const url = process.env.DIRECT_URL || process.env.DATABASE_URL || "";
const { user, password, host, port, database } = parsePgUrl(url);
const adapter = new PrismaPg({
  connectionString: `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${database}`,
  ssl: { rejectUnauthorized: false },
});
const prisma = new PrismaClient({ adapter });

// ── Helpers ──────────────────────────────────────────────────────────

/** Simple FNV-1a hash → unsigned 32-bit int */
function fnv1a(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = (h * 0x01000193) >>> 0;
  }
  return h;
}

/** Deterministic float in [0, 1) from a seed string */
function seededRandom(seed: string): number {
  return (fnv1a(seed) % 10000) / 10000;
}

// Category popularity weights (higher = more views)
const CATEGORY_WEIGHT: Record<string, number> = {
  "money": 1.3,
  "life-lessons": 1.25,
  "productivity": 1.15,
  "startups": 1.1,
  "mindset": 1.1,
  "confidence": 1.05,
  "habits": 1.05,
  "books": 1.0,
  "career": 1.0,
  "happiness": 0.95,
  "motivation": 0.95,
  "health": 0.9,
  "relationship": 0.9,
  "anxiety": 0.85,
  "soft-skills": 0.85,
  "communication": 0.85,
  "emotional-intelligence": 0.8,
  "technology": 0.8,
};

function computeEngagement(post: {
  id: string;
  title: string;
  slug: string;
  publishedAt: Date;
  featured: boolean;
  category: { slug: string } | null;
  views: number;
}) {
  // Skip posts the admin has already manually set
  if (post.views > 0) return null;

  const now = new Date();
  const ageDays = Math.max(1, Math.floor((now.getTime() - post.publishedAt.getTime()) / 86_400_000));

  // Base views: 2-6 views per day of age, scaled by category
  const catSlug = post.category?.slug ?? "";
  const catWeight = CATEGORY_WEIGHT[catSlug] ?? 1.0;
  const titleHash = seededRandom(post.title);
  const idHash = seededRandom(post.id);

  // Daily base rate: 2.5 + title variance (0-1.5) → 2.5-4 views/day
  const dailyRate = 2.5 + titleHash * 1.5;
  let views = Math.round(ageDays * dailyRate * catWeight);

  // Featured boost: +30-50%
  if (post.featured) {
    views = Math.round(views * (1.3 + idHash * 0.2));
  }

  // Title-based jitter: ±12% so similar-age posts differ
  const jitter = 0.88 + titleHash * 0.24;
  views = Math.round(views * jitter);

  // Floor/ceiling
  views = Math.max(14, Math.min(views, 480));

  // Likes: 8-14% of views, category-tweaked
  const likeRatio = 0.08 + (catWeight - 0.8) * 0.15 + idHash * 0.04;
  let likes = Math.round(views * Math.max(0.06, Math.min(likeRatio, 0.16)));
  likes = Math.max(2, Math.min(likes, Math.round(views * 0.18)));

  return { views, likes };
}

// ── Main ─────────────────────────────────────────────────────────────

async function main() {
  console.log("Seeding engagement data...");

  const posts = await prisma.post.findMany({
    where: { deletedAt: null },
    select: {
      id: true,
      title: true,
      slug: true,
      publishedAt: true,
      featured: true,
      views: true,
      likes: true,
      category: { select: { slug: true } },
    },
    orderBy: { publishedAt: "asc" },
  });

  console.log(`Found ${posts.length} posts`);

  let updated = 0;
  for (const post of posts) {
    const eng = computeEngagement(post);
    if (!eng) {
      console.log(`  SKIP  "${post.title}" (views=${post.views}, likes=${post.likes})`);
      continue;
    }
    await prisma.post.update({
      where: { id: post.id },
      data: { views: eng.views, likes: eng.likes },
    });
    console.log(`  SET   "${post.title}" → views=${eng.views}, likes=${eng.likes}`);
    updated++;
  }

  console.log(`\nDone. Updated ${updated}/${posts.length} posts.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
