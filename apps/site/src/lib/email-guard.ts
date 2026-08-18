const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com",
  "mailinator.net",
  "yopmail.com",
  "yopmail.fr",
  "temp-mail.org",
  "tempmail.com",
  "temp-mail.io",
  "guerrillamail.com",
  "guerrillamail.de",
  "10minutemail.com",
  "throwawaymail.com",
  "trashmail.com",
  "maildrop.cc",
  "getnada.com",
  "33mail.com",
  "spam4.me",
  "dispostable.com",
  "mailnesia.com",
  "temporarymail.com",
  "tempr.email",
  "tempinbox.com",
  "fakeinbox.com",
  "e4ward.com",
  "mintemail.com",
  "mailcatch.com",
  "mailsac.com",
  "inboxkitten.com",
  "jetable.org",
  "sharklasers.com",
  "guerrillamail.info",
  "mailmetrash.com",
  "tempomail.com",
  "example.com",
  "test.com",
  "test.test",
]);

const SUSPICIOUS_LOCAL = /\b(test|demo|fake|spam|temp|throwaway|trash|mailinator|yopmail|random|dummy)\b/i;

export function isRejectedEmail(email: string): boolean {
  const value = email.trim().toLowerCase();
  if (!value) return false;
  const [local, domain] = value.split("@");
  if (!domain) return false;
  if (DISPOSABLE_DOMAINS.has(domain)) return true;
  if (domain.split(".").length < 2) return true;
  // Digits become separators so "demo123" matches but "demonstrator" doesn't.
  if (SUSPICIOUS_LOCAL.test(local.replace(/\d/g, " "))) return true;
  if (local.length < 3 || /^\d+$/.test(local)) return true;
  return false;
}