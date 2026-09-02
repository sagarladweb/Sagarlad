import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/requireAdmin";
import { buildTemplateBody, type NewsletterContent } from "@/lib/newsletterTemplates";

export const runtime = "nodejs";

const draftSchema = z.object({
  id: z.string().optional(),
  subject: z.string().trim().max(200).default(""),
  content: z.unknown(),
});

// Save (or update) an unsent newsletter so the admin can come back to it later.
export async function POST(request: Request) {
  const session = await requireAdmin(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = draftSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid draft" }, { status: 400 });
  }

  try {
    const content = parsed.data.content as NewsletterContent;
    const html = buildTemplateBody(content.template ?? "letter", content);

    if (parsed.data.id) {
      const existing = await prisma.newsletterCampaign.findFirst({
        where: { id: parsed.data.id, draft: true },
        select: { id: true },
      });
      if (!existing) {
        return NextResponse.json({ error: "Draft not found" }, { status: 404 });
      }
      const campaign = await prisma.newsletterCampaign.update({
        where: { id: existing.id },
        data: {
          subject: parsed.data.subject,
          html,
          contentJson: content as object,
        },
      });
      return NextResponse.json({ campaign });
    }

    const campaign = await prisma.newsletterCampaign.create({
      data: {
        subject: parsed.data.subject,
        html,
        contentJson: content as object,
        draft: true,
      },
    });
    return NextResponse.json({ campaign }, { status: 201 });
  } catch (err) {
    console.error("[drafts] POST failed:", (err as Error).message);
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }
}

// Drop a draft.
export async function DELETE(request: Request) {
  const session = await requireAdmin(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  try {
    await prisma.newsletterCampaign.deleteMany({ where: { id, draft: true } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[drafts] DELETE failed:", (err as Error).message);
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }
}