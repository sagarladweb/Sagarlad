import Link from "next/link";
import { Pill } from "@/components/ui/Pill";

export function MentorshipCta() {
  return (
    <section
      className="py-16 md:py-24 border-b border-border bg-muted/30"
      aria-label="Mentorship"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <Pill className="mb-4">1-on-1 Mentorship</Pill>
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-accent-strong">
            One conversation. Total clarity.
          </h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Stuck in your career or building something new? A single honest
            conversation can save you months.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              href="/mentorship"
              className="inline-flex items-center justify-center rounded-full bg-accent text-accent-foreground px-8 py-3 text-sm font-semibold shadow-sm hover:opacity-90 transition-opacity"
            >
              Book a session
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
