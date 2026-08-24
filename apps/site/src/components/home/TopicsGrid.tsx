import Link from "next/link";
import {
  Brain,
  BookOpen,
  Database,
  TrendingUp,
  Rocket,
  Users,
  Mic2,
  Globe,
  Cloud,
  HeartHandshake,
  Lightbulb,
  GraduationCap,
  Target,
  BarChart3,
  Zap,
  Compass,
  Briefcase,
  Shield,
  Code,
  Sparkles,
} from "lucide-react";

const ICONS: Record<string, typeof Brain> = {
  "AI & Data": Database,
  Mindset: Brain,
  Finance: TrendingUp,
  Career: Rocket,
  Books: BookOpen,
  Leadership: Users,
  Speaking: Mic2,
  Community: Globe,
  Cloud: Cloud,
  Mentorship: HeartHandshake,
  Innovation: Lightbulb,
  Education: GraduationCap,
  Goals: Target,
  Analytics: BarChart3,
  Productivity: Zap,
  Strategy: Compass,
  Business: Briefcase,
  Security: Shield,
  Technology: Code,
  Inspiration: Sparkles,
};

type Topic = {
  id: string;
  name: string;
  slug: string;
  postCount: number;
};

const FALLBACK: Topic[] = [
  { id: "1", name: "AI & Data", slug: "ai-data", postCount: 0 },
  { id: "2", name: "Mindset", slug: "mindset", postCount: 0 },
  { id: "3", name: "Finance", slug: "finance", postCount: 0 },
  { id: "4", name: "Career", slug: "career", postCount: 0 },
  { id: "5", name: "Books", slug: "books", postCount: 0 },
  { id: "6", name: "Leadership", slug: "leadership", postCount: 0 },
  { id: "7", name: "Speaking", slug: "speaking", postCount: 0 },
  { id: "8", name: "Community", slug: "community", postCount: 0 },
  { id: "9", name: "Cloud", slug: "cloud", postCount: 0 },
  { id: "10", name: "Mentorship", slug: "mentorship", postCount: 0 },
];

export function TopicsGrid({ topics }: { topics: Topic[] }) {
  const items = topics.length > 0 ? topics : FALLBACK;
  const grid = items.slice(0, 10);

  return (
    <section className="py-20 md:py-24 border-b border-border" aria-label="Topics">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Heading */}
        <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-accent-strong">
          What I Write About
        </p>
        <h2 className="text-center font-display text-3xl sm:text-4xl font-bold tracking-tight mt-3">
          Simple ideas. Real results.
        </h2>

        {/* Spacer — the key fix */}
        <div className="h-16" />

        {/* Mobile: horizontal scroll */}
        <div className="md:hidden -mx-4 px-4 overflow-x-auto no-scrollbar">
          <div className="flex gap-3 pb-2" style={{ minWidth: "max-content" }}>
            {grid.map((t) => {
              const Icon = ICONS[t.name] ?? Database;
              return (
                <Link
                  key={t.id}
                  href={`/blog?category=${encodeURIComponent(t.slug)}`}
                  className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-left transition-all hover:shadow-md hover:border-brand-light/40 shrink-0"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand/10 text-accent-strong">
                    <Icon className="w-4 h-4" />
                  </span>
                  <span className="font-display text-sm font-bold leading-tight whitespace-nowrap">
                    {t.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Desktop: 5x2 grid */}
        <div className="hidden md:grid grid-cols-5 gap-4">
          {grid.map((t) => {
            const Icon = ICONS[t.name] ?? Database;
            return (
              <Link
                key={t.id}
                href={`/blog?category=${encodeURIComponent(t.slug)}`}
                className="group flex flex-col items-center text-center p-5 rounded-xl border border-border bg-card transition-all hover:shadow-lg hover:border-brand-light/40 hover:-translate-y-0.5"
              >
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand/10 text-accent-strong mb-3 transition-transform group-hover:scale-110">
                  <Icon className="w-5 h-5" />
                </span>
                <h3 className="font-display text-sm font-bold leading-snug group-hover:text-accent-strong transition-colors">
                  {t.name}
                </h3>
                {t.postCount > 0 && (
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {t.postCount} post{t.postCount === 1 ? "" : "s"}
                  </p>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
