import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

import { requireAdmin } from "@/lib/requireAdmin";
import { revalidatePublic } from "@/lib/revalidate";
export const runtime = "nodejs";

const socialSchema = z.object({
  id: z.string().optional(),
  key: z.string().trim().min(1).max(50).optional(),
  label: z.string().trim().min(1).max(100),
  handle: z.string().trim().max(100).nullable().optional(),
  href: z.string().trim().url(),
  icon: z.string().trim().min(1).max(50),
  logoUrl: z.string().trim().max(500).nullable().optional(),
  color: z.string().trim().max(50).nullable().optional(),
  sortOrder: z.number().int().optional(),
  active: z.boolean().optional(),
});

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const socials = await prisma.socialLink.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
  return NextResponse.json({ socials });
}

// Social links are update-only: the brand's set of links is fixed in code, so
// admin can refine the details but must not create or delete entries.
export async function PUT(request: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = socialSchema.safeParse(body);
  if (!parsed.success || !parsed.data.id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }
  const { id, ...data } = parsed.data;
  const social = await prisma.socialLink.update({ where: { id }, data });
  revalidatePublic();
  return NextResponse.json({ social });
}
