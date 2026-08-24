import Link from "next/link";
import { ArrowRight, Mic2, Globe, GraduationCap, Trophy } from "lucide-react";

const talks = [
  {
    event: "Scottish Summit",
    topic: "AI & Data Leadership in the Real World",
    place: "Scotland",
    icon: Globe,
  },
  {
    event: "Azure Summit",
    topic: "Building a Financial Mindset for Engineers",
    place: "Global",
    icon: Trophy,
  },
  {
    event: "IIChE Centre of Excellence",
    topic: "From Data Engineer to Author",
    place: "India",
    icon: GraduationCap,
  },
];

export function SpeakingHighlights() {
  return (
    <section className="py-20 md:py-24 bg-muted/40 border-b border-border" aria-label="Speaking">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left — headline */}
          <div className="lg:col-span-4 lg:sticky lg:top-24">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-strong mb-3">
              On Stage
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Talks that move rooms.
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Keynotes on AI leadership, financial mindset, and career momentum — at summits, universities, and enterprise events.
            </p>
            <Link
              href="/speaking"
              className="inline-flex items-center gap-2 rounded-full bg-accent text-accent-foreground px-6 py-3 text-sm font-semibold hover:opacity-95 transition-all shadow-md"
            >
              Book me to speak <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Right — talk cards */}
          <div className="lg:col-span-8 space-y-4">
            {talks.map((t) => {
              const Icon = t.icon;
              return (
                <div
                  key={t.event}
                  className="group flex items-start gap-5 rounded-2xl border border-border bg-card p-6 transition-all hover:shadow-md hover:border-brand-light/40"
                >
                  <span className="shrink-0 grid h-11 w-11 place-items-center rounded-xl bg-brand/5 text-accent-strong">
                    <Icon className="w-5 h-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                      {t.event} · {t.place}
                    </p>
                    <h3 className="font-display text-lg font-bold leading-snug">
                      {t.topic}
                    </h3>
                  </div>
                  <Mic2 className="w-4 h-4 text-muted-foreground/30 shrink-0 mt-1 hidden sm:block" />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
