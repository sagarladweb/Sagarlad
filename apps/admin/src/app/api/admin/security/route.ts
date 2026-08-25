import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { prisma } from "@/lib/db";
import {
  generateTotpSecret,
  totpUri,
  verifyTotp,
  generateRecoveryCodes,
} from "@/lib/totp";
import { requireAdmin } from "@/lib/requireAdmin";
import { logAudit } from "@/lib/audit";
import { z } from "zod";

export const runtime = "nodejs";

const actionSchema = z.object({
  action: z.enum(["setup", "enable", "disable"]),
  secret: z.string().trim().optional(),
  token: z.string().trim().optional(),
});

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  return NextResponse.json({
    enabled: Boolean(user?.twoFactorEnabled),
  });
}

export async function POST(request: Request) {
  const session = await requireAdmin(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id as string;

  const body = await request.json().catch(() => null);
  const parsed = actionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const { action, secret, token } = parsed.data;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (action === "setup") {
    if (user.twoFactorEnabled) {
      return NextResponse.json({ error: "2FA is already enabled" }, { status: 409 });
    }
    const newSecret = generateTotpSecret();
    const email = user.email ?? "admin@sagarlad.com";
    const uri = totpUri(newSecret, email);
    const qrDataUrl = await QRCode.toDataURL(uri, {
      width: 280,
      margin: 2,
      errorCorrectionLevel: "M",
    });
    return NextResponse.json({ secret: newSecret, uri, qr: qrDataUrl });
  }

  if (action === "enable") {
    if (user.twoFactorEnabled) {
      return NextResponse.json({ error: "2FA is already enabled" }, { status: 409 });
    }
    if (!secret || !token) {
      return NextResponse.json({ error: "Secret and code are required" }, { status: 400 });
    }
    if (!verifyTotp(token, secret)) {
      return NextResponse.json({ error: "Invalid code. Please try again." }, { status: 400 });
    }
    const recoveryCodes = generateRecoveryCodes();
    await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: true,
        twoFactorSecret: secret,
        twoFactorRecovery: recoveryCodes.join(","),
      },
    });
    await logAudit("2FA_SETUP", { userId });
    return NextResponse.json({ ok: true, recoveryCodes });
  }

  // action === "disable"
  if (!user.twoFactorSecret) {
    return NextResponse.json({ ok: true });
  }
  if (!token) {
    return NextResponse.json({ error: "Authentication code is required" }, { status: 400 });
  }
  if (!verifyTotp(token, user.twoFactorSecret)) {
    return NextResponse.json({ error: "Invalid code. Please try again." }, { status: 400 });
  }
  await prisma.user.update({
    where: { id: userId },
    data: { twoFactorEnabled: false, twoFactorSecret: null, twoFactorRecovery: null },
  });
  await logAudit("2FA_DISABLE", { userId });
  return NextResponse.json({ ok: true });
}