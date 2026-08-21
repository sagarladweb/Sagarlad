import type { Metadata } from "next";
import Image from "next/image";
import { pageMetadata } from "@/lib/site";
import { PageHeader } from "@/components/PageHeader";
import { Calendar, Clock, Video, Shield } from "lucide-react";

export const metadata: Metadata = pageMetadata({
  title: "Mentorship",
  description:
    "Book a 1:1 mentorship session with Sagar Lad — career guidance, portfolio reviews and honest advice on money, life and growth.",
  path: "/mentorship",
});

const BENEFITS = [
  {
    title: "Career clarity",
    body: "Get an honest read on where you are and what to do next — no fluff, no generic advice.",
    icon: Calendar,
  },
  {
    title: "Portfolio & resume review",
    body: "A practical teardown of your resume, GitHub or portfolio with concrete fixes you can apply the same day.",
    icon: Shield,
  },
  {
    title: "Money & investing",
    body: "Simplified, actionable guidance on saving, investing and building wealth — built around your reality.",
    icon: Clock,
  },
  {
    title: "Follow-up accountability",
    body: "Leave with a clear action plan and a follow-up so the session actually changes something.",
    icon: Video,
  },
];

export default function MentorshipPage() {
  return (
    <>
      <PageHeader
        eyebrow="Mentorship"
        title="Let's work on your growth, 1:1"
        subtitle="Thirty minutes with Sagar — a practical, no-nonsense session on your career, money, or whatever is holding you back."
      />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 space-y-16">
        {/* Benefits grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {BENEFITS.map((b) => {
            const Icon = b.icon;
            return (
              <div
                key={b.title}
                className="rounded-3xl border border-border bg-card p-6 group hover:border-brand-light/60 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-brand-light/15 text-brand grid place-items-center mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <h2 className="font-display text-lg font-bold">{b.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {b.body}
                </p>
              </div>
            );
          })}
        </div>

        {/* Booking section — branded wrapper around Topmate embed */}
        <div className="rounded-3xl border border-border bg-card overflow-hidden shadow-sm">
          {/* Branded header */}
          <div className="flex items-center gap-4 border-b border-border bg-muted/30 px-6 py-5 sm:px-8">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl">
              <Image
                src="/images/sagar-author.png"
                alt="Sagar Lad"
                fill
                className="object-cover"
                sizes="56px"
              />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="font-display text-lg font-bold">Book a session with Sagar</h2>
              <p className="text-sm text-muted-foreground">
                30-minute online session · Instant confirmation
              </p>
            </div>
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-accent/15 border border-accent/25 px-3 py-1 text-xs font-semibold text-accent-strong">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Available
            </span>
          </div>

          {/* Iframe — clipped to hide external branding */}
          <div className="relative" style={{ height: "720px" }}>
            <iframe
              src="https://topmate.io/embed/profile/sagar_lad"
              title="Book a mentorship session with Sagar Lad"
              className="absolute inset-0 w-full h-full border-0"
              style={{
                clipPath: "inset(0 0 60px 0)",
              }}
              loading="lazy"
              allowFullScreen
            />
          </div>

          {/* Branded footer */}
          <div className="border-t border-border bg-muted/30 px-6 py-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
            <p>Sessions are held online via Google Meet — link sent after booking.</p>
            <p className="text-xs">
              Powered by <span className="font-semibold text-foreground">Sagar Lad</span>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
