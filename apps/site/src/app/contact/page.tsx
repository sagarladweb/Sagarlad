"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  Mail,
  MapPin,
  Clock,
} from "lucide-react";
import { validateContact, sanitizeText } from "@/lib/client-validators";

const initial = {
  firstName: "",
  lastName: "",
  email: "",
  message: "",
};

type Errors = {
  firstName?: string;
  lastName?: string;
  email?: string;
  message?: string;
};

const bullets = [
  "Direct access — no gatekeepers",
  "Replies within 3–5 business days",
  "Open to collaborations, questions & feedback",
];

export default function ContactPage() {
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState<Errors>({});
  const [state, setState] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  function update<K extends keyof typeof initial>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key as keyof Errors]) {
      setErrors((e) => ({ ...e, [key]: undefined }));
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      firstName: sanitizeText(form.firstName),
      lastName: sanitizeText(form.lastName),
      email: form.email.trim().toLowerCase(),
      organization: "General Contact",
      message: form.message.trim(),
      type: "GENERAL",
    };
    const validationErrors = validateContact(payload);
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      setState("error");
      setMessage("Please fill in all required fields.");
      return;
    }
    setState("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setState("success");
        setForm(initial);
        setErrors({});
        setMessage(
          "Thank you! Your message has been sent. Sagar will get back to you soon."
        );
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

  const inputClasses = (hasError?: boolean) =>
    `w-full rounded-xl border px-4 py-3 text-sm outline-none transition-colors ${hasError
      ? "border-red-400 focus:ring-2 focus:ring-red-300"
      : "border-border bg-background focus:border-accent focus:ring-2 focus:ring-accent/20"
    }`;

  const fieldError = (key: keyof Errors) =>
    errors[key] ? (
      <p id={`${key}-error`} role="alert" className="mt-1.5 text-xs text-red-600">
        {errors[key]}
      </p>
    ) : null;

  return (
    <div className="overflow-x-clip">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <header className="relative overflow-hidden border-b border-border bg-[#0A1930]">
        {/* Portrait glow — warm, behind the image */}
        <div
          className="absolute z-0"
          style={{
            width: "600px",
            height: "600px",
            left: "5%",
            top: "10%",
            background: "radial-gradient(circle, rgba(255,213,29,0.07) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
        {/* Ambient blue depth */}
        <div
          className="absolute z-0"
          style={{
            width: "500px",
            height: "500px",
            right: "10%",
            bottom: "0%",
            background: "radial-gradient(circle, rgba(13,33,161,0.06) 0%, transparent 70%)",
            filter: "blur(50px)",
          }}
        />
        {/* Bottom edge fade */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0A1930] z-10" />

        <div className="relative z-20 mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:gap-6 pt-8 pb-12 sm:pt-14 sm:pb-20">
          {/* Portrait */}
          <div className="lg:col-span-5 relative flex justify-center" data-animate="left">
            <div className="relative w-full max-w-[420px]">
              {/* Soft glow behind portrait */}
              <div
                className="absolute -inset-8 rounded-full opacity-40"
                style={{
                  background: "radial-gradient(ellipse, rgba(255,213,29,0.08) 0%, transparent 65%)",
                  filter: "blur(30px)",
                }}
              />
              <Image
                src="/images/section.png"
                alt="Sagar Lad"
                width={800}
                height={890}
                priority
                className="relative z-10 h-auto w-full drop-shadow-[0_25px_50px_rgba(0,0,0,0.5)]"
                style={{
                  maskImage: "linear-gradient(to top, transparent 0%, black 20%, black 100%)",
                  WebkitMaskImage: "linear-gradient(to top, transparent 0%, black 20%, black 100%)",
                }}
              />
            </div>
          </div>

          {/* Copy */}
          <div className="lg:col-span-7 lg:pl-6 text-center lg:text-left" data-animate="right">
            <span className="inline-block rounded-full bg-white/[0.06] backdrop-blur-sm px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/60 border border-white/[0.08]">
              Get in touch
            </span>
            <h1 className="mt-6 font-display text-[2.75rem] sm:text-6xl font-bold leading-[1.05] tracking-tight text-white">
              Let&apos;s{" "}
              <span className="text-accent">connect.</span>
            </h1>
            <p className="mt-6 max-w-md text-[15px] sm:text-base text-white/45 leading-[1.8]">
              Have a question, feedback on a book, or a thought to share?
              I read every message.
            </p>
            <ul className="mt-8 space-y-3.5">
              {bullets.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-sm font-medium text-white/65"
                >
                  <CheckCircle2
                    className="mt-0.5 h-4 w-4 shrink-0 text-accent/70"
                    aria-hidden="true"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </header>

      {/* ── Content ──────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-16 md:py-20">
        <div className="grid lg:grid-cols-[1fr_340px] gap-12 lg:gap-16 items-start">
          {/* ── Form ──────────────────────────────────────────── */}
          <div data-animate>
            <form
              onSubmit={onSubmit}
              className="card-hover rounded-lg border border-border bg-card p-6 sm:p-8 shadow-sm space-y-5"
              noValidate
            >
              <div>
                <h2 className="font-display text-xl font-bold">Send a message</h2>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  Every message goes straight to Sagar. I read every note and
                  reply within 3–5 business days.
                </p>
              </div>
              {/* Name row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium mb-1.5"
                  >
                    First name *
                  </label>
                  <input
                    id="firstName"
                    value={form.firstName}
                    onChange={(e) => update("firstName", e.target.value)}
                    maxLength={80}
                    autoComplete="given-name"
                    required
                    aria-invalid={!!errors.firstName}
                    aria-describedby={
                      errors.firstName ? "firstName-error" : undefined
                    }
                    className={inputClasses(!!errors.firstName)}
                  />
                  {fieldError("firstName")}
                </div>
                <div>
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium mb-1.5"
                  >
                    Last name
                  </label>
                  <input
                    id="lastName"
                    value={form.lastName}
                    onChange={(e) => update("lastName", e.target.value)}
                    maxLength={80}
                    autoComplete="family-name"
                    aria-invalid={!!errors.lastName}
                    aria-describedby={
                      errors.lastName ? "lastName-error" : undefined
                    }
                    className={inputClasses(!!errors.lastName)}
                  />
                  {fieldError("lastName")}
                </div>
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium mb-1.5"
                >
                  Email address *
                </label>
                <input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  maxLength={100}
                  autoComplete="email"
                  required
                  aria-invalid={!!errors.email}
                  aria-describedby={
                    errors.email ? "email-error" : undefined
                  }
                  className={inputClasses(!!errors.email)}
                />
                {fieldError("email")}
              </div>

              {/* Message + counter */}
              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium mb-1.5"
                >
                  Your message *
                </label>
                <textarea
                  id="message"
                  value={form.message}
                  onChange={(e) => update("message", e.target.value)}
                  maxLength={2000}
                  rows={5}
                  placeholder="What's on your mind?"
                  required
                  aria-invalid={!!errors.message}
                  aria-describedby={
                    errors.message ? "message-error" : undefined
                  }
                  className={`${inputClasses(!!errors.message)} resize-y`}
                />
                <div className="flex items-center justify-between mt-1.5">
                  {errors.message ? (
                    <p
                      id="message-error"
                      role="alert"
                      className="text-xs text-red-600"
                    >
                      {errors.message}
                    </p>
                  ) : (
                    <span />
                  )}
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {form.message.length}/2000
                  </span>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={state === "loading"}
                className="btn-premium w-full inline-flex items-center justify-center gap-2 rounded-full bg-accent text-accent-foreground px-8 py-3.5 text-sm font-semibold disabled:opacity-60 hover:opacity-90"
              >
                {state === "loading" && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                Send Message
              </button>

              {/* Feedback */}
              {state === "success" && (
                <p className="flex items-center gap-1.5 text-sm text-emerald-600 font-medium">
                  <CheckCircle2 className="w-4 h-4 shrink-0" /> {message}
                </p>
              )}
              {state === "error" && (
                <p className="flex items-center gap-1.5 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {message}
                </p>
              )}
            </form>
          </div>

          {/* ── Sidebar ───────────────────────────────────────── */}
          <aside className="flex flex-col gap-4" data-animate-group>
            {/* Contact info */}
            <div className="card-hover rounded-lg border border-border bg-card p-5 space-y-4" data-animate-item>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-md bg-brand/10 text-brand grid place-items-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">
                    Email
                  </p>
                  <a
                    href="mailto:contact@sagarlad.com"
                    className="text-sm font-medium text-foreground hover:text-brand transition-colors"
                  >
                    contact@sagarlad.com
                  </a>
                </div>
              </div>

              <div className="h-px bg-border" />

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-md bg-brand/10 text-brand grid place-items-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">
                    Based in
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    Gujarat, India
                  </p>
                </div>
              </div>

              <div className="h-px bg-border" />

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-md bg-brand/10 text-brand grid place-items-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">
                    Response time
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    3–5 business days
                  </p>
                </div>
              </div>
            </div>

            {/* Common topics */}
            <div className="card-hover rounded-lg border border-border bg-card p-5" data-animate-item>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Common topics
              </h3>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="text-brand">✦</span> Book feedback &amp; discussions
                </li>
                <li className="flex gap-2">
                  <span className="text-brand">✦</span> Speaking &amp; event inquiries
                </li>
                <li className="flex gap-2">
                  <span className="text-brand">✦</span> Collaboration &amp; partnerships
                </li>
                <li className="flex gap-2">
                  <span className="text-brand">✦</span> Career &amp; mentorship questions
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
