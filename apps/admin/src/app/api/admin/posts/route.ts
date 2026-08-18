import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { adminPostSchema } from "@/lib/validations";
import { sanitizeHtml } from "@/lib/sanitize";
import { revalidatePublic } from "@/lib/revalidate";

import { requireAdmin } from "@/lib/requireAdmin";
export const runtime = "nodejs";

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const posts = await prisma.post.findMany({
    include: { category: true },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json({ posts });
}

export async function POST(request: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = adminPostSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const slugExists = await prisma.post.findUnique({
    where: { slug: parsed.data.slug },
  });
  if (slugExists) {
    return NextResponse.json({ error: "A post with this slug already exists." }, { status: 409 });
  }

  const post = await prisma.post.create({
    data: {
      title: parsed.data.title,
      slug: parsed.data.slug,
      excerpt: parsed.data.excerpt || null,
      content: sanitizeHtml(parsed.data.content),
      coverImage: parsed.data.coverImage || null,
      featured: parsed.data.featured ?? false,
      published: parsed.data.published ?? true,
      publishedAt: parsed.data.publishedAt
        ? new Date(parsed.data.publishedAt)
        : new Date(),
      authorId: session.user.id,
      categoryId: parsed.data.categoryId || null,
      kicker: parsed.data.kicker || null,
      showCover: parsed.data.showCover ?? true,
      showAuthorBox: parsed.data.showAuthorBox ?? true,
      footerNote: parsed.data.footerNote || null,
    },
  });

  revalidatePublic();
  return NextResponse.json({ post }, { status: 201 });
}

export async function PUT(request: Request) {
  const session = await requireAdmin();
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

  const slugExists = await prisma.post.findFirst({
    where: { slug: parsed.data.slug, NOT: { id } },
  });
  if (slugExists) {
    return NextResponse.json({ error: "A post with this slug already exists." }, { status: 409 });
  }

  const post = await prisma.post.update({
    where: { id },
    data: {
      title: parsed.data.title,
      slug: parsed.data.slug,
      excerpt: parsed.data.excerpt || null,
      content: sanitizeHtml(parsed.data.content),
      coverImage: parsed.data.coverImage || null,
      featured: parsed.data.featured ?? false,
      published: parsed.data.published ?? true,
      publishedAt: parsed.data.publishedAt ? new Date(parsed.data.publishedAt) : undefined,
      categoryId: parsed.data.categoryId || null,
      kicker: parsed.data.kicker || null,
      showCover: parsed.data.showCover ?? true,
      showAuthorBox: parsed.data.showAuthorBox ?? true,
      footerNote: parsed.data.footerNote || null,
    },
  });

  revalidatePublic();
  return NextResponse.json({ post });
}

export async function DELETE(request: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await prisma.post.delete({ where: { id } });
  revalidatePublic();
  return NextResponse.json({ ok: true });
}