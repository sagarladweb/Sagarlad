"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { CheckCircle2, Loader2, AlertCircle, Mail } from "lucide-react";
import { validateEmail } from "@/lib/client-validators";
import { SiteLogo } from "@/components/SiteLogo";
import { Pill } from "@/components/ui/Pill";

export function NewsletterCta() {
  const [email, setEmail] = useState("");
  const [terms, setTerms] = useState(false);
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!terms) {
      setState("error");
      setMessage("Please accept the privacy policy to subscribe.");
      return;
    }
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
        body: JSON.stringify({ email: email.trim(), acceptedTerms: terms }),
      });
      if (res.ok) {
        setState("success");
        setEmail("");
        setMessage("You're in! Check your inbox to confirm.");
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
    <section
      className="border-b border-border bg-background py-20 md:py-24"
      aria-label="Subscribe to the newsletter"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div
          className="mx-auto max-w-2xl overflow-hidden rounded-xl border border-border bg-card shadow-lg"
          data-animate
        >
          {/* Full-width blog image — top 60%, no gradient overlay */}
          <div className="relative w-full aspect-[16/10] overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/blog.webp"
              alt="Blog"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute bottom-0 inset-x-0 p-6 sm:p-8 bg-gradient-to-t from-black/60 to-transparent">
              <SiteLogo light className="h-8 w-auto" />
              <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/80">
                One useful idea, every week
              </p>
            </div>
          </div>

          {/* Newsletter form — bottom 40%, light blue blend to white */}
          <div
            className="flex flex-col items-center px-6 pt-8 pb-10 sm:px-12 sm:pt-10 sm:pb-12"
            style={{
              background: "linear-gradient(180deg, #e8f0fe 0%, #f4f7fd 35%, #ffffff 70%)",
            }}
          >
            <div className="w-full text-center mx-auto max-w-md" data-animate>
              <Pill>The Sagar Lad Letter</Pill>
              <h2 className="mt-3 font-display text-3xl md:text-4xl font-bold leading-tight text-foreground">
                One practical idea. Every week.
              </h2>
              <p className="mt-4 text-base text-muted-foreground leading-relaxed">
                Unfiltered thoughts on money, mindset, speaking and intentional
                living — one practical idea, every week. No spam, ever.
              </p>

              {state === "success" ? (
                <div className="mt-6 flex items-center gap-3 p-4 rounded-2xl bg-brand-light/20 border border-border text-foreground text-sm font-medium">
                  <CheckCircle2 className="w-5 h-5 shrink-0 text-brand" />
                  <span>{message}</span>
                </div>
              ) : (
                <form onSubmit={onSubmit} className="mt-6 space-y-3.5 max-w-md mx-auto" noValidate>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Your best email address"
                      aria-label="Your email address"
                      className="w-full rounded-full border border-border bg-background pl-11 pr-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all placeholder:text-muted-foreground"
                    />
                  </div>

                  <label className="flex items-start gap-2.5 text-xs text-muted-foreground cursor-pointer pt-0.5">
                    <input
                      type="checkbox"
                      checked={terms}
                      onChange={(e) => setTerms(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-border bg-background accent-brand shrink-0"
                    />
                    <span className="leading-normal">
                      I agree to the{" "}
                      <Link
                        href="/privacy"
                        className="text-brand underline underline-offset-2 hover:opacity-80"
                        onClick={(e) => e.stopPropagation()}
                      >
                        privacy policy
                      </Link>{" "}
                      &amp; terms. No spam, ever.
                    </span>
                  </label>

                  {state === "error" && (
                    <p className="flex items-center gap-1.5 text-xs text-red-600 font-medium">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {message}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={state === "loading"}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-accent text-accent-foreground px-6 py-3.5 text-sm font-semibold shadow-sm hover:opacity-95 transition-all disabled:opacity-60"
                  >
                    {state === "loading" ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Mail className="w-4 h-4" />
                    )}
                    Subscribe
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
