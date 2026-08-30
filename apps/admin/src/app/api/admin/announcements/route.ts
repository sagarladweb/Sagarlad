import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { requireAdmin } from "@/lib/requireAdmin";
import { revalidatePublic } from "@/lib/revalidate";

export const runtime = "nodejs";

const fullSchema = z.object({
  id: z.string().nullable().optional(),
  title: z.string().min(1).max(200),
  description: z.string().max(2000).nullable().optional(),
  imageUrl: z.string().max(500).nullable().optional(),
  buttonText: z.string().max(100).nullable().optional(),
  buttonLink: z.string().max(500).nullable().optional(),
  barText: z.string().max(200).nullable().optional(),
  barLink: z.string().max(500).nullable().optional(),
  barStyle: z.string().optional().default("scrolling"),
  barSpeed: z.coerce.number().int().min(10).max(60).optional().default(30),
  active: z.boolean().optional().default(false),
  eventDate: z.string().nullable().optional(),
});

const toggleSchema = z.object({
  id: z.string(),
  active: z.boolean(),
});

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const announcements = await prisma.announcement.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ announcements });
}

export async function POST(request: Request) {
  const session = await requireAdmin(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const raw = await request.json().catch(() => ({}));

  const toggleParsed = toggleSchema.safeParse(raw);
  if (toggleParsed.success) {
    const { id, active } = toggleParsed.data;
    const announcement = await prisma.announcement.update({
      where: { id },
      data: { active },
    });
    try { await revalidatePublic(); } catch {}
    return NextResponse.json({ announcement });
  }

  const parsed = fullSchema.safeParse(raw);
  if (!parsed.success) {
    const flat = parsed.error.flatten().fieldErrors;
    const msg = Object.entries(flat)
      .map(([k, v]) => `${k}: ${v?.join(", ")}`)
      .join("; ");
    console.error("[announcements] validation:", msg);
    return NextResponse.json({ error: msg || "Validation failed" }, { status: 400 });
  }

  const { id: rawId, ...data } = parsed.data;
  const id = rawId || undefined;

  // Convert eventDate string to Date or null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dbData: any = { ...data };
  dbData.eventDate = data.eventDate ? new Date(data.eventDate) : null;

  let announcement;
  try {
    if (id) {
      announcement = await prisma.announcement.update({ where: { id }, data: dbData });
    } else {
      announcement = await prisma.announcement.create({ data: dbData });
    }
  } catch (err) {
    console.error("[announcements] db:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "DB error" }, { status: 500 });
  }

  try { await revalidatePublic(); } catch {}
  return NextResponse.json({ announcement });
}

export async function DELETE(request: Request) {
  const session = await requireAdmin(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  await prisma.announcement.delete({ where: { id } });
  try { await revalidatePublic(); } catch {}
  return NextResponse.json({ ok: true });
}
