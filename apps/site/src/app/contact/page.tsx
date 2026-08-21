"use client";

import { useState } from "react";
import { Loader2, CheckCircle2, AlertCircle, Mail, MapPin } from "lucide-react";
import { FaInstagram, FaYoutube, FaLinkedinIn } from "react-icons/fa6";
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

const socials = [
  { label: "Instagram", href: "https://instagram.com/sagarlad", icon: FaInstagram },
  { label: "YouTube", href: "https://youtube.com/@sagarlad", icon: FaYoutube },
  { label: "LinkedIn", href: "https://linkedin.com/in/sagarlad", icon: FaLinkedinIn },
];

export default function ContactPage() {
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState<Errors>({});
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
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
        setMessage("Thank you! Your message has been sent. Sagar will get back to you soon.");
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

  const input = (hasError?: boolean) =>
    `rounded-2xl border px-4 py-3 text-sm outline-none focus:ring-2 w-full transition-colors ${
      hasError
        ? "border-red-400 focus:ring-red-300"
        : "border-border bg-background focus:ring-accent"
    }`;

  const fieldError = (key: keyof Errors) =>
    errors[key] ? (
      <p id={`${key}-error`} role="alert" className="mt-1.5 text-xs text-red-600">
        {errors[key]}
      </p>
    ) : null;

  return (
    <div className="overflow-x-clip">
      <section className="border-b border-border bg-background py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-brand">
            Get In Touch
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
            Let&apos;s <span className="text-brand">connect.</span>
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto">
            Have a question, feedback on a book, or a thought to share? Send a message directly to Sagar.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12 md:py-16 grid md:grid-cols-[1fr_320px] gap-10 lg:gap-14 items-start">
        {/* Left — form */}
        <div>
          <h2 className="font-display text-xl font-bold">Direct &amp; Personal</h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Every message goes straight to Sagar. I read every note and reply within 3–5 days.
          </p>

          <form
            onSubmit={onSubmit}
            className="mt-8 rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-5 shadow-sm"
            noValidate
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium mb-1.5">
                  First name *
                </label>
                <input
                  id="firstName"
                  value={form.firstName}
                  onChange={(e) => update("firstName", e.target.value)}
                  maxLength={80}
                  autoComplete="given-name"
                  className={input(!!errors.firstName)}
                  required
                />
                {fieldError("firstName")}
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium mb-1.5">
                  Last name
                </label>
                <input
                  id="lastName"
                  value={form.lastName}
                  onChange={(e) => update("lastName", e.target.value)}
                  maxLength={80}
                  autoComplete="family-name"
                  className={input(!!errors.lastName)}
                />
                {fieldError("lastName")}
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1.5">
                Email address *
              </label>
              <input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                maxLength={100}
                autoComplete="email"
                className={input(!!errors.email)}
                required
              />
              {fieldError("email")}
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium mb-1.5">
                Your message *
              </label>
              <textarea
                id="message"
                value={form.message}
                onChange={(e) => update("message", e.target.value)}
                maxLength={2000}
                className={`${input(!!errors.message)} resize-y`}
                rows={5}
                placeholder="What's on your mind?"
                required
              />
              {fieldError("message")}
            </div>

            <button
              type="submit"
              disabled={state === "loading"}
              className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-accent text-accent-foreground px-8 py-3.5 text-sm font-semibold disabled:opacity-60 hover:opacity-90 transition-opacity shadow-md"
            >
              {state === "loading" && <Loader2 className="w-4 h-4 animate-spin" />}
              Send Message
            </button>

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

        {/* Right — info sidebar */}
        <aside className="flex flex-col gap-4">
          <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand-light/15 text-brand grid place-items-center shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">Email</p>
                <a href="mailto:contact@sagarlad.com" className="text-sm font-medium text-foreground hover:text-brand transition-colors">
                  contact@sagarlad.com
                </a>
              </div>
            </div>

            <div className="h-px bg-border" />

            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand-light/15 text-brand grid place-items-center shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">Based in</p>
                <p className="text-sm font-medium text-foreground">Mumbai, India</p>
              </div>
            </div>
          </div>

          {/* 3 social icons — centered */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-center gap-4">
              {socials.map((s) => {
                const Icon = s.icon;
                return (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="w-10 h-10 rounded-xl border border-border bg-background grid place-items-center text-muted-foreground hover:border-brand-light/60 hover:bg-muted/50 transition-all"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="font-semibold text-foreground text-sm mb-1">Response time</h3>
            <p className="text-sm text-muted-foreground">I typically reply within 24–48 hours.</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="font-semibold text-foreground text-sm mb-1">Availability</h3>
            <p className="text-sm text-muted-foreground">Open to speaking, consulting and collaboration conversations.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
