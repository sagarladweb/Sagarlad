"use client";

import { useState } from "react";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { validateContact, sanitizeText } from "@/lib/client-validators";
import { SocialLinks } from "@/components/SocialLinks";

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
    <>
      {/* Clean minimal header — white, blue accent eyebrow + highlight */}
      <section className="border-b border-border bg-background py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center space-y-4">
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

      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-16 grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-5 space-y-6">
          <div>
            <h2 className="font-display text-xl font-bold">Direct &amp; Personal</h2>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Every message goes straight to Sagar. I read every note and reply within 3–5 days.
            </p>
          </div>

          <div className="pt-4 border-t border-border">
            <h2 className="font-display text-base font-bold mb-3">Connect on socials</h2>
            <SocialLinks />
          </div>
        </div>

        <form
          onSubmit={onSubmit}
          className="lg:col-span-7 rounded-3xl border border-border bg-card p-6 sm:p-8 space-y-5 shadow-sm"
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
    </>
  );
}