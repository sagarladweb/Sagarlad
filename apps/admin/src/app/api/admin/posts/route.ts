import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { adminPostSchema } from "@/lib/validations";
import { sanitizeHtml } from "@/lib/sanitize";
import { revalidatePublic } from "@/lib/revalidate";
import { NO_STORE_HEADERS } from "@/lib/cache-headers";

import { requireAdmin } from "@/lib/requireAdmin";
export const runtime = "nodejs";

const LIST_SELECT = {
  id: true,
  title: true,
  slug: true,
  excerpt: true,
  coverImage: true,
  featured: true,
  published: true,
  publishedAt: true,
  scheduledAt: true,
  updatedAt: true,
  views: true,
  category: { select: { id: true, name: true, slug: true } },
} as const;

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const posts = await prisma.post.findMany({
      where: { deletedAt: null },
      select: LIST_SELECT,
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json({ posts }, { headers: NO_STORE_HEADERS });
  } catch (err) {
    console.error("[posts] GET failed:", (err as Error).message);
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const session = await requireAdmin(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = adminPostSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  try {
    const slugExists = await prisma.post.findUnique({
      where: { slug: parsed.data.slug },
    });
    if (slugExists) {
      return NextResponse.json({ error: "A post with this slug already exists." }, { status: 409 });
    }

    const scheduledDate = parsed.data.scheduledAt ? new Date(parsed.data.scheduledAt) : null;
    const isScheduled = scheduledDate && scheduledDate > new Date();

    const post = await prisma.post.create({
      data: {
        title: parsed.data.title,
        slug: parsed.data.slug,
        excerpt: parsed.data.excerpt || null,
        content: sanitizeHtml(parsed.data.content),
        coverImage: parsed.data.coverImage || null,
        featured: parsed.data.featured ?? false,
        published: isScheduled ? false : (parsed.data.published ?? true),
        publishedAt: isScheduled ? scheduledDate! : new Date(),
        scheduledAt: isScheduled ? scheduledDate : null,
        authorId: session.user.id,
        categoryId: parsed.data.categoryId || null,
        kicker: parsed.data.kicker || null,
        showCover: parsed.data.showCover ?? true,
        showAuthorBox: parsed.data.showAuthorBox ?? true,
        footerNote: parsed.data.footerNote || null,
      },
    });

    await revalidatePublic();
    return NextResponse.json({ post }, { status: 201 });
  } catch (err) {
    if ((err as { code?: string }).code === "P2002") {
      return NextResponse.json({ error: "A post with this slug already exists." }, { status: 409 });
    }
    console.error("[posts] POST failed:", (err as Error).message);
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }
}

export async function PUT(request: Request) {
  const session = await requireAdmin(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const body = await request.json().catch(() => null);
  const parsed = adminPostSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  try {
    const slugExists = await prisma.post.findFirst({
      where: { slug: parsed.data.slug, NOT: { id } },
    });
    if (slugExists) {
      return NextResponse.json({ error: "A post with this slug already exists." }, { status: 409 });
    }

    const scheduledDate = parsed.data.scheduledAt ? new Date(parsed.data.scheduledAt) : null;
    const isScheduled = scheduledDate && scheduledDate > new Date();

    const post = await prisma.post.update({
      where: { id },
      data: {
        title: parsed.data.title,
        slug: parsed.data.slug,
        excerpt: parsed.data.excerpt || null,
        content: sanitizeHtml(parsed.data.content),
        coverImage: parsed.data.coverImage || null,
        featured: parsed.data.featured ?? false,
        published: isScheduled ? false : (parsed.data.published ?? true),
        publishedAt: isScheduled ? scheduledDate! : new Date(),
        scheduledAt: isScheduled ? scheduledDate : null,
        categoryId: parsed.data.categoryId || null,
        kicker: parsed.data.kicker || null,
        showCover: parsed.data.showCover ?? true,
        showAuthorBox: parsed.data.showAuthorBox ?? true,
        footerNote: parsed.data.footerNote || null,
      },
    });

    await revalidatePublic();
    return NextResponse.json({ post });
  } catch (err) {
    if ((err as { code?: string }).code === "P2025") {
      return NextResponse.json({ error: "Post not found." }, { status: 404 });
    }
    if ((err as { code?: string }).code === "P2002") {
      return NextResponse.json({ error: "A post with this slug already exists." }, { status: 409 });
    }
    console.error("[posts] PUT failed:", (err as Error).message);
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }
}

export async function DELETE(request: Request) {
  const session = await requireAdmin(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  try {
    // Soft delete: the public site filters `deletedAt: null`, so the post
    // disappears from the site while the row (comments, audit trail) survives.
    const result = await prisma.post.update({
      where: { id },
      data: { deletedAt: new Date() },
      select: { id: true },
    });
    if (!result) return NextResponse.json({ error: "Post not found." }, { status: 404 });

    await revalidatePublic();
    return NextResponse.json({ ok: true });
  } catch (err) {
    if ((err as { code?: string }).code === "P2025") {
      return NextResponse.json({ error: "Post not found." }, { status: 404 });
    }
    console.error("[posts] DELETE failed:", (err as Error).message);
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }
}