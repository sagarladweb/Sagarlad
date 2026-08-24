import { NextResponse } from "next/server";
import { compare, hash } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/requireAdmin";
import { logAudit } from "@/lib/audit";
import { revalidatePublic } from "@/lib/revalidate";

export const runtime = "nodejs";

const bodySchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("profile"),
    name: z.string().trim().max(120).nullable().optional().or(z.literal("")),
    image: z.string().trim().max(5000).nullable().optional().or(z.literal("")),
  }),
  z.object({
    action: z.literal("password"),
    currentPassword: z.string().min(1, "Current password is required").max(200),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters")
      .max(200),
  }),
  z.object({
    action: z.literal("email"),
    currentPassword: z.string().min(1, "Current password is required").max(200),
    newEmail: z.string().trim().toLowerCase().email("Please enter a valid email"),
  }),
]);

export async function PATCH(request: Request) {
  const session = await requireAdmin();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  if (parsed.data.action === "profile") {
    const { name, image } = parsed.data;
    await prisma.user.update({
      where: { id: user.id },
      data: {
        name: name?.trim() ? name.trim() : null,
        image: image?.trim() ? image.trim() : null,
      },
    });
    await logAudit("PROFILE_UPDATE", { userId: user.id });
    revalidatePublic();
    return NextResponse.json({ ok: true, name: name?.trim() || null, image: image?.trim() || null });
  }

  const passwordOk =
    user.passwordHash && (await compare(parsed.data.currentPassword, user.passwordHash));
  if (!passwordOk) {
    return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
  }

  if (parsed.data.action === "password") {
    const passwordHash = await hash(parsed.data.newPassword, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });
    await logAudit("PASSWORD_CHANGE", { userId: user.id });
    return NextResponse.json({ ok: true });
  }

  // email change
  const exists = await prisma.user.findUnique({
    where: { email: parsed.data.newEmail },
    select: { id: true },
  });
  if (exists) {
    return NextResponse.json({ error: "That email is already in use" }, { status: 409 });
  }
  await prisma.user.update({
    where: { id: user.id },
    data: { email: parsed.data.newEmail },
  });
  await logAudit("PROFILE_UPDATE", { userId: user.id, meta: { action: "email" } });
  return NextResponse.json({ ok: true });
}