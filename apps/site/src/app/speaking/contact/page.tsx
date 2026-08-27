"use client";

import { useState } from "react";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { validateContact, sanitizeText, digitsOnly } from "@/lib/client-validators";
import { Dropdown } from "@/components/ui/Dropdown";
import { Calendar } from "@/components/ui/Calendar";
import { SocialLinks } from "@/components/SocialLinks";

import Image from "next/image";

const initial = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  organization: "",
  eventDate: "",
  message: "",
  type: "KEYNOTE" as string,
};

type Errors = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  organization?: string;
  message?: string;
};

export default function SpeakingContactPage() {
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
      phone: digitsOnly(form.phone),
      organization: sanitizeText(form.organization),
      eventDate: form.eventDate,
      message: form.message.trim(),
      type: form.type === "INTERVIEW" ? "INTERVIEW" : "SPEAKING",
    };
    const validationErrors = validateContact(payload);
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      setState("error");
      setMessage("Please fix the highlighted fields.");
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
          "Thank you! Your booking request has been received. I'll get back to you within 3–5 working days."
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

  const input = (hasError?: boolean) =>
    `rounded-xl border px-4 py-2.5 text-sm outline-none focus:ring-2 w-full transition-colors ${
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
      {/* Event Booking Hero — white, light-blue gradient behind the portrait, blue accents */}
      <header className="overflow-hidden border-b border-border bg-background text-foreground py-16 sm:py-24">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-5">
            <div className="relative mx-auto w-full max-w-[380px]">
              <div aria-hidden="true" className="absolute left-1/2 top-1/2 aspect-square w-[75%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-brand-light/45 via-brand-light/20 to-transparent blur-2xl" />
              <Image
                src="/images/sagar-author.webp"
                alt="Sagar Lad"
                width={477}
                height={523}
                priority
                className="relative z-10 h-auto w-full drop-shadow-2xl"
              />
            </div>
          </div>

          <div className="lg:col-span-7 lg:pl-6">
            <span className="btn-premium inline-block text-xs font-semibold tracking-wide text-brand bg-brand-light/10 rounded-full px-4 py-1.5">
              Book Sagar
              Speaking &amp; Keynotes
            </span>
            <h1 className="mt-4 font-display text-4xl font-bold leading-tight sm:text-5xl tracking-tight">
              Book Sagar for your next <span className="text-brand">event</span>
            </h1>
            <p className="mt-4 max-w-xl text-base sm:text-lg text-muted-foreground leading-relaxed">
              Story-driven keynotes, interactive workshops, and executive panels on AI leadership, financial freedom, and career momentum.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "Keynotes, corporate summits & workshops",
                "Customized content mapped to your event theme",
                "High audience engagement with Q&A and takeaway guides",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm font-semibold text-foreground">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-16 grid grid-cols-1 lg:grid-cols-5 gap-10">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h2 className="font-display text-xl font-bold">What to expect</h2>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              I typically respond within 3–5 working days. Please share as much
              detail as possible about your event — audience, theme, and dates.
            </p>
          </div>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <span className="text-accent">✦</span> Keynote & conference talks
            </li>
            <li className="flex gap-2">
              <span className="text-accent">✦</span> Corporate summits & off-sites
            </li>
            <li className="flex gap-2">
              <span className="text-accent">✦</span> Campus & university events
            </li>
            <li className="flex gap-2">
              <span className="text-accent">✦</span> Workshops & fireside chats
            </li>
          </ul>

          <div>
            <h2 className="font-display text-xl font-bold">Find me on</h2>
            <div className="mt-4">
              <SocialLinks />
            </div>
          </div>
        </div>

        <form
          onSubmit={onSubmit}
          className="card-hover lg:col-span-3 rounded-lg border border-border bg-card p-6 sm:p-8 space-y-4"
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
                aria-invalid={!!errors.firstName}
                aria-describedby={errors.firstName ? "firstName-error" : undefined}
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
                aria-invalid={!!errors.lastName}
                aria-describedby={errors.lastName ? "lastName-error" : undefined}
                className={input(!!errors.lastName)}
              />
              {fieldError("lastName")}
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1.5">
              Email *
            </label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              maxLength={100}
              autoComplete="email"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-error" : undefined}
              className={input(!!errors.email)}
              required
            />
            {fieldError("email")}
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium mb-1.5">
              Mobile number
            </label>
            <input
              id="phone"
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              value={form.phone}
              onChange={(e) => update("phone", digitsOnly(e.target.value).slice(0, 10))}
              placeholder="10-digit mobile number"
              maxLength={10}
              aria-invalid={!!errors.phone}
              aria-describedby={errors.phone ? "phone-error" : undefined}
              className={input(!!errors.phone)}
            />
            {fieldError("phone")}
          </div>

          <div>
            <label htmlFor="organization" className="block text-sm font-medium mb-1.5">
              Organization / Event *
            </label>
            <input
              id="organization"
              value={form.organization}
              onChange={(e) => update("organization", e.target.value)}
              maxLength={120}
              autoComplete="organization"
              aria-invalid={!!errors.organization}
              aria-describedby={errors.organization ? "organization-error" : undefined}
              className={input(!!errors.organization)}
              required
            />
            {fieldError("organization")}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span id="eventDate-label" className="block text-sm font-medium mb-1.5">
                Tentative date
              </span>
              <Calendar
                id="eventDate"
                label="Tentative event date"
                value={form.eventDate}
                onChange={(value) => update("eventDate", value)}
                placeholder="Select a date"
              />
            </div>
            <div>
              <span id="type-label" className="block text-sm font-medium mb-1.5">
                Engagement type
              </span>
              <Dropdown
                id="type"
                label="Engagement type"
                value={form.type}
                onChange={(value) => update("type", value)}
                placeholder="Select an engagement type"
                options={[
                  { value: "KEYNOTE", label: "Keynote / Conference" },
                  { value: "WORKSHOP", label: "Workshop / Training" },
                  { value: "CAMPUS", label: "Campus / University" },
                  { value: "INTERVIEW", label: "Podcast / Interview" },
                ]}
              />
            </div>
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium mb-1.5">
              Tell me more
            </label>
            <textarea
              id="message"
              value={form.message}
              onChange={(e) => update("message", e.target.value)}
              maxLength={2000}
              aria-invalid={!!errors.message}
              aria-describedby={errors.message ? "message-error" : undefined}
              className={`${input(!!errors.message)} resize-y`}
              rows={4}
            />
            {fieldError("message")}
          </div>

          <button
            type="submit"
            disabled={state === "loading"}
            className="btn-premium w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-accent text-accent-foreground px-8 py-3 text-sm font-semibold disabled:opacity-60 hover:opacity-90"
          >
            {state === "loading" && <Loader2 className="w-4 h-4 animate-spin" />}
            Submit booking request
          </button>

          {state === "success" && (
            <p className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
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