"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  User,
  KeyRound,
  Mail,
  Camera,
  AlertCircle,
  ShieldCheck,
  ArrowRight,
  Eye,
  EyeOff,
} from "lucide-react";
import { showToast } from "@/components/admin/Toast";

type Props = {
  initial: { name?: string | null; email?: string | null; image?: string | null };
  onOpenSecurity?: () => void;
};

const inputCls =
  "w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent";
const btnCls =
  "inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-50 transition-opacity";

function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium">{label}</span>
      {children}
      {hint && <span className="block text-xs text-muted-foreground">{hint}</span>}
    </label>
  );
}

function PasswordInput({
  value,
  onChange,
  autoComplete,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
  placeholder?: string;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <input
        type={visible ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className={`${inputCls} pr-11`}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        className="absolute right-1.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

function TileHeader({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand">
        <Icon className="h-4.5 w-4.5" />
      </div>
      <div className="min-w-0">
        <h2 className="font-display text-base font-bold leading-tight">{title}</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}

function initials(name?: string | null): string {
  if (!name) return "A";
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

export function ProfileForm({ initial, onOpenSecurity }: Props) {
  const router = useRouter();
  const [name, setName] = useState(initial.name ?? "");
  const [image, setImage] = useState<string | null>(initial.image ?? null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [curPassword, setCurPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  const [curPasswordEmail, setCurPasswordEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [changingEmail, setChangingEmail] = useState(false);

  async function handleAvatar(file: File | undefined | null) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showToast("Please choose an image file.", undefined, "error");
      return;
    }
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("folder", "avatars");
      const res = await fetch("/api/admin/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      setImage(data.url);
      showToast("Photo uploaded & updated");
    } catch (err) {
      showToast("Upload failed", err instanceof Error ? err.message : undefined, "error");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handlePasteImage(dataUrl: string) {
    setUploading(true);
    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataUrl, folder: "avatars" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      setImage(data.url);
      showToast("Pasted photo uploaded & updated");
    } catch (err) {
      showToast("Pasted image upload failed", err instanceof Error ? err.message : undefined, "error");
    } finally {
      setUploading(false);
    }
  }

  const handleGlobalPaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          e.preventDefault();
          handleAvatar(file);
          return;
        }
      }
    }
    const pastedText = e.clipboardData?.getData("text");
    if (pastedText && pastedText.startsWith("data:image/")) {
      e.preventDefault();
      handlePasteImage(pastedText);
    }
  };

  async function saveProfile() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "profile", name, image }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? "Could not save profile");
      showToast("Profile updated");
      router.refresh();
    } catch (err) {
      showToast("Profile update failed", err instanceof Error ? err.message : undefined, "error");
    } finally {
      setSaving(false);
    }
  }

  async function changePassword() {
    if (newPassword !== confirmPassword) {
      showToast("Passwords do not match", undefined, "error");
      return;
    }
    setChangingPassword(true);
    try {
      const res = await fetch("/api/admin/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "password", currentPassword: curPassword, newPassword }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? "Could not change password");
      showToast("Password changed");
      setCurPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      showToast("Password change failed", err instanceof Error ? err.message : undefined, "error");
    } finally {
      setChangingPassword(false);
    }
  }

  async function changeEmail() {
    setChangingEmail(true);
    try {
      const res = await fetch("/api/admin/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "email", currentPassword: curPasswordEmail, newEmail }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? "Could not change email");
      showToast("Email changed. Use your new email next time you sign in.");
      setCurPasswordEmail("");
      setNewEmail("");
    } catch (err) {
      showToast("Email change failed", err instanceof Error ? err.message : undefined, "error");
    } finally {
      setChangingEmail(false);
    }
  }

  return (
    <div onPaste={handleGlobalPaste} className="grid grid-cols-1 gap-4 md:grid-cols-12">
      {/* Featured: profile photo & name */}
      <section className="relative overflow-hidden rounded-3xl border border-border bg-card p-7 sm:p-9 md:col-span-8 md:row-span-2">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full bg-brand-light/15 blur-3xl"
        />
        <div className="relative flex flex-col gap-8 sm:flex-row sm:items-start">
          <div className="shrink-0">
            <div className="relative h-24 w-24">
              {image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={image}
                  alt="Your profile photo"
                  className="h-24 w-24 rounded-3xl border border-border object-cover"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-brand/10 font-display text-3xl font-bold text-brand">
                  {initials(name || initial.name)}
                </div>
              )}
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                aria-label="Change profile photo"
                className="absolute -bottom-1.5 -right-1.5 grid h-9 w-9 place-items-center rounded-full bg-brand text-white shadow-md transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleAvatar(e.target.files?.[0])}
              />
            </div>
          </div>

          <div className="min-w-0 flex-1 space-y-4">
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-accent">
                <User className="h-3.5 w-3.5" /> Profile
              </span>
              <h1 className="mt-1 font-display text-2xl font-bold">
                {name || initial.name || "Admin"}
              </h1>
              <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                <Mail className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{initial.email ?? "Signed in"}</span>
              </p>
            </div>

            <Field label="Display name" hint="How you appear in the admin panel and next to your comments.">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                maxLength={80}
                className={inputCls}
              />
            </Field>

            <div className="flex items-center justify-end">
              <button type="button" onClick={saveProfile} disabled={saving} className={btnCls}>
                {saving && <Loader2 className="h-4 w-4 animate-spin" />} Save profile
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Security pointer */}
      <section className="flex flex-col rounded-2xl border border-border bg-card card-grad p-6 md:col-span-4">
        <TileHeader
          icon={ShieldCheck}
          title="Security"
          subtitle="2FA, password & sign-in email"
        />
        <button
          type="button"
          onClick={onOpenSecurity}
          className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-semibold text-accent hover:underline"
        >
          Open security <ArrowRight className="h-4 w-4" />
        </button>
      </section>

      {/* Change password */}
      <section className="rounded-2xl border border-border bg-card card-grad p-6 md:col-span-6">
        <TileHeader
          icon={KeyRound}
          title="Change password"
          subtitle="At least 8 characters with letters and numbers."
        />
        <div className="mt-5 space-y-4">
          <Field label="Current password">
            <PasswordInput
              value={curPassword}
              onChange={setCurPassword}
              autoComplete="current-password"
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="New password">
              <PasswordInput
                value={newPassword}
                onChange={setNewPassword}
                autoComplete="new-password"
              />
            </Field>
            <Field label="Confirm new password">
              <PasswordInput
                value={confirmPassword}
                onChange={setConfirmPassword}
                autoComplete="new-password"
              />
            </Field>
          </div>
          <div className="flex items-center justify-end">
            <button type="button" onClick={changePassword} disabled={changingPassword} className={btnCls}>
              {changingPassword && <Loader2 className="h-4 w-4 animate-spin" />} Change password
            </button>
          </div>
        </div>
      </section>

      {/* Sign-in email */}
      <section className="rounded-2xl border border-border bg-card card-grad p-6 md:col-span-6">
        <TileHeader
          icon={Mail}
          title="Sign-in email"
          subtitle={`Current email: ${initial.email ?? "—"}`}
        />
        <div className="mt-5 space-y-4">
          <Field label="Current password">
            <PasswordInput
              value={curPasswordEmail}
              onChange={setCurPasswordEmail}
              autoComplete="current-password"
            />
          </Field>
          <Field label="New email">
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className={inputCls}
              autoComplete="email"
            />
          </Field>
          <div className="flex items-center justify-end">
            <button type="button" onClick={changeEmail} disabled={changingEmail} className={btnCls}>
              {changingEmail && <Loader2 className="h-4 w-4 animate-spin" />} Update email
            </button>
          </div>
        </div>
      </section>

      {!initial.email && (
        <p
          className="flex items-center gap-1.5 text-sm text-amber-600 md:col-span-12"
          role="alert"
        >
          <AlertCircle className="h-4 w-4 shrink-0" /> Session not loaded — sign in again.
        </p>
      )}
    </div>
  );
}