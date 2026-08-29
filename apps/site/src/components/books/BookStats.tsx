"use client";

import { useEffect, useRef, useState } from "react";
import { BookOpen, Users, Lightbulb, TrendingUp } from "lucide-react";

type Book = {
  id: string;
  title: string;
  author: string | null;
  learning: string | null;
};

function useCountUp(target: number, duration = 1200) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const step = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(eased * target));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [target, duration]);

  return { count, ref };
}

function StatCard({
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
  const { count, ref } = useCountUp(value);
  return (
    <div ref={ref} className="flex flex-col items-center text-center px-4 py-6">
      <div className="w-11 h-11 rounded-xl bg-brand/8 grid place-items-center mb-3">
        <Icon className="w-5 h-5 text-brand" />
      </div>
      <span className="font-display text-3xl sm:text-4xl font-bold text-foreground tabular-nums">
        {count}
        {suffix}
      </span>
      <span className="mt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

export function BookStats({ books }: { books: Book[] }) {
  const totalBooks = books.length;
  const uniqueAuthors = new Set(books.map((b) => b.author).filter(Boolean)).size;
  const withLearnings = books.filter((b) => b.learning).length;

  return (
    <section className="border-b border-border bg-card/30">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-border">
          <StatCard icon={BookOpen} value={totalBooks} label="Books Read" />
          <StatCard icon={Users} value={uniqueAuthors} label="Authors" />
          <StatCard icon={Lightbulb} value={withLearnings} label="Key Learnings" />
          <StatCard icon={TrendingUp} value={totalBooks > 0 ? Math.round((withLearnings / Math.max(totalBooks, 1)) * 100) : 0} suffix="%" label="With Insights" />
        </div>
      </div>
    </section>
  );
}
