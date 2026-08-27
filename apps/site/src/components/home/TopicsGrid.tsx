"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import {
  Activity,
  Rocket,
  MessagesSquare,
  Award,
  Scale,
  CalendarCheck,
  Smile,
  HeartPulse,
  Brain,
  Flame,
} from "lucide-react";
import { Pill } from "@/components/ui/Pill";

const ICONS: Record<string, typeof Brain> = {
  Mindset: Brain,
  "Emotional Intelligence": Scale,
  Habits: CalendarCheck,
  Confidence: Award,
  Motivation: Flame,
  Communication: MessagesSquare,
  Career: Rocket,
  Health: HeartPulse,
  Happiness: Smile,
  Anxiety: Activity,
};

type Topic = {
  id: string;
  name: string;
  slug: string;
  postCount: number;
};

const COACH_TOPICS: Topic[] = [
  { id: "1", name: "Mindset", slug: "mindset", postCount: 0 },
  { id: "2", name: "Emotional Intelligence", slug: "emotional-intelligence", postCount: 0 },
  { id: "3", name: "Habits", slug: "habits", postCount: 0 },
  { id: "4", name: "Confidence", slug: "confidence", postCount: 0 },
  { id: "5", name: "Motivation", slug: "motivation", postCount: 0 },
  { id: "6", name: "Communication", slug: "communication", postCount: 0 },
  { id: "7", name: "Career", slug: "career", postCount: 0 },
  { id: "8", name: "Health", slug: "health", postCount: 0 },
];

const SORT_ORDER = [
  "Mindset",
  "Emotional Intelligence",
  "Habits",
  "Confidence",
  "Motivation",
  "Communication",
  "Career",
  "Health",
  "Happiness",
  "Anxiety",
];

function sortTopics(topics: Topic[]) {
  return [...topics].sort((a, b) => {
    const idxA = SORT_ORDER.indexOf(a.name);
    const idxB = SORT_ORDER.indexOf(b.name);
    return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
  });
}

function MarqueeTopicCard({ t, onPause, onResume }: { t: Topic; onPause: () => void; onResume: () => void }) {
  const Icon = ICONS[t.name] ?? Brain;
  return (
    <Link
      href={`/blog?category=${encodeURIComponent(t.slug)}`}
      className="group flex flex-col items-center justify-center text-center p-5 sm:p-9 rounded-xl border border-[#e2e8f0]/60 bg-white hover:border-brand hover:shadow-[0_8px_30px_rgba(13,33,161,0.08)] transition-all duration-300 shrink-0 h-[170px] sm:h-[220px] w-[180px] sm:w-[280px] select-none cursor-pointer"
      onMouseEnter={onPause}
      onMouseLeave={onResume}
    >
      <span className="grid h-10 w-10 sm:h-14 sm:w-14 place-items-center rounded-full bg-[#f1f5f9] text-[#475569] mb-3 sm:mb-4 transition-all duration-300 group-hover:bg-brand/10 group-hover:text-brand">
        <Icon className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={1.5} />
      </span>
      <h3 className="font-display text-sm sm:text-lg font-semibold leading-snug text-[#334155] group-hover:text-[#1e293b] transition-colors duration-200 line-clamp-2">
        {t.name}
      </h3>
    </Link>
  );
}

export function TopicsGrid({ topics }: { topics: Topic[] }) {
  const items = topics.length > 0 ? sortTopics(topics) : COACH_TOPICS;
  const list = items.slice(0, 8);
  const doubled = [...list, ...list, ...list];
  const trackRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);

  const pause = useCallback(() => setPaused(true), []);
  const resume = useCallback(() => setPaused(false), []);

  return (
    <section className="py-20 md:py-24 border-b border-border bg-background overflow-hidden" aria-label="Explore Topics">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
        <div className="w-full flex justify-center text-center">
          <Pill>Explore</Pill>
        </div>
        <h2 className="text-center font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mt-6 text-[#1e293b]">
          Simple ideas. Real results.
        </h2>
        <p className="mt-4 text-base text-[#94a3b8] leading-relaxed max-w-xl mx-auto">
          Practical wisdom for mindset, habits, confidence, and career growth.
        </p>
      </div>

      {/* Infinite Auto-scrolling Marquee Track */}
      <div
        className="mt-16 md:mt-20 relative overflow-hidden marquee-mask marquee-pauser"
        onMouseEnter={pause}
        onMouseLeave={resume}
      >
        <div
          ref={trackRef}
          className="flex w-max gap-3 sm:gap-6 animate-marquee py-3"
          style={{
            animationDuration: "50s",
            animationPlayState: paused ? "paused" : "running",
          }}
        >
          {doubled.map((t, i) => (
            <MarqueeTopicCard key={`${t.id}-${i}`} t={t} onPause={pause} onResume={resume} />
          ))}
        </div>
      </div>
    </section>
  );
}
