"use client";

import { useState, useEffect } from "react";
import { Mail, CheckCircle2, Loader2 } from "lucide-react";

const STORAGE_KEY = "nl_test_email";

function getStoredTestEmail(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(STORAGE_KEY) ?? "";
}

function storeTestEmail(email: string) {
  localStorage.setItem(STORAGE_KEY, email);
}

export function NewsletterSettings() {
  const [testEmail, setTestEmail] = useState("");
  const [saved, setSaved] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setTestEmail(getStoredTestEmail());
    setLoaded(true);
  }, []);

  function handleSave() {
    const trimmed = testEmail.trim();
    storeTestEmail(trimmed);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const isValid = !testEmail.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(testEmail.trim());

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-accent/10">
            <Mail className="w-5 h-5 text-accent-strong" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Newsletter Test Email</h3>
            <p className="text-xs text-muted-foreground">
              Where test emails are sent before broadcasting to all subscribers.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="test-email" className="block text-xs font-medium text-muted-foreground">
            Test email address
          </label>
          <div className="flex gap-2">
            <input
              id="test-email"
              type="email"
              value={testEmail}
              onChange={(e) => {
                setTestEmail(e.target.value);
                setSaved(false);
              }}
              placeholder="you@example.com"
              className={`flex-1 rounded-lg border bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground/50 ${
                isValid
                  ? "border-border focus:border-accent focus:ring-2 focus:ring-accent/20"
                  : "border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
              }`}
            />
            <button
              type="button"
              onClick={handleSave}
              disabled={!isValid || !testEmail.trim()}
              className="inline-flex items-center gap-2 rounded-lg bg-accent text-accent-foreground px-4 py-2 text-sm font-semibold disabled:opacity-40 hover:opacity-90 transition-opacity shrink-0"
            >
              {saved ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Saved
                </>
              ) : (
                "Save"
              )}
            </button>
          </div>
          {!isValid && (
            <p className="text-xs text-red-500">Please enter a valid email address.</p>
          )}
          {loaded && !testEmail.trim() && (
            <p className="text-xs text-muted-foreground">
              If empty, test emails go to your account email ({getStoredTestEmail() || "your login email"}).
            </p>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
        <h3 className="text-sm font-semibold">How it works</h3>
        <ul className="space-y-2 text-xs text-muted-foreground">
          <li className="flex gap-2">
            <span className="text-accent-strong font-bold shrink-0">1.</span>
            Draft your newsletter in the{" "}
            <a href="/admin/newsletter" className="font-medium text-foreground hover:underline">
              Newsletter
            </a>{" "}
            page.
          </li>
          <li className="flex gap-2">
            <span className="text-accent-strong font-bold shrink-0">2.</span>
            Click <strong>Test</strong> to send a preview to this email address.
          </li>
          <li className="flex gap-2">
            <span className="text-accent-strong font-bold shrink-0">3.</span>
            Check the inbox, verify formatting and links look correct.
          </li>
          <li className="flex gap-2">
            <span className="text-accent-strong font-bold shrink-0">4.</span>
            Click <strong>Send</strong> to broadcast to all subscribers.
          </li>
        </ul>
      </div>
    </div>
  );
}
