import { isRejectedEmail } from "./email-guard";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const NAME_RE = /^[\p{L}\p{M}\p{N}\s'\-.]*$/u;
const ORG_RE = /^[\p{L}\p{M}\p{N}\s&'()/.,#\-]*$/u;

export function sanitizeText(value: string): string {
  return value.replace(/[\u0000-\u001f\u007f]/g, "").trim().replace(/\s{2,}/g, " ");
}

export function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

export function validateEmail(email: string): string | null {
  const value = email.trim();
  if (!value) return "Please enter your email address";
  if (!EMAIL_RE.test(value)) return "Please enter a valid email address";
  if (isRejectedEmail(value)) return "Please enter a real email address";
  return null;
}

export function validateName(name: string): string | null {
  const value = name.trim();
  if (!value) return "Please enter your name";
  if (value.length < 2) return "Please enter your name";
  if (value.length > 80) return "Name is too long";
  return null;
}

export type ContactErrors = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  organization?: string;
  message?: string;
};

export function validateContact(form: Record<string, string>): ContactErrors {
  const errors: ContactErrors = {};
  const firstName = sanitizeText(form.firstName);
  const lastName = sanitizeText(form.lastName);
  const email = form.email.trim();
  const phone = digitsOnly(form.phone);
  const organization = sanitizeText(form.organization);
  const message = form.message.trim();

  if (!firstName) errors.firstName = "First name is required";
  else if (firstName.length < 2) errors.firstName = "First name must be at least 2 characters";
  else if (firstName.length > 80) errors.firstName = "First name must be under 80 characters";
  else if (!NAME_RE.test(firstName)) errors.firstName = "First name contains invalid characters";

  if (lastName && lastName.length > 80) errors.lastName = "Last name must be under 80 characters";
  else if (lastName && !NAME_RE.test(lastName)) errors.lastName = "Last name contains invalid characters";

  if (!email) errors.email = "Email is required";
  else {
    const emailError = validateEmail(email);
    if (emailError) errors.email = emailError;
  }

  if (phone && phone.length !== 10) errors.phone = "Mobile number must be exactly 10 digits";

  if (!organization) errors.organization = "Organization / event is required";
  else if (organization.length < 2) errors.organization = "Organization must be at least 2 characters";
  else if (organization.length > 120) errors.organization = "Organization must be under 120 characters";
  else if (!ORG_RE.test(organization)) errors.organization = "Organization contains invalid characters";

  if (message && message.length > 2000) errors.message = "Message must be under 2000 characters";

  return errors;
}