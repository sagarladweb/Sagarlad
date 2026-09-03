"use client";

import { useEffect, useState } from "react";

export function QuotaText({ remaining, total, inFlight }: { remaining: number; total: number; inFlight: number }) {
  const [display, setDisplay] = useState(total);

  useEffect(() => {
    if (display === remaining) return;
    const step = remaining < display ? -1 : 1;
    const id = setInterval(() => {
      setDisplay((prev) => {
        const next = prev + step;
        if ((step < 0 && next <= remaining) || (step > 0 && next >= remaining)) {
          clearInterval(id);
          return remaining;
        }
        return next;
      });
    }, 12);
    return () => clearInterval(id);
  }, [remaining]);

  const color = remaining > 200
    ? "text-green-600 dark:text-green-400"
    : remaining > 50
      ? "text-amber-600 dark:text-amber-400"
      : "text-red-600 dark:text-red-400";

  return (
    <p className={`text-xs tabular-nums ${color}`}>
      {remaining === 0
        ? `Daily limit reached — ${total} of ${total} sent today`
        : <>{display} of {total} emails remaining today</>
      }
      {inFlight > 0 && remaining > 0 ? ` · ${inFlight} sending now` : ""}
    </p>
  );
}
