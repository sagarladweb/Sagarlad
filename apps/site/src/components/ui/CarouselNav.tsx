"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

type DotPaginationProps = {
  total: number;
  current: number;
  onChange: (i: number) => void;
  label?: string;
  className?: string;
};

export function DotPagination({
  total,
  current,
  onChange,
  label = "page",
  className = "",
}: DotPaginationProps) {
  return (
    <div className={`flex items-center justify-center gap-2.5 ${className}`}>
      {Array.from({ length: total }, (_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          aria-label={`Go to ${label} ${i + 1}`}
          aria-current={i === current ? "true" : undefined}
          className={`h-1.5 rounded-full transition-all duration-300 ${
            i === current
              ? "w-6 bg-accent-strong"
              : "w-1.5 bg-border hover:bg-muted-foreground/30"
          }`}
        />
      ))}
    </div>
  );
}

type ArrowNavProps = {
  onPrev: () => void;
  onNext: () => void;
  prevLabel?: string;
  nextLabel?: string;
  className?: string;
  size?: "sm" | "md";
};

export function ArrowNav({
  onPrev,
  onNext,
  prevLabel = "Previous",
  nextLabel = "Next",
  className = "",
  size = "md",
}: ArrowNavProps) {
  const s = size === "sm" ? "h-9 w-9" : "h-11 w-11";
  const icon = size === "sm" ? "w-4 h-4" : "w-5 h-5";

  return (
    <div className={`flex items-center justify-center gap-3 ${className}`}>
      <button
        type="button"
        onClick={onPrev}
        aria-label={prevLabel}
        className={`grid ${s} place-items-center rounded-full border border-border bg-background/90 text-foreground shadow-sm hover:bg-muted transition-colors`}
      >
        <ChevronLeft className={icon} />
      </button>
      <button
        type="button"
        onClick={onNext}
        aria-label={nextLabel}
        className={`grid ${s} place-items-center rounded-full border border-border bg-background/90 text-foreground shadow-sm hover:bg-muted transition-colors`}
      >
        <ChevronRight className={icon} />
      </button>
    </div>
  );
}
