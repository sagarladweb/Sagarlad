"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { X, Mail, Loader2, CheckCircle2 } from "lucide-react";
import { validateEmail } from "@/lib/client-validators";

export function SubscribeModal() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  function reset() {
    setEmail("");
    setAcceptedTerms(false);
    setState("idle");
    setMessage("");
    setOpen(false);
  }

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
      setMessage("You must accept the Privacy Policy and Terms.");
      return;
    }
    setState("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (res.ok) {
        setState("success");
        setMessage("Welcome aboard! Check your inbox soon.");
      } else {
        const data = await res.json().catch(() => ({}));
        if (res.status === 409) {
          setState("success");
          setMessage("You're already subscribed! Thank you.");
        } else {
          setState("error");
          setMessage(data.error ?? "Something went wrong. Please try again.");
        }
      }
    } catch {
      setState("error");
      setMessage("Network error. Please try again.");
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-5 py-2 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
      >
        <Mail className="w-3.5 h-3.5" />
        Subscribe
      </button>

      {open && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={reset} />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Subscribe to newsletter"
            className="relative w-full max-w-md rounded-xl border border-border bg-background p-8 shadow-2xl"
          >
            <button
              type="button"
              onClick={reset}
              aria-label="Close"
              className="btn-premium absolute right-4 top-4 rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-brand-light/10">
              <Mail className="w-5 h-5 text-brand" />
            </div>
            <p className="mt-3 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-brand">
              Sagar&apos;s Weekly Dispatch
            </p>
            <h2 className="mt-2 text-center font-display text-xl font-bold leading-snug">
              One practical idea. Every week.
            </h2>
            <p className="mt-1 text-center text-xs text-muted-foreground">
              Unfiltered thoughts on money, career, and intentional living.
            </p>

            {state === "success" ? (
              <div className="mt-6 flex items-center gap-3 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm font-medium">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>{message}</span>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your best email address"
                    aria-label="Your email address"
                    className="w-full rounded-full border border-border bg-background pl-11 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent focus:ring-offset-0 transition-all placeholder:text-muted-foreground/60"
                  />
                </div>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--brand)]"
                  />
                  <span className="text-xs leading-relaxed text-muted-foreground">
                    I have read and agree to the{" "}
                    <a href="/privacy" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-foreground">
                      Privacy Policy
                    </a>{" "}
                    and{" "}
                    <a href="/terms" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-foreground">
                      Terms &amp; Conditions
                    </a>.
                  </span>
                </label>

                {state === "error" && (
                  <p role="alert" className="text-xs text-red-600 font-medium px-1">
                    {message}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={state === "loading" || !acceptedTerms}
                  className="btn-premium w-full inline-flex items-center justify-center gap-2 rounded-full bg-accent text-accent-foreground px-6 py-3 text-sm font-semibold shadow-sm hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {state === "loading" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Mail className="w-4 h-4" />
                  )}
                  Get Weekly Insights
                </button>
                <p className="text-center text-[11px] text-muted-foreground">
                  Unsubscribe anytime. No spam, ever.
                </p>
              </form>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
