import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site";
import { PageHeader } from "@/components/PageHeader";

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
  },
  {
    title: "Portfolio & resume review",
    body: "A practical teardown of your resume, GitHub or portfolio with concrete fixes you can apply the same day.",
  },
  {
    title: "Money & investing",
    body: "Simplified, actionable guidance on saving, investing and building wealth — built around your reality.",
  },
  {
    title: "Accountability",
    body: "Leave with a clear action plan and a follow-up so the session actually changes something.",
  },
];

export default function MentorshipPage() {
  return (
    <>
      <PageHeader
        eyebrow="Mentorship"
        title="Let's work on your growth, 1:1"
        subtitle="Thirty minutes with Sagar — a practical, no-nonsense session on your career, money, or whatever is holding you back. Book directly below."
      />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 space-y-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {BENEFITS.map((b) => (
            <div
              key={b.title}
              className="rounded-3xl border border-border bg-card p-6"
            >
              <h2 className="font-display text-lg font-bold">{b.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {b.body}
              </p>
            </div>
          ))}
        </div>

        <div className="rounded-3xl border border-border bg-card p-4 sm:p-8">
          <div className="mb-6 text-center">
            <h2 className="font-display text-2xl font-bold">
              Pick a slot that works for you
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Sessions are held online — you&apos;ll get the meeting link right after booking.
            </p>
          </div>
          <div className="overflow-hidden rounded-3xl border border-border">
            <iframe
              src="https://topmate.io/embed/profile/sagar_lad"
              title="Book a mentorship session with Sagar Lad"
              className="w-full"
              style={{ height: "720px", border: "none" }}
              loading="lazy"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </>
  );
}
