"use client";

import { useEffect, useRef, useState } from "react";
import { X, CheckCircle2, Loader2, Mail } from "lucide-react";
import { validateEmail } from "@/lib/client-validators";

// Module-level flag: closing the popup hides it for the whole browsing
// session (even across page navigation), and a page refresh re-arms it.
let dismissed = false;

export function NewsletterPopup() {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [message, setMessage] = useState("");
  const interacted = useRef(false);
  const closeTimer = useRef<number | null>(null);

  useEffect(() => {
    if (dismissed) return;

    let t: number;
    const startTimer = () => {
      t = window.setTimeout(() => setVisible(true), 14000);
    };

    // If an announcement is currently active, wait for it to close
    if (document.documentElement.dataset.announcementActive === 'true') {
      const onClosed = () => {
        window.removeEventListener('announcementClosed', onClosed);
        startTimer();
      };
      window.addEventListener('announcementClosed', onClosed);
      return () => {
        window.removeEventListener('announcementClosed', onClosed);
        clearTimeout(t);
      };
    } else {
      startTimer();
      return () => clearTimeout(t);
    }
  }, []);

  // Auto-close 5s after the popup appears, unless the user has started typing.
  useEffect(() => {
    if (!visible) return;
    if (interacted.current) return;
    closeTimer.current = window.setTimeout(() => close(), 5000);
    return () => {
      if (closeTimer.current) window.clearTimeout(closeTimer.current);
    };
  }, [visible]);

  function close() {
    dismissed = true;
    setVisible(false);
  }

  function onInteract() {
    interacted.current = true;
    if (closeTimer.current) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const emailError = validateEmail(email);
    if (emailError) {
      setState("error");
      setMessage(emailError);
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

  if (!visible) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-[44px] z-[60] p-4 sm:p-0 sm:inset-auto sm:left-6 sm:bottom-6 sm:w-[420px]"
      onMouseDownCapture={onInteract}
      onTouchStartCapture={onInteract}
    >
      <div className="card-hover rounded-xl border border-border/80 bg-card/95 backdrop-blur-xl shadow-2xl shadow-black/15 overflow-hidden animate-slide-in-up">
        <div className="p-6 sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <span className="btn-premium inline-flex items-center rounded-full bg-accent/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-accent-strong">
              Sagar&apos;s Weekly Dispatch
            </span>
            <button
              type="button"
              onClick={close}
              aria-label="Close newsletter popup"
              className="btn-premium p-1.5 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {state === "success" ? (
            <div className="mt-5 flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm font-medium">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>{message}</span>
            </div>
          ) : (
            <>
              <h3 className="mt-4 font-display text-2xl font-bold leading-snug tracking-tight text-foreground">
                One practical idea. Every week.
              </h3>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                Unfiltered thoughts on money, career, and intentional living —
                no fluff, ever.
              </p>

              <form onSubmit={onSubmit} className="mt-5 space-y-3" noValidate>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your best email address"
                    aria-label="Your email address"
                    className="w-full rounded-full border border-border bg-background/80 pl-11 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all placeholder:text-muted-foreground/60"
                  />
                </div>

                {state === "error" && (
                  <p className="text-xs text-red-600 font-medium px-1">{message}</p>
                )}

                <button
                  type="submit"
                  disabled={state === "loading"}
                  className="btn-premium w-full inline-flex items-center justify-center gap-2 rounded-full bg-accent text-accent-foreground px-6 py-3 text-sm font-semibold shadow-lg shadow-accent/20 hover:opacity-95 disabled:opacity-60"
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
