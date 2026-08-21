import type { Metadata } from "next";
import Image from "next/image";
import { ArrowRight, MapPin, ChevronDown } from "lucide-react";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Mentorship",
  description:
    "Book a 1:1 mentorship session with Sagar Lad — career guidance, portfolio reviews and honest advice.",
  path: "/mentorship",
});

const TESTIMONIALS = [
  {
    quote: "Sagar gave me more clarity in 30 minutes than I got from months of YouTube videos. I knew exactly what to do next.",
    name: "Priya M.",
    role: "Product Designer",
  },
  {
    quote: "I was stuck in my career for over a year. One session with Sagar and I had a concrete plan — within two months I had a new role.",
    name: "Rohit K.",
    role: "Software Engineer",
  },
  {
    quote: "No sugar-coating, no generic advice. He told me exactly where I was going wrong and how to fix it. Best investment I've made.",
    name: "Ankit S.",
    role: "Marketing Lead",
  },
  {
    quote: "The resume teardown alone was worth it. He spotted issues I'd been blind to for months. Got callbacks within a week of updating it.",
    name: "Neha D.",
    role: "UX Researcher",
  },
  {
    quote: "Sagar doesn't just give advice — he gives you a system. I still follow the framework he shared in our session.",
    name: "Vikram P.",
    role: "Startup Founder",
  },
];

const STEPS = [
  { n: "01", title: "Pick a time", text: "Choose a slot that works for you." },
  { n: "02", title: "Show up", text: "Share what you want to focus on beforehand." },
  { n: "03", title: "Leave with a plan", text: "Walk away with clear next steps." },
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

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <details className="group border border-border rounded-2xl bg-card overflow-hidden">
      <summary className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer text-sm font-semibold text-foreground list-none [&::-webkit-details-marker]:hidden">
        {q}
        <ChevronDown className="w-4 h-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
      </summary>
      <div className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed">
        {a}
      </div>
    </details>
  );
}

export default function MentorshipPage() {
  return (
    <div className="bg-background">
      {/* ── Hero — profile card style ── */}
      <section className="border-b border-border bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <div className="flex flex-col items-center text-center">
            {/* Portrait */}
            <div className="relative h-28 w-28 sm:h-32 sm:w-32 rounded-full overflow-hidden ring-4 ring-border mb-6">
              <Image
                src="/images/sagar-author.png"
                alt="Sagar Lad"
                fill
                className="object-cover"
                sizes="128px"
                priority
              />
            </div>
            {/* Name + meta */}
            <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
              Sagar Lad
            </h1>
            <p className="mt-2 text-muted-foreground text-sm sm:text-base max-w-md">
              Author, keynote speaker and mentor. I help professionals make better career, money and life decisions.
            </p>
            <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
              <MapPin className="w-3.5 h-3.5" />
              Mumbai, India
            </div>
            <a
              href="#book"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-accent text-accent-foreground px-7 py-3 text-sm font-semibold hover:opacity-95 transition-all"
            >
              Book a session <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* ── Social proof ── */}
      <section className="border-b border-border bg-muted/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-5">
          <div className="flex items-center justify-center gap-6 sm:gap-10 text-center text-xs text-muted-foreground">
            <span><strong className="text-foreground font-semibold">50+</strong> mentees</span>
            <span className="h-1 w-1 rounded-full bg-border" />
            <span><strong className="text-foreground font-semibold">100%</strong> satisfaction</span>
            <span className="h-1 w-1 rounded-full bg-border" />
            <span><strong className="text-foreground font-semibold">24h</strong> response</span>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16 space-y-16">
        {/* ── How it works ── */}
        <section>
          <h2 className="font-display text-2xl font-bold mb-8">How it works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {STEPS.map((s) => (
              <div key={s.n} className="rounded-2xl border border-border bg-card p-5">
                <span className="inline-grid place-items-center w-9 h-9 rounded-lg bg-accent text-accent-foreground font-display text-sm font-extrabold">
                  {s.n}
                </span>
                <h3 className="mt-3 font-display text-sm font-bold">{s.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{s.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Testimonials ── */}
        <section>
          <h2 className="font-display text-2xl font-bold mb-8">What people say</h2>
          <div className="space-y-4">
            {TESTIMONIALS.map((t) => (
              <blockquote
                key={t.name}
                className="rounded-2xl border border-border bg-card p-5 sm:p-6"
              >
                <p className="text-sm leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
                <footer className="mt-3 text-xs text-muted-foreground">
                  <strong className="text-foreground font-medium">{t.name}</strong> · {t.role}
                </footer>
              </blockquote>
            ))}
          </div>
        </section>

        {/* ── Booking widget — minimal ── */}
        <section id="book">
          <h2 className="font-display text-2xl font-bold mb-6">Book a session</h2>
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="relative" style={{ height: "680px" }}>
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
          </div>
        </section>

        {/* ── FAQ — collapsible ── */}
        <section>
          <h2 className="font-display text-2xl font-bold mb-6">FAQ</h2>
          <div className="space-y-3">
            {FAQ.map((f) => (
              <FaqItem key={f.q} q={f.q} a={f.a} />
            ))}
          </div>
        </section>

        {/* ── Final CTA ── */}
        <section className="text-center py-6">
          <p className="text-muted-foreground text-sm">
            Thirty minutes. One conversation. A clear path ahead.
          </p>
          <a
            href="#book"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-accent text-accent-foreground px-7 py-3 text-sm font-semibold hover:opacity-95 transition-all"
          >
            Book your session <ArrowRight className="w-4 h-4" />
          </a>
        </section>
      </div>
    </div>
  );
}
