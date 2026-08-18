import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

import { requireAdmin } from "@/lib/requireAdmin";
import { revalidatePublic } from "@/lib/revalidate";
export const runtime = "nodejs";

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [subscribers, comments, enquiries] = await Promise.all([
    prisma.newsletterSubscriber.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, email: true, unsubscribed: true, createdAt: true },
    }),
    prisma.comment.findMany({
      include: { post: { select: { title: true, slug: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.contactRequest.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  return NextResponse.json({ subscribers, comments, enquiries });
}

export async function PATCH(request: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const schema = z.object({
    kind: z.enum(["subscriber", "comment", "enquiry"]),
    id: z.string().min(1).optional(),
    ids: z.array(z.string().min(1)).optional(),
    action: z.enum(["delete"]),
  });
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const ids = parsed.data.ids ?? (parsed.data.id ? [parsed.data.id] : []);
  if (!ids.length) return NextResponse.json({ error: "No ids" }, { status: 400 });

  if (parsed.data.action !== "delete") {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  if (parsed.data.kind === "subscriber") {
    await prisma.newsletterSubscriber.deleteMany({ where: { id: { in: ids } } });
  } else if (parsed.data.kind === "comment") {
    await prisma.comment.deleteMany({ where: { id: { in: ids } } });
  } else if (parsed.data.kind === "enquiry") {
    await prisma.contactRequest.deleteMany({ where: { id: { in: ids } } });
  }

  if (parsed.data.kind === "comment") revalidatePublic();
  return NextResponse.json({ ok: true });
}