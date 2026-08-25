import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

import { requireAdmin } from "@/lib/requireAdmin";
import { revalidatePublic } from "@/lib/revalidate";
import { normalizeVideoUrl } from "@/lib/video";
export const runtime = "nodejs";

// embedUrl is intentionally lenient (any non-empty string): the admin may
// paste a plain link, an embed URL, or a full <iframe> snippet. It is
// normalized to the canonical embed URL in the handler below — the strict
// `z.url()` that caused "Missing or invalid fields" is gone.
const videoSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(1).max(200),
  slug: z.string().trim().max(200).optional().nullable(),
  embedUrl: z.string().trim().min(1).max(2000).optional(),
  thumbnail: z.string().trim().url().optional().nullable(),
  content: z.string().trim().max(100_000).optional().nullable(),
  layout: z.enum(["video-first", "text-first", "split"]).optional(),
  published: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
  categoryId: z.string().trim().optional().nullable(),
});

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const videos = await prisma.video.findMany({
    include: { category: { select: { id: true, name: true, slug: true } } },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
  return NextResponse.json({ videos });
}

export async function POST(request: Request) {
  const session = await requireAdmin(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = videoSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Missing or invalid fields" }, { status: 400 });
  }
  const { id, ...data } = parsed.data;
  if (id) {
    return NextResponse.json({ error: "Use PUT to update" }, { status: 400 });
  }
  if (!data.embedUrl) {
    return NextResponse.json({ error: "embedUrl is required" }, { status: 400 });
  }
  const norm = normalizeVideoUrl(data.embedUrl);
  if (!norm) {
    return NextResponse.json(
      { error: "That doesn't look like a YouTube or Instagram link." },
      { status: 400 }
    );
  }
  const video = await prisma.video.create({ data: { ...data, embedUrl: norm.url } });
  revalidatePublic();
  return NextResponse.json({ video }, { status: 201 });
}

export async function PUT(request: Request) {
  const session = await requireAdmin(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = videoSchema.safeParse(body);
  if (!parsed.success) {
    const fields = Object.keys(parsed.error.flatten().fieldErrors);
    return NextResponse.json(
      { error: `Invalid fields: ${fields.join(", ") || "unknown"}` },
      { status: 400 }
    );
  }
  if (!parsed.data.id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }
  const { id, ...data } = parsed.data;
  if (data.embedUrl) {
    const norm = normalizeVideoUrl(data.embedUrl);
    if (!norm) {
      return NextResponse.json(
        { error: "That doesn't look like a YouTube or Instagram link." },
        { status: 400 }
      );
    }
    data.embedUrl = norm.url;
  }
  const video = await prisma.video.update({ where: { id }, data });
  revalidatePublic();
  return NextResponse.json({ video });
}

export async function DELETE(request: Request) {
  const session = await requireAdmin(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await prisma.video.delete({ where: { id } });
  revalidatePublic();
  return NextResponse.json({ ok: true });
}