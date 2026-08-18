import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

import { requireAdmin } from "@/lib/requireAdmin";
import { revalidatePublic } from "@/lib/revalidate";
export const runtime = "nodejs";

const quoteSchema = z.object({
  id: z.string().optional(),
  text: z.string().trim().min(1).max(500),
  tag: z.string().trim().min(1).max(50),
});

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const quotes = await prisma.quote.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ quotes });
}

export async function POST(request: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = quoteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Missing or invalid fields" }, { status: 400 });
  }
  const { id, ...data } = parsed.data;
  if (id) {
    return NextResponse.json({ error: "Use PUT to update" }, { status: 400 });
  }
  const quote = await prisma.quote.create({ data });
  revalidatePublic();
  return NextResponse.json({ quote }, { status: 201 });
}

export async function PUT(request: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = quoteSchema.safeParse(body);
  if (!parsed.success || !parsed.data.id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }
  const { id, ...data } = parsed.data;
  const quote = await prisma.quote.update({ where: { id }, data });
  revalidatePublic();
  return NextResponse.json({ quote });
}

export async function DELETE(request: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await prisma.quote.delete({ where: { id } });
  revalidatePublic();
  return NextResponse.json({ ok: true });
}