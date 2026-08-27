"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function toISOKey(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseKey(key: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key);
  if (!m) return null;
  const date = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

export function Calendar({
  id,
  label,
  value,
  onChange,
  placeholder = "Select a date",
  minYear = new Date().getFullYear() - 2,
  maxYear = new Date().getFullYear() + 3,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minYear?: number;
  maxYear?: number;
}) {
  const today = new Date();
  const todayKey = toISOKey(today);
  const selected = useMemo(() => parseKey(value), [value]);

  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(
    (selected ?? today).getFullYear()
  );
  const [viewMonth, setViewMonth] = useState(
    (selected ?? today).getMonth()
  );
  const [mode, setMode] = useState<"day" | "month" | "year">("day");
  const rootRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        (rootRef.current?.querySelector("button") as HTMLButtonElement | null)?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstWeekday = new Date(viewYear, viewMonth, 1).getDay();

  const grid: (Date | null)[] = useMemo(() => {
    const cells: (Date | null)[] = [];
    for (let i = 0; i < firstWeekday; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push(new Date(viewYear, viewMonth, d));
    }
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [viewYear, viewMonth, firstWeekday, daysInMonth]);

  function goMonth(offset: number) {
    let m = viewMonth + offset;
    let y = viewYear;
    if (m < 0) {
      m = 11;
      y -= 1;
    } else if (m > 11) {
      m = 0;
      y += 1;
    }
    if (y < minYear || y > maxYear) return;
    setViewYear(y);
    setViewMonth(m);
  }

  function focusCell(index: number) {
    const el = gridRef.current?.children[index] as HTMLElement | undefined;
    el?.focus();
  }

  const years = useMemo(() => {
    const list: number[] = [];
    for (let y = minYear; y <= maxYear; y++) list.push(y);
    return list;
  }, [minYear, maxYear]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        id={id}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-labelledby={`${id}-label`}
        onClick={() => setOpen((o) => !o)}
        className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-left flex items-center justify-between gap-2 outline-none focus:ring-2 focus:ring-accent"
      >
        <span className={selected ? "text-foreground" : "text-muted-foreground truncate"}>
          {selected
            ? selected.toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : placeholder}
        </span>
        <span aria-hidden="true" className="flex items-center gap-0.5">
          <span className="grid grid-cols-2 gap-px">
            {[0, 1, 2, 3].map((n) => (
              <span key={n} className="h-1 w-1 rounded-[1px] bg-muted-foreground" />
            ))}
          </span>
        </span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-label={label}
          className="card-hover absolute left-0 z-30 mt-1.5 w-72 rounded-xl border border-border bg-card p-4 shadow-xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-2">
            {mode === "day" && (
              <button
                type="button"
                onClick={() => goMonth(-1)}
                aria-label="Previous month"
                className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <span className="block h-2 w-2 border-l-2 border-b-2 rotate-45" />
              </button>
            )}
            <button
              type="button"
              onClick={() => setMode(mode === "year" ? "day" : "year")}
              className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-semibold transition-colors hover:bg-muted"
            >
              {MONTHS[viewMonth]} {viewYear}
              <span
                aria-hidden="true"
                className={`h-1.5 w-1.5 border-r-2 border-b-2 transition-transform ${
                  mode === "year" ? "rotate-225" : "rotate-45"
                }`}
              />
            </button>
            {mode === "day" && (
              <button
                type="button"
                onClick={() => goMonth(1)}
                aria-label="Next month"
                className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <span className="block h-2 w-2 border-r-2 border-b-2 -rotate-45" />
              </button>
            )}
          </div>

          {/* Year picker */}
          {mode === "year" ? (
            <div ref={gridRef} className="mt-3 grid grid-cols-4 gap-1 max-h-56 overflow-y-auto">
              {years.map((y) => (
                <button
                  key={y}
                  type="button"
                  onClick={() => {
                    setViewYear(y);
                    setMode("day");
                  }}
                  className={`rounded-lg py-1.5 text-sm transition-colors ${
                    y === viewYear
                      ? "bg-accent text-accent-foreground font-medium"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  {y}
                </button>
              ))}
            </div>
          ) : (
            <>
              {/* Weekday row */}
              <div className="mt-3 grid grid-cols-7">
                {WEEKDAYS.map((d) => (
                  <div
                    key={d}
                    className="py-1 text-center text-[10px] font-semibold uppercase tracking-wide text-muted-foreground"
                  >
                    {d[0]}
                  </div>
                ))}
              </div>

              {/* Day grid */}
              <div
                ref={gridRef}
                className="grid grid-cols-7"
                role="grid"
                aria-label={label}
                onKeyDown={(e) => {
                  if (mode !== "day") return;
                  const idx = grid.findIndex((c) => c && c.getTime() === selected?.getTime());
                  const start = idx >= 0 ? idx : grid.findIndex((c) => c !== null);
                  switch (e.key) {
                    case "ArrowRight":
                      e.preventDefault();
                      if (start >= 0) focusCell(start + 1);
                      break;
                    case "ArrowLeft":
                      e.preventDefault();
                      if (start >= 0) focusCell(start - 1);
                      break;
                    case "ArrowUp":
                      e.preventDefault();
                      if (start >= 0) focusCell(start - 7);
                      break;
                    case "ArrowDown":
                      e.preventDefault();
                      if (start >= 0) focusCell(start + 7);
                      break;
                    case "Home":
                      e.preventDefault();
                      focusCell(0);
                      break;
                    case "End":
                      e.preventDefault();
                      focusCell(grid.length - 1);
                      break;
                    case "Enter":
                    case " ":
                      e.preventDefault();
                      if (start >= 0) {
                        const d = grid[start];
                        if (d) {
                          onChange(toISOKey(d));
                          setOpen(false);
                        }
                      }
                      break;
                  }
                }}
              >
                {grid.map((cell, i) => {
                  if (!cell) return <div key={`e${i}`} />;
                  const key = toISOKey(cell);
                  const isSelectedDate = key === value;
                  const isToday = key === todayKey;
                  return (
                    <button
                      key={key}
                      type="button"
                      tabIndex={isSelectedDate ? 0 : -1}
                      onClick={() => {
                        onChange(key);
                        setOpen(false);
                      }}
                      className={`relative h-9 w-full rounded-lg text-sm transition-colors ${
                        isSelectedDate
                          ? "bg-accent text-accent-foreground font-semibold"
                          : "text-foreground hover:bg-muted"
                      }`}
                    >
                      {cell.getDate()}
                      {isToday && !isSelectedDate && (
                        <span className="absolute inset-x-2.5 bottom-1 h-0.5 rounded-full bg-accent" />
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}