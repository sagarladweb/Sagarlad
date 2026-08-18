import { prisma } from "@/lib/db";

export type AuditAction =
  | "LOGIN_OK"
  | "LOGIN_FAIL"
  | "LOGIN_LOCKED"
  | "LOGIN_THROTTLED"
  | "2FA_SETUP"
  | "2FA_DISABLE"
  | "PASSWORD_CHANGE"
  | "POST_CREATE"
  | "POST_UPDATE"
  | "POST_DELETE"
  | "QUOTE_CREATE"
  | "QUOTE_UPDATE"
  | "QUOTE_DELETE"
  | "BOOK_CREATE"
  | "BOOK_UPDATE"
  | "BOOK_DELETE"
  | "VIDEO_CREATE"
  | "VIDEO_UPDATE"
  | "VIDEO_DELETE"
  | "CATEGORY_CREATE"
  | "CATEGORY_DELETE"
  | "COMMENT_APPROVE"
  | "COMMENT_DELETE"
  | "SUBSCRIBER_DELETE"
  | "REQUEST_DELETE"
  | "CONTACT"
  | "NEWSLETTER"
  | "EBOOK_DOWNLOAD"
  | "UPLOAD";

export async function logAudit(
  action: AuditAction,
  opts: {
    userId?: string | null;
    ip?: string | null;
    meta?: Record<string, unknown> | null;
  } = {}
) {
  try {
    await prisma.auditLogEntry.create({
      data: {
        action,
        userId: opts.userId ?? null,
        ip: opts.ip ?? null,
        meta: (opts.meta ?? null) as never,
      },
    });
  } catch {
    // Audit logging must never break the primary action.
  }
}
