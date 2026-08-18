import { randomInt } from "crypto";
import { generateSecret, generateURI, verifySync } from "otplib";

export function generateTotpSecret(): string {
  return generateSecret();
}

export function totpUri(secret: string, email: string, issuer = "Sagar Lad Admin"): string {
  return generateURI({ secret, label: email, issuer });
}

export function verifyTotp(token: string, secret: string | null | undefined): boolean {
  if (!secret) return false;
  const t = token?.trim().replace(/\s+/g, "");
  if (!t || !/^\d{6}$/.test(t)) return false;
  try {
    const result = verifySync({ token: t, secret });
    return result.valid === true;
  } catch {
    return false;
  }
}

export function generateRecoveryCodes(count = 8, length = 10): string[] {
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    let code = "";
    for (let j = 0; j < length; j++) {
      code += alphabet[randomInt(alphabet.length)];
    }
    codes.push(code);
  }
  return codes;
}

// Returns the recovery code (normalized) if it matches one in the list, else null.
// Recovery codes are single-use lowercase-insensitive credentials.
export function matchRecoveryCode(stored: string | null | undefined, entered: string): string | null {
  if (!stored) return null;
  const normalized = entered.trim().toUpperCase();
  if (!normalized) return null;
  const found = stored
    .split(",")
    .map((c) => c.trim().toUpperCase())
    .find((c) => c === normalized);
  return found ?? null;
}

// Permanently invalidates a used recovery code by removing it from the stored list.
export function consumeRecoveryCode(stored: string | null | undefined, code: string): string {
  if (!stored) return "";
  return stored
    .split(",")
    .map((c) => c.trim())
    .filter((c) => c.toUpperCase() !== code.toUpperCase())
    .join(",");
}
