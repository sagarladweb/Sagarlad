"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2, AlertCircle, Mail, Shield } from "lucide-react";
import { validateEmail } from "@/lib/client-validators";

export function NewsletterSignup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    const emailError = validateEmail(email);
    if (emailError) {
      setState("error");
      setMessage(emailError);
      return;
    }
    if (!acceptedTerms) {
      setState("error");
      setMessage("Please accept the terms & conditions to subscribe.");
      return;
    }

    setState("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          name: name.trim() || undefined,
          acceptedTerms,
        }),
      });
      if (res.ok) {
        setState("success");
        setEmail("");
        setName("");
        setAcceptedTerms(false);
        setMessage("You're in! Check your inbox to confirm.");
      } else {
        const data = await res.json().catch(() => ({}));
        setState("error");
        setMessage(data.error ?? "Something went wrong. Please try again.");
      }
    } catch {
      setState("error");
      setMessage("Network error. Please try again.");
    }
  }

  if (state === "success") {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30 p-6 text-center">
        <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto" />
        <p className="mt-3 text-sm font-medium text-green-800 dark:text-green-300">
          {message}
        </p>
        <p className="mt-1 text-xs text-green-700 dark:text-green-400/70">
          You&apos;ll receive a confirmation email shortly.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-6 sm:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-accent/10">
          <Mail className="w-5 h-5 text-accent-strong" />
        </div>
        <div>
          <h2 className="font-display text-lg font-bold">Subscribe for free</h2>
          <p className="text-xs text-muted-foreground">
            Every Sunday — one idea you can use immediately.
          </p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="nl-name" className="sr-only">
            Name
          </label>
          <input
            id="nl-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="First name "
            className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent transition-shadow"
          />
        </div>

        <div>
          <label htmlFor="nl-email" className="sr-only">
            Email address
          </label>
          <input
            id="nl-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email address"
            required
            className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent transition-shadow"
          />
        </div>

        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-border text-accent focus:ring-accent cursor-pointer"
          />
          <span className="text-xs text-muted-foreground leading-relaxed">
            I agree to receive weekly emails and accept the{" "}
            <Link href="/privacy" className="underline underline-offset-2 hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            . Unsubscribe anytime.
          </span>
        </label>

        {state === "error" && (
          <p className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={state === "loading"}
          className="btn-premium w-full inline-flex items-center justify-center gap-2 rounded-lg bg-accent text-accent-foreground px-5 py-3 text-sm font-semibold disabled:opacity-60 hover:opacity-90 transition-opacity"
        >
          {state === "loading" ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            "Subscribe"
          )}
        </button>

        <p className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground/70">
          <Shield className="w-3 h-3" />
          No spam. Unsubscribe with one click.
        </p>
      </form>
    </div>
  );
}
