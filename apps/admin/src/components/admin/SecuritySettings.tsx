"use client";

import { useEffect, useState } from "react";
import {
  ShieldCheck,
  ShieldOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Copy,
  Check,
} from "lucide-react";

type SetupState = { secret: string; qr: string } | null;

export function SecuritySettings() {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [setup, setSetup] = useState<SetupState>(null);
  const [code, setCode] = useState("");
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  async function load() {
    try {
      const res = await fetch("/api/admin/security");
      const data = await res.json();
      setEnabled(data.enabled);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function startSetup() {
    setBusy(true);
    setError("");
    const res = await fetch("/api/admin/security", {
      method: "POST",
      body: JSON.stringify({ action: "setup" }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? "Could not start setup");
      return;
    }
    setSetup({ secret: data.secret, qr: data.qr });
  }

  async function enable() {
    if (!setup || code.trim().length !== 6) {
      setError("Enter the 6-digit code from your authenticator app.");
      return;
    }
    setBusy(true);
    setError("");
    const res = await fetch("/api/admin/security", {
      method: "POST",
      body: JSON.stringify({ action: "enable", secret: setup.secret, token: code }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? "Could not enable 2FA");
      return;
    }
    setRecoveryCodes(data.recoveryCodes);
    setSetup(null);
    setEnabled(true);
  }

  async function disable() {
    if (code.trim().length !== 6) {
      setError("Enter the 6-digit code from your authenticator app to confirm.");
      return;
    }
    setBusy(true);
    setError("");
    const res = await fetch("/api/admin/security", {
      method: "POST",
      body: JSON.stringify({ action: "disable", token: code }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? "Could not disable 2FA");
      return;
    }
    setEnabled(false);
    setCode("");
  }

  async function copyCodes() {
    if (!recoveryCodes) return;
    await navigator.clipboard.writeText(recoveryCodes.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const card =
    "rounded-2xl border border-border bg-card p-6";

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      {error && (
        <p className="flex items-center gap-1.5 text-sm text-red-600" role="alert">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </p>
      )}

      {recoveryCodes ? (
        <div className={card}>
          <h2 className="flex items-center gap-2 font-semibold">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            2FA is now enabled
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Save these one-time recovery codes somewhere safe. Each code can be
            used once if you lose your authenticator app.
          </p>
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
            {recoveryCodes.map((c) => (
              <code
                key={c}
                className="rounded-lg bg-muted px-2 py-1.5 text-center text-xs font-mono"
              >
                {c}
              </code>
            ))}
          </div>
          <button
            onClick={copyCodes}
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? "Copied" : "Copy codes"}
          </button>
        </div>
      ) : setup ? (
        <div className={card}>
          <h2 className="font-semibold">Step 1 · Scan the QR code</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Open your authenticator app and scan this code, or enter the secret
            manually.
          </p>
          <div className="mt-4 flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={setup.qr}
              alt="QR code for authenticator app"
              className="rounded-xl border border-border"
              width={280}
              height={280}
            />
          </div>
          <div className="mt-4 flex items-center justify-between rounded-xl bg-muted px-3 py-2 text-xs">
            <code className="font-mono">{setup.secret}</code>
            <button
              onClick={async () => {
                await navigator.clipboard.writeText(setup.secret);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="inline-flex items-center gap-1 font-medium text-muted-foreground hover:text-foreground"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>

          <div className="mt-4">
            <label htmlFor="setup-code" className="block text-sm font-medium mb-1.5">
              Step 2 · Enter the 6-digit code
            </label>
            <div className="flex gap-2">
              <input
                id="setup-code"
                inputMode="numeric"
                value={code}
                onChange={(e) =>
                  setCode(e.target.value.replace(/[^\d]/g, "").slice(0, 6))
                }
                placeholder="000000"
                className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-center font-mono text-lg tracking-[0.5em] outline-none focus:ring-2 focus:ring-accent"
              />
              <button
                onClick={enable}
                disabled={busy}
                className="inline-flex items-center gap-2 rounded-full bg-accent text-accent-foreground px-5 py-2.5 text-sm font-semibold disabled:opacity-60"
              >
                {busy && <Loader2 className="w-4 h-4 animate-spin" />}
                Enable
              </button>
            </div>
          </div>
          <button
            onClick={() => {
              setSetup(null);
              setCode("");
              setError("");
            }}
            className="mt-4 text-sm text-muted-foreground hover:text-foreground"
          >
            Cancel
          </button>
        </div>
      ) : (
        <div className={card}>
          <h2 className="flex items-center gap-2 font-semibold">
            {enabled ? (
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            ) : (
              <ShieldOff className="w-5 h-5 text-muted-foreground" />
            )}
            Two-factor authentication
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {enabled
              ? "Enabled. You will need a verification code each time you sign in."
              : "Not enabled. For maximum security, set up 2FA now."}
          </p>
          {enabled ? (
            <div className="mt-4 flex flex-wrap gap-2">
              <input
                inputMode="numeric"
                value={code}
                onChange={(e) =>
                  setCode(e.target.value.replace(/[^\d]/g, "").slice(0, 6))
                }
                placeholder="Confirm with 6-digit code"
                className="rounded-xl border border-border bg-background px-4 py-2.5 text-center font-mono text-sm tracking-[0.4em] outline-none focus:ring-2 focus:ring-accent"
              />
              <button
                onClick={disable}
                disabled={busy}
                className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-muted-foreground hover:text-foreground disabled:opacity-60"
              >
                {busy && <Loader2 className="w-4 h-4 animate-spin" />}
                Disable 2FA
              </button>
            </div>
          ) : (
            <button
              onClick={startSetup}
              disabled={busy}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-accent text-accent-foreground px-5 py-2.5 text-sm font-semibold disabled:opacity-60"
            >
              {busy && <Loader2 className="w-4 h-4 animate-spin" />}
              Set up 2FA
            </button>
          )}
        </div>
      )}
    </div>
  );
}