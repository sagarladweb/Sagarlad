import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare, hash } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { verifyTotp, matchRecoveryCode, consumeRecoveryCode } from "@/lib/totp";
import { logAudit } from "@/lib/audit";
import {
  loginThrottleStatus,
  rateLimitByIp,
} from "@/lib/rate-limit";

const credentialsSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1).max(200),
  otp: z.string().trim().optional(),
});

export class TwoFactorRequired extends CredentialsSignin {
  code = "2FA_REQUIRED";
}

export class AccountLockedError extends CredentialsSignin {
  code = "ACCOUNT_LOCKED";
}

function getIp(authRequest: { headers?: Headers } | undefined) {
  const xff = authRequest?.headers?.get("x-forwarded-for");
  const ip = xff ? xff.split(",")[0].trim() : "unknown";
  return ip.length > 64 ? ip.slice(0, 64) : ip;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60, // refresh every hour
  },
  trustHost: true,
  pages: {
    signIn: "/admin",
  },
  cookies: {
    sessionToken: {
      options: {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
      },
    },
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        otp: { label: "2FA code", type: "text" },
      },
      authorize: async (credentials, authRequest) => {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) {
          await logAudit("LOGIN_FAIL", { ip: getIp(authRequest) });
          return null;
        }
        const { email, password, otp } = parsed.data;
        const ip = getIp(authRequest);

        // Per-IP flood guard: scripts spray many emails — lock the source IP
        // down too, not just the account.
        const ipStatus = rateLimitByIp(ip, 10, 60_000);
        if (!ipStatus.ok) {
          await logAudit("LOGIN_THROTTLED", { ip, meta: { email } });
          throw new AccountLockedError();
        }

        // Lockout: count recent failures for this account + source IP (audit
        // trail is DB-backed, so it works across serverless instances).
        const status = await loginThrottleStatus(email, ip);
        if (status.locked) {
          await logAudit("LOGIN_LOCKED", { ip, meta: { email } });
          throw new AccountLockedError();
        }

        let user = await prisma.user.findUnique({ where: { email } });
        let valid =
          user?.passwordHash && (await compare(password, user.passwordHash));

        // Fallback: If credentials match ADMIN_EMAIL & ADMIN_PASSWORD env vars,
        // auto-provision/update the admin user in Supabase database.
        const envAdminEmail = (process.env.ADMIN_EMAIL ?? "sagarlad692@gmail.com")
          .replace(/['"]/g, "")
          .trim()
          .toLowerCase();
        const envAdminPass = process.env.ADMIN_PASSWORD?.replace(/['"]/g, "").trim();

        if (!valid && email === envAdminEmail && envAdminPass && password === envAdminPass) {
          const passwordHash = await hash(password, 12);
          user = await prisma.user.upsert({
            where: { email },
            update: { passwordHash, role: "ADMIN" },
            create: {
              email,
              name: "Sagar Lad",
              passwordHash,
              role: "ADMIN",
            },
          });
          valid = true;
        }

        if (!user || !user.passwordHash || !valid) {
          await logAudit("LOGIN_FAIL", { ip, meta: { email } });
          return null;
        }

        // Strictly restrict admin panel access to ADMIN role only
        if (user.role !== "ADMIN") {
          await logAudit("LOGIN_FAIL", { ip, meta: { email, reason: "NOT_ADMIN" } });
          return null;
        }

        // Two-factor authentication (required if enabled).
        if (user.twoFactorEnabled) {
          const totpOk = otp && verifyTotp(otp, user.twoFactorSecret);
          const recovery = !totpOk ? matchRecoveryCode(user.twoFactorRecovery, otp ?? "") : null;

          if (totpOk || recovery) {
            if (recovery) {
              await prisma.user
                .update({
                  where: { id: user.id },
                  data: { twoFactorRecovery: consumeRecoveryCode(user.twoFactorRecovery, recovery) },
                })
                .catch(() => {});
            }
          } else {
            if (otp) {
              await logAudit("LOGIN_FAIL", { userId: user.id, ip, meta: { email, reason: "2FA" } });
            }
            throw new TwoFactorRequired();
          }
        }

        await prisma.user
          .update({
            where: { id: user.id },
            data: { lastLoginAt: new Date(), lastLoginIp: ip },
          })
          .catch(() => {});
        await logAudit("LOGIN_OK", { userId: user.id, ip });

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = (user as { role: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        // A JWT can outlive its account (e.g. after a DB reset), which used to
        // surface as a cryptic FK error on save. Resolve the id against the DB
        // and drop the session if the account no longer exists so the user is
        // cleanly sent back to sign in instead of failing mid-edit.
        const user = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { id: true, role: true, name: true, email: true, image: true },
        });
        if (!user) return null as never; // drops the session -> auth() returns null -> clean re-login
        session.user.id = user.id;
        session.user.role = user.role;
        session.user.name = user.name;
        session.user.email = user.email;
        session.user.image = user.image;
      }
      return session;
    },
  },
});