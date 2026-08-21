import type { Metadata } from "next";
import Image from "next/image";
import { CheckCircle2, ArrowRight, Star } from "lucide-react";
import { pageMetadata } from "@/lib/site";
import { METRICS } from "@/lib/metrics";

export const metadata: Metadata = pageMetadata({
  title: "Mentorship",
  description:
    "Book a 1:1 mentorship session with Sagar Lad — career guidance, portfolio reviews and honest advice on money, life and growth.",
  path: "/mentorship",
});

const BENEFITS = [
  "Honest assessment of where you stand right now",
  "Concrete action plan you can execute the same week",
  "Resume, portfolio & LinkedIn teardown with fixes",
  "Saving & investing guidance built around your reality",
  "Accountability check-in so the session sticks",
];

const STEPS = [
  { n: "01", title: "Pick a time", text: "Choose a slot that fits your schedule — instant confirmation." },
  { n: "02", title: "Show up prepared", text: "Share what you want to focus on beforehand so we skip the small talk." },
  { n: "03", title: "Leave with a plan", text: "Walk away with clear next steps, not just motivation." },
];

const FAQ = [
  {
    q: "What happens after I book?",
    a: "You'll get an instant confirmation email with a Google Meet link. Show up at the scheduled time — that's it.",
  },
  {
    q: "What should I prepare?",
    a: "Think about 1–2 specific things you want to work on. Bring your resume, portfolio, or questions — whatever is relevant.",
  },
  {
    q: "Can I book follow-up sessions?",
    a: "Yes. Most people book one session first, then decide if a follow-up makes sense. No packages, no commitments.",
  },
  {
    q: "What if I need to reschedule?",
    a: "Life happens. You can reschedule up to 24 hours before the session at no charge.",
  },
];

