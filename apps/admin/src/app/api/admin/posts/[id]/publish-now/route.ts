import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { revalidatePublic } from "@/lib/revalidate";
import { requireAdmin } from "@/lib/requireAdmin";

export const runtime = "nodejs";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin(_request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const post = await prisma.post.findUnique({
      where: { id },
      select: { id: true, published: true, scheduledAt: true },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found." }, { status: 404 });
    }

    if (post.published && !post.scheduledAt) {
      return NextResponse.json({ error: "Post is already published." }, { status: 400 });
    }

    const now = new Date();
    await prisma.post.update({
      where: { id },
      data: {
        published: true,
        publishedAt: now,
        scheduledAt: null,
      },
    });

    await revalidatePublic();
    return NextResponse.json({ ok: true, publishedAt: now.toISOString() });
  } catch (err) {
    console.error("[publish-now] failed:", (err as Error).message);
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }
}
