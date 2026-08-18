import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

import { requireAdmin } from "@/lib/requireAdmin";
import { revalidatePublic } from "@/lib/revalidate";
import { slugify } from "@/lib/site";
export const runtime = "nodejs";

const categorySchema = z.object({
  name: z.string().trim().min(2).max(60),
});

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const categories = await prisma.category.findMany({
    include: {
      _count: { select: { posts: true, videos: true } },
      posts: {
        select: { id: true, title: true },
        orderBy: { createdAt: "desc" },
        take: 50,
      },
      videos: {
        select: { id: true, title: true },
        orderBy: { createdAt: "desc" },
        take: 50,
      },
    },
    orderBy: { name: "asc" },
  });
  return NextResponse.json({ categories });
}

export async function POST(request: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = categorySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid category name" }, { status: 400 });
  }

  const slug = slugify(parsed.data.name);
  const exists = await prisma.category.findUnique({ where: { slug } });
  if (exists) {
    return NextResponse.json({ error: "Category already exists" }, { status: 409 });
  }

  const category = await prisma.category.create({
    data: { name: parsed.data.name, slug },
  });
  revalidatePublic();
  return NextResponse.json({ category }, { status: 201 });
}

export async function PUT(request: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = categorySchema.safeParse(body);
  const id = typeof body?.id === "string" ? body.id.trim() : "";
  if (!parsed.success || !id) {
    return NextResponse.json({ error: "Invalid category name" }, { status: 400 });
  }

  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  const slug = slugify(parsed.data.name);
  const slugTaken = await prisma.category.findFirst({
    where: { slug, id: { not: id } },
  });
  if (slugTaken) {
    return NextResponse.json({ error: "Another category already has that name" }, { status: 409 });
  }

  const updated = await prisma.category.update({
    where: { id },
    data: { name: parsed.data.name, slug },
  });
  revalidatePublic();
  return NextResponse.json({ category: updated });
}

export async function DELETE(request: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await prisma.category.delete({ where: { id } });
  revalidatePublic();
  return NextResponse.json({ ok: true });
}