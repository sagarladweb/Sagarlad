"use client";

import { useEffect, useRef, useState } from "react";
import { BookOpen, Users, Lightbulb, TrendingUp } from "lucide-react";

type Book = {
  id: string;
  title: string;
  author: string | null;
  learning: string | null;
};

function useCountUp(target: number, duration = 1200, enabled = false) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!enabled || target === 0) return;
    const start = performance.now();
    let raf: number;
    const step = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, enabled]);

  return count;
}

export function BookStats({ books }: { books: Book[] }) {
  const [visible, setVisible] = useState(false);
  const [hidden, setHidden] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const totalBooks = books.length;
  const uniqueAuthors = new Set(books.map((b) => b.author).filter(Boolean)).size;
  const withLearnings = books.filter((b) => b.learning).length;
  const insightPct = totalBooks > 0 ? Math.round((withLearnings / Math.max(totalBooks, 1)) * 100) : 0;

  // Trigger count animation when bar scrolls into view
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          // Auto-hide after 10s
          const t = setTimeout(() => setHidden(true), 10_000);
          io.disconnect();
          return () => clearTimeout(t);
        }
      },
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const cCount = useCountUp(totalBooks, 1200, visible);
  const aCount = useCountUp(uniqueAuthors, 1200, visible);
  const lCount = useCountUp(withLearnings, 1200, visible);
  const iPct = useCountUp(insightPct, 1200, visible);

  if (hidden) return null;

  return (
    <div
      ref={ref}
      className="sticky bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur-md transition-all duration-500"
      style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(8px)" }}
    >
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="flex items-center justify-center divide-x divide-border py-3 gap-2 sm:gap-6">
          <Stat icon={BookOpen} value={cCount} label="Books" />
          <Stat icon={Users} value={aCount} label="Authors" />
          <Stat icon={Lightbulb} value={lCount} label="Lessons" />
          <Stat icon={TrendingUp} value={iPct} suffix="%" label="Insights" />
        </div>
      </div>
    </div>
  );
}

function Stat({
  icon: Icon,
  value,
  label,
  suffix,
}: {
  icon: React.ComponentType<{ className?: string }>;
  value: number;
  label: string;
  suffix?: string;
}) {
  return (
    <div className="flex items-center gap-2 px-2 sm:px-4">
      <Icon className="w-4 h-4 text-brand shrink-0" />
      <span className="font-display text-lg sm:text-xl font-bold text-foreground tabular-nums">
        {value}{suffix}
      </span>
      <span className="text-[10px] sm:text-xs font-medium text-muted-foreground hidden sm:inline">
        {label}
      </span>
    </div>
  );
}
