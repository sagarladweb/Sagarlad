import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare, hash } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { isDbDown, markDbDown } from "@sagarlad/db";
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

export class DatabaseUnavailableError extends CredentialsSignin {
  code = "DB_UNAVAILABLE";
}

function getIp(authRequest: { headers?: Headers } | undefined) {
  const xff = authRequest?.headers?.get("x-forwarded-for");
  const ip = xff ? xff.split(",")[0].trim() : "unknown";
  return ip.length > 64 ? ip.slice(0, 64) : ip;
}

// Cache the bcrypt hash of the env admin password so we don't recompute
// it on every login when DB is down (bcrypt with 12 rounds takes ~2s).
let envAdminHashCache: string | null = null;
async function getEnvAdminHash(): Promise<string> {
  if (envAdminHashCache) return envAdminHashCache;
  const envAdminPass = process.env.ADMIN_PASSWORD?.replace(/['"]/g, "").trim();
  if (!envAdminPass) return "";
  envAdminHashCache = await hash(envAdminPass, 12);
  return envAdminHashCache;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24, // 24 hours
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

        let user: {
          id: string;
          name: string | null;
          email: string;
          image: string | null;
          role: string;
          passwordHash: string | null;
          twoFactorEnabled: boolean;
          twoFactorSecret: string | null;
          twoFactorRecovery: string | null;
        } | null = null;
        let valid = false;
        let dbDown = false;

        // Environment admin credentials (used as fallback when DB is down).
        const envAdminEmail = (process.env.ADMIN_EMAIL ?? "")
          .replace(/['"]/g, "")
          .trim()
          .toLowerCase();
        const envAdminPass = process.env.ADMIN_PASSWORD?.replace(/['"]/g, "").trim();

        // If DB is known down, skip all DB queries and go straight to env fallback.
        if (isDbDown()) {
          dbDown = true;
        } else {
          try {
            user = await prisma.user.findUnique({ where: { email } });
            valid =
              Boolean(user?.passwordHash) &&
              (await compare(password, user?.passwordHash ?? ""));

            // Environment bootstrap:
            // If DB auth fails and user doesn't exist, create from env credentials.
            // No plaintext comparison — password is hashed via bcrypt before storage.
            if (!valid && envAdminPass && email === envAdminEmail && !user) {
              const passwordHash = await getEnvAdminHash();
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
              valid = await compare(password, user.passwordHash!);
            }
          } catch (err) {
            markDbDown();
            console.warn("[auth] DB lookup failed during login:", (err as Error).message);
            dbDown = true;
          }
        }

        // Fallback: if DB is unreachable but env credentials match, allow login
        // without DB interaction. This keeps the admin panel usable during
        // Supabase free-tier pauses or transient outages.
        if (dbDown && !valid && envAdminPass && email === envAdminEmail) {
          const envHash = await getEnvAdminHash();
          valid = await compare(password, envHash);
          if (valid) {
            user = {
              id: "env-bootstrap",
              name: "Sagar Lad",
              email: envAdminEmail,
              image: null,
              role: "ADMIN",
              passwordHash: envHash,
              twoFactorEnabled: false,
              twoFactorSecret: null,
              twoFactorRecovery: null,
            };
            // Try to persist the user in the DB for next time (fire-and-forget).
            prisma.user
              .upsert({
                where: { email: envAdminEmail },
                update: { passwordHash: envHash, role: "ADMIN" },
                create: {
                  email: envAdminEmail,
                  name: "Sagar Lad",
                  passwordHash: envHash,
                  role: "ADMIN",
                },
              })
              .catch(() => {});
          }
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

        // Fire-and-forget: don't await these when DB is down — they'd block
        // the response for 1.5s each waiting for a connection timeout.
        if (!isDbDown()) {
          prisma.user
            .update({
              where: { id: user.id },
              data: { lastLoginAt: new Date(), lastLoginIp: ip },
            })
            .catch(() => {});
          logAudit("LOGIN_OK", { userId: user.id, ip });
        }

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
        // Always populate from the JWT first so the session is usable even if
        // the DB is transiently unreachable (Supabase free-tier pauses, etc.).
        // The DB lookup below enriches with fresh data but is not required for
        // the session to carry the correct role.
        session.user.id = token.id as string;
        session.user.role = token.role as string;

        // A JWT can outlive its account (e.g. after a DB reset), which used to
        // surface as a cryptic FK error on save. Resolve the id against the DB
        // and drop the session if the account no longer exists so the user is
        // cleanly sent back to sign in instead of failing mid-edit. If the DB
        // is transiently unreachable, keep the existing session rather than
        // logging the user out.
        if (!isDbDown()) {
          try {
            // Try by id first; fall back to email for env-bootstrap JWTs
            // (which hardcode id "env-bootstrap" that doesn't exist in DB).
            let user = await prisma.user.findUnique({
              where: { id: token.id as string },
              select: { id: true, role: true, name: true, email: true, image: true },
            });
            if (!user && session.user.email) {
              user = await prisma.user.findUnique({
                where: { email: session.user.email },
                select: { id: true, role: true, name: true, email: true, image: true },
              });
            }
            if (!user) return null as never; // drops the session -> auth() returns null -> clean re-login
            // Enrich with fresh DB data (role could have changed since JWT was issued).
            session.user.id = user.id;
            session.user.role = user.role;
            session.user.name = user.name;
            session.user.email = user.email;
            session.user.image = user.image;
          } catch (err) {
            markDbDown();
            console.warn("[auth] session DB lookup failed, keeping existing session:", (err as Error).message);
          }
        }
      }
      return session;
    },
  },
});