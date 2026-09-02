import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

import { requireAdmin } from "@/lib/requireAdmin";
import { revalidatePublic } from "@/lib/revalidate";
export const runtime = "nodejs";

const bookSchema = z.object({
  id: z.string().optional(),
  type: z.enum(["PUBLISHED", "READ", "EBOOK"]).optional(),
  title: z.string().trim().min(1).max(200),
  author: z.string().trim().max(300).optional().nullable(),
  tagline: z.string().trim().max(300).optional().nullable(),
  description: z.string().trim().max(2000).optional().nullable(),
  learning: z.string().trim().max(2000).optional().nullable(),
  note: z.string().trim().max(500).optional().nullable(),
  imageUrl: z.string().trim().url().optional().nullable(),
  buyUrl: z.string().trim().url().optional().nullable(),
  fileKey: z.string().trim().max(300).optional().nullable(),
  free: z.boolean().optional(),
  featured: z.boolean().optional(),
  published: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
  currentlyReading: z.boolean().optional(),
});

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const books = await prisma.book.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });
    return NextResponse.json({ books });
  } catch (err) {
    console.error("[books] GET failed:", (err as Error).message);
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const session = await requireAdmin(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = bookSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Missing or invalid fields" }, { status: 400 });
  }
  const { id, ...data } = parsed.data;
  if (id) {
    return NextResponse.json({ error: "Use PUT to update" }, { status: 400 });
  }
  try {
    const book = await prisma.book.create({ data });
    revalidatePublic();
    return NextResponse.json({ book }, { status: 201 });
  } catch (err) {
    console.error("[books] POST failed:", (err as Error).message);
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }
}

export async function PUT(request: Request) {
  const session = await requireAdmin(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = bookSchema.safeParse(body);
  if (!parsed.success || !parsed.data.id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }
  const { id, ...data } = parsed.data;
  try {
    const book = await prisma.book.update({ where: { id }, data });
    revalidatePublic();
    return NextResponse.json({ book });
  } catch (err) {
    console.error("[books] PUT failed:", (err as Error).message);
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
    await prisma.book.delete({ where: { id } });
    revalidatePublic();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[books] DELETE failed:", (err as Error).message);
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }
}