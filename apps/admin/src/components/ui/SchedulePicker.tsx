"use client";

import { useState } from "react";
import { CalendarClock, ChevronLeft, ChevronRight } from "lucide-react";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function daysInMonth(y: number, m: number) { return new Date(y, m + 1, 0).getDate(); }
function firstDay(y: number, m: number) { return new Date(y, m, 1).getDay(); }

type Step = "date" | "hour" | "minute" | "ampm";

export function SchedulePicker({
  value,
  onChange,
}: {
  value: string | "";
  onChange: (iso: string | "") => void;
}) {
  const now = new Date();
  const current = value ? new Date(value) : null;

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("date");
  const [y, setY] = useState(current?.getFullYear() ?? now.getFullYear());
  const [m, setM] = useState(current?.getMonth() ?? now.getMonth());
  const [day, setDay] = useState<number | null>(current?.getDate() ?? null);
  const [hour, setHour] = useState<number | null>(null);
  const [min, setMin] = useState<number | null>(null);
  const [ampm, setAmpm] = useState<"AM" | "PM">(() => {
    if (current) return current.getHours() >= 12 ? "PM" : "AM";
    return now.getHours() >= 12 ? "PM" : "AM";
  });

  const days = daysInMonth(y, m);
  const start = firstDay(y, m);
  const isPast = (d: number) => new Date(y, m, d) < new Date(now.getFullYear(), now.getMonth(), now.getDate());

  function prev() { m === 0 ? (setM(11), setY((v) => v - 1)) : setM((v) => v - 1); }
  function next() { m === 11 ? (setM(0), setY((v) => v + 1)) : setM((v) => v + 1); }

  function commit(d: number, h: number, mi: number, ap: "AM" | "PM") {
    let h24 = h;
    if (ap === "PM" && h !== 12) h24 = h + 12;
    if (ap === "AM" && h === 12) h24 = 0;
    const dt = new Date(y, m, d, h24, mi, 0, 0);
    onChange(dt <= now ? "" : dt.toISOString());
    setOpen(false);
    setStep("date");
  }

  function clear() {
    onChange("");
    setOpen(false);
    setStep("date");
    setDay(null);
    setHour(null);
    setMin(null);
  }

  const label = value
    ? new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : "Pick date & time";

  return (
    <div className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => { setOpen(!open); setStep("date"); }}
        className="w-full flex items-center gap-2.5 rounded-xl border border-border bg-background px-4 py-2.5 text-left text-sm transition-all hover:border-brand/40 focus:outline-none focus:ring-2 focus:ring-brand/20"
      >
        <CalendarClock className="w-4 h-4 text-brand shrink-0" />
        <span className={value ? "text-foreground font-medium" : "text-muted-foreground"}>{label}</span>
        {value && (
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => { e.stopPropagation(); clear(); }}
            onKeyDown={(e) => { if (e.key === "Enter") { e.stopPropagation(); clear(); } }}
            className="ml-auto text-muted-foreground hover:text-red-500 text-xs cursor-pointer"
          >
            Clear
          </span>
        )}
      </button>

      {/* Collapsible panel */}
      {open && (
        <div className="absolute z-40 mt-2 w-full rounded-2xl border border-border bg-white shadow-xl overflow-hidden">
          {/* Progress */}
          <div className="flex gap-0.5 px-4 pt-3">
            {(["date", "hour", "minute", "ampm"] as Step[]).map((s, i) => (
              <div key={s} className={`h-1 flex-1 rounded-full transition-colors ${
                i <= ["date", "hour", "minute", "ampm"].indexOf(step) ? "bg-brand" : "bg-muted"
              }`} />
            ))}
          </div>

          {/* ── Date ── */}
          {step === "date" && (
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <button type="button" onClick={prev} className="p-1 rounded-lg hover:bg-muted"><ChevronLeft className="w-4 h-4" /></button>
                <span className="text-sm font-semibold">{MONTHS[m]} {y}</span>
                <button type="button" onClick={next} className="p-1 rounded-lg hover:bg-muted"><ChevronRight className="w-4 h-4" /></button>
              </div>
              <div className="grid grid-cols-7 gap-0.5 mb-1">
                {DAYS.map((d) => <div key={d} className="text-center text-[10px] font-medium text-muted-foreground py-0.5">{d}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-0.5">
                {Array.from({ length: start }).map((_, i) => <div key={`e${i}`} />)}
                {Array.from({ length: days }).map((_, i) => {
                  const d = i + 1;
                  const past = isPast(d);
                  const today = d === now.getDate() && m === now.getMonth() && y === now.getFullYear();
                  const sel = day === d;
                  return (
                    <button key={d} type="button" disabled={past}
                      onClick={() => { setDay(d); setStep("hour"); }}
                      className={`h-8 rounded-lg text-xs font-medium transition-all ${
                        past ? "text-muted-foreground/30 cursor-not-allowed" :
                        sel ? "bg-brand text-white" :
                        today ? "bg-brand/10 text-brand font-bold" :
                        "text-foreground hover:bg-brand/10"
                      }`}>{d}</button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Hour ── */}
          {step === "hour" && (
            <div className="p-4">
              <p className="text-xs text-muted-foreground text-center mb-3">
                {day} {MONTHS[m]} {y}
              </p>
              <div className="grid grid-cols-4 gap-2">
                {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((h) => (
                  <button key={h} type="button"
                    onClick={() => { setHour(h); setStep("minute"); }}
                    className="h-11 rounded-xl text-sm font-semibold bg-muted hover:bg-brand/10 hover:text-brand transition-all">
                    {h}
                  </button>
                ))}
              </div>
              <button type="button" onClick={() => setStep("date")} className="mt-3 text-xs text-muted-foreground hover:text-brand w-full text-center">← Back</button>
            </div>
          )}

          {/* ── Minute ── */}
          {step === "minute" && (
            <div className="p-4">
              <p className="text-xs text-muted-foreground text-center mb-3">
                {day} {MONTHS[m]} {y} · {hour}:__
              </p>
              <div className="grid grid-cols-6 gap-2">
                {Array.from({ length: 12 }).map((_, i) => {
                  const mi = i * 5;
                  return (
                    <button key={mi} type="button"
                      onClick={() => { setMin(mi); setStep("ampm"); }}
                      className="h-10 rounded-xl text-sm font-semibold bg-muted hover:bg-brand/10 hover:text-brand transition-all">
                      :{String(mi).padStart(2, "0")}
                    </button>
                  );
                })}
              </div>
              <button type="button" onClick={() => setStep("hour")} className="mt-3 text-xs text-muted-foreground hover:text-brand w-full text-center">← Back</button>
            </div>
          )}

          {/* ── AM/PM ── */}
          {step === "ampm" && (
            <div className="p-4">
              <p className="text-lg font-bold text-center mb-4">
                {hour}:{String(min ?? 0).padStart(2, "0")}
              </p>
              <div className="flex gap-3">
                {(["AM", "PM"] as const).map((ap) => (
                  <button key={ap} type="button"
                    onClick={() => { setAmpm(ap); if (day !== null && hour !== null && min !== null) commit(day, hour, min, ap); }}
                    className={`flex-1 h-14 rounded-2xl text-base font-bold transition-all ${
                      ampm === ap ? "bg-brand text-white shadow-md" : "bg-muted text-muted-foreground hover:bg-brand/10"
                    }`}>{ap}</button>
                ))}
              </div>
              <button type="button" onClick={() => setStep("minute")} className="mt-3 text-xs text-muted-foreground hover:text-brand w-full text-center">← Back</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
