import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/requireAdmin";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const sinceParam = searchParams.get("since");
  const since = sinceParam ? new Date(sinceParam) : new Date(0);

  const [comments, subscribers, enquiries] = await Promise.all([
    prisma.comment.count({ where: { createdAt: { gt: since } } }),
    prisma.newsletterSubscriber.count({ where: { createdAt: { gt: since } } }),
    prisma.contactRequest.count({ where: { createdAt: { gt: since } } }),
  ]);

  return NextResponse.json({ comments, subscribers, enquiries, total: comments + subscribers + enquiries });
}