export default function MentorshipPage() {
  return (
    <div className="bg-background overflow-x-clip">
      {/* ── Hero ── */}
      <section className="relative border-b border-border bg-foreground text-background overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0D21A1] via-[#0D21A1] to-[#3F88C5]" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* Copy */}
            <div className="lg:col-span-7 space-y-6">
              <span className="inline-flex items-center rounded-full bg-accent/20 border border-accent/30 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white">
                1:1 Mentorship
              </span>
              <h1 className="font-display text-4xl sm:text-5xl md:text-[3.5rem] font-bold tracking-tight leading-[1.1]">
                Thirty minutes that change
                <span className="text-[#FFD51D]"> your trajectory.</span>
              </h1>
              <p className="text-white/80 text-base sm:text-lg leading-relaxed max-w-xl">
                No fluff. No generic advice. One practical session with Sagar on your career, money, or whatever is holding you back.
              </p>
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <a
                  href="#book"
                  className="inline-flex items-center gap-2 rounded-full bg-accent text-accent-foreground px-7 py-3.5 text-sm font-semibold hover:opacity-95 transition-all shadow-lg"
                >
                  Book your session <ArrowRight className="w-4 h-4" />
                </a>
                <div className="flex items-center gap-2 text-white/70 text-sm">
                  <div className="flex -space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-[#FFD51D] text-[#FFD51D]" />
                    ))}
                  </div>
                  <span>Trusted by professionals worldwide</span>
                </div>
              </div>
            </div>

            {/* Portrait */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="relative h-64 w-64 sm:h-80 sm:w-80 lg:h-[400px] lg:w-[400px] rounded-[2.5rem] overflow-hidden ring-4 ring-white/10">
                <Image
                  src="/images/sagar-author.png"
                  alt="Sagar Lad"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 320px, 400px"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Social proof strip ── */}
      <section className="border-b border-border bg-muted/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="grid grid-cols-3 gap-4 divide-x divide-border">
            {[
              { value: METRICS.keynotes, label: "Keynotes delivered" },
              { value: "100%", label: "Satisfaction rate" },
              { value: "24h", label: "Response time" },
            ].map((s) => (
              <div key={s.label} className="text-center px-3">
                <p className="font-display text-xl sm:text-2xl font-extrabold tracking-tight">{s.value}</p>
                <p className="mt-1 text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 md:py-20 space-y-20">
        {/* ── What you'll get ── */}
        <section>
          <div className="max-w-2xl mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-accent-strong">What you&apos;ll walk away with</span>
            <h2 className="mt-2 font-display text-3xl sm:text-4xl font-bold">One session. Real outcomes.</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {BENEFITS.map((b) => (
              <div
                key={b}
                className="flex items-start gap-3 rounded-2xl border border-border bg-card p-5 hover:border-brand-light/60 transition-colors"
              >
                <CheckCircle2 className="w-5 h-5 text-[#3F88C5] shrink-0 mt-0.5" />
                <p className="text-sm leading-relaxed">{b}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── How it works ── */}
        <section>
          <div className="max-w-2xl mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-accent-strong">How it works</span>
            <h2 className="mt-2 font-display text-3xl sm:text-4xl font-bold">Three steps. That&apos;s it.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STEPS.map((s) => (
              <div key={s.n} className="rounded-3xl border border-border bg-card p-7 hover:border-brand-light/60 transition-colors">
                <span className="inline-grid place-items-center w-11 h-11 rounded-xl bg-accent text-accent-foreground font-display text-base font-extrabold">
                  {s.n}
                </span>
                <h3 className="mt-4 font-display text-lg font-bold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Testimonial ── */}
        <section className="rounded-3xl border border-border bg-card p-8 sm:p-10 text-center">
          <div className="flex justify-center mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-[#FFD51D] text-[#FFD51D]" />
            ))}
          </div>
          <blockquote className="text-lg sm:text-xl font-medium leading-relaxed max-w-2xl mx-auto">
            &ldquo;Sagar gave me more clarity in 30 minutes than I got from months of YouTube videos. I knew exactly what to do next.&rdquo;
          </blockquote>
          <footer className="mt-6 text-sm text-muted-foreground">
            — Mentorship session attendee
          </footer>
        </section>

        {/* ── Booking widget ── */}
        <section id="book">
          <div className="rounded-3xl border border-border bg-card overflow-hidden shadow-sm">
            {/* Branded header */}
            <div className="flex items-center gap-4 border-b border-border bg-muted/30 px-6 py-5 sm:px-8">
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl">
                <Image
                  src="/images/sagar-author.png"
                  alt="Sagar Lad"
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-display text-lg font-bold">Book a 1:1 with Sagar</h2>
                <p className="text-sm text-muted-foreground">30 min · Online · Instant confirmation</p>
              </div>
              <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Available
              </span>
            </div>

            {/* Iframe — hue-rotate shifts Topmate red → brand blue (#0D21A1) */}
            <div className="relative" style={{ height: "720px" }}>
              <iframe
                src="https://topmate.io/embed/profile/sagar_lad"
                title="Book a mentorship session with Sagar Lad"
                className="absolute inset-0 w-full h-full border-0"
                style={{
                  clipPath: "inset(0 0 60px 0)",
                  filter: "hue-rotate(230deg) saturate(0.85)",
                }}
                loading="lazy"
                allowFullScreen
              />
            </div>

            {/* Branded footer */}
            <div className="border-t border-border bg-muted/30 px-6 py-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
              <p>Online via Google Meet · Link sent after booking</p>
              <p className="text-xs">
                <span className="font-semibold text-foreground">Sagar Lad</span> · Mentorship
              </p>
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section>
          <div className="max-w-2xl mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-accent-strong">FAQ</span>
            <h2 className="mt-2 font-display text-3xl sm:text-4xl font-bold">Common questions</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {FAQ.map((f) => (
              <div key={f.q} className="rounded-2xl border border-border bg-card p-6">
                <h3 className="font-display text-base font-bold">{f.q}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Final CTA ── */}
        <section className="text-center py-8">
          <h2 className="font-display text-3xl sm:text-4xl font-bold">Ready to move forward?</h2>
          <p className="mt-3 text-muted-foreground max-w-lg mx-auto">
            Thirty minutes. One conversation. A clear path ahead.
          </p>
          <a
            href="#book"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-accent text-accent-foreground px-8 py-3.5 text-sm font-semibold hover:opacity-95 transition-all shadow-lg"
          >
            Book your session <ArrowRight className="w-4 h-4" />
          </a>
        </section>
      </div>
    </div>
  );
}
