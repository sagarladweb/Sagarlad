"use client";

import { useState } from "react";
import { CalendarClock, ChevronLeft, ChevronRight } from "lucide-react";

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const DAYS = ["Su","Mo","Tu","We","Th","Fr","Sa"];

function daysInMonth(y: number, m: number) { return new Date(y, m + 1, 0).getDate(); }
function firstDayOfWeek(y: number, m: number) { return new Date(y, m, 1).getDay(); }

type Step = "date" | "clock";

export function SchedulePicker({
  value,
  onChange,
}: {
  value: string | "";
  onChange: (iso: string | "") => void;
}) {
  const now = new Date();
  const cur = value ? new Date(value) : null;

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("date");
  const [y, setY] = useState(cur?.getFullYear() ?? now.getFullYear());
  const [mo, setMo] = useState(cur?.getMonth() ?? now.getMonth());
  const [day, setDay] = useState<number | null>(cur?.getDate() ?? null);

  const [clockMode, setClockMode] = useState<"hour" | "minute">("hour");
  const [hour12, setHour12] = useState<number | null>(() => {
    if (cur) { const h = cur.getHours(); return h === 0 ? 12 : h > 12 ? h - 12 : h; }
    return null;
  });
  const [minute, setMinute] = useState<number | null>(cur?.getMinutes() ?? null);
  const [ampm, setAmpm] = useState<"AM" | "PM">(() => {
    if (cur) return cur.getHours() >= 12 ? "PM" : "AM";
    return now.getHours() >= 12 ? "PM" : "AM";
  });

  const calDays = daysInMonth(y, mo);
  const calStart = firstDayOfWeek(y, mo);
  const isPast = (d: number) => new Date(y, mo, d) < new Date(now.getFullYear(), now.getMonth(), now.getDate());

  function prevMonth() { mo === 0 ? (setMo(11), setY((v) => v - 1)) : setMo((v) => v - 1); }
  function nextMonth() { mo === 11 ? (setMo(0), setY((v) => v + 1)) : setMo((v) => v + 1); }

  function pickDay(d: number) {
    if (isPast(d)) return;
    setDay(d);
    setClockMode("hour");
    setStep("clock");
  }

  function pickHour(h: number) {
    setHour12(h);
    setClockMode("minute");
  }

  function pickMinute(m: number) {
    setMinute(m);
    if (hour12 !== null) commit(hour12, m, ampm);
  }

  function commit(h: number, m: number, ap: "AM" | "PM") {
    if (day === null) return;
    let h24 = h;
    if (ap === "PM" && h !== 12) h24 = h + 12;
    if (ap === "AM" && h === 12) h24 = 0;
    const dt = new Date(y, mo, day, h24, m, 0, 0);
    if (dt <= now) { onChange(""); }
    else { onChange(dt.toISOString()); }
    setOpen(false);
    setStep("date");
    setClockMode("hour");
    setDay(null);
    setHour12(null);
    setMinute(null);
  }

  function clear() {
    onChange("");
    setOpen(false);
    setStep("date");
    setDay(null);
    setHour12(null);
    setMinute(null);
  }

  // Clock SVG
  const R = 88, CX = 100, CY = 100;

  // Hour numbers positions (12 positions around the clock)
  const hourPositions = Array.from({ length: 12 }).map((_, i) => {
    const angle = (i * 30 - 90) * (Math.PI / 180);
    return {
      x: CX + Math.cos(angle) * (R - 16),
      y: CY + Math.sin(angle) * (R - 16),
      h: i === 0 ? 12 : i,
      m: i * 5,
    };
  });

  // Hand angles
  const hourAngle = hour12 !== null ? (hour12 % 12) * 30 - 90 : -90;
  const hourHandLen = R - 28;
  const hx = CX + Math.cos((hourAngle * Math.PI) / 180) * hourHandLen;
  const hy = CY + Math.sin((hourAngle * Math.PI) / 180) * hourHandLen;

  const minuteAngle = minute !== null ? (minute / 5) * 30 - 90 : -90;
  const minuteHandLen = R - 18;
  const mx = CX + Math.cos((minuteAngle * Math.PI) / 180) * minuteHandLen;
  const my = CY + Math.sin((minuteAngle * Math.PI) / 180) * minuteHandLen;

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
          <span role="button" tabIndex={0}
            onClick={(e) => { e.stopPropagation(); clear(); }}
            onKeyDown={(e) => { if (e.key === "Enter") { e.stopPropagation(); clear(); } }}
            className="ml-auto text-muted-foreground hover:text-red-500 text-xs cursor-pointer">Clear</span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-40 mt-2 w-[300px] rounded-2xl border border-border bg-card shadow-xl overflow-hidden">

          {/* Calendar step */}
          {step === "date" && (
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <button type="button" onClick={prevMonth} className="p-1 rounded-lg hover:bg-muted"><ChevronLeft className="w-4 h-4" /></button>
                <span className="text-sm font-semibold text-foreground">{MONTHS[mo]} {y}</span>
                <button type="button" onClick={nextMonth} className="p-1 rounded-lg hover:bg-muted"><ChevronRight className="w-4 h-4" /></button>
              </div>
              <div className="grid grid-cols-7 gap-0.5 mb-1">
                {DAYS.map((d) => <div key={d} className="text-center text-[10px] font-medium text-muted-foreground py-0.5">{d}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-0.5">
                {Array.from({ length: calStart }).map((_, i) => <div key={`e${i}`} />)}
                {Array.from({ length: calDays }).map((_, i) => {
                  const d = i + 1;
                  const past = isPast(d);
                  const today = d === now.getDate() && mo === now.getMonth() && y === now.getFullYear();
                  return (
                    <button key={d} type="button" disabled={past}
                      onClick={() => pickDay(d)}
                      className={`h-8 rounded-lg text-xs font-medium transition-all ${
                        past ? "text-muted-foreground/30 cursor-not-allowed" :
                        today ? "bg-brand/15 text-brand font-bold" :
                        "text-foreground hover:bg-brand/10"
                      }`}>{d}</button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Clock step */}
          {step === "clock" && (
            <div className="p-4 flex flex-col items-center gap-3">
              <p className="text-xs text-muted-foreground">
                {day} {MONTHS[mo]} {y}
              </p>

              <p className="text-2xl font-bold text-foreground tracking-tight">
                {hour12 ?? "—"}:{minute !== null ? String(minute).padStart(2, "0") : "—"}
                {hour12 !== null && (
                  <span className="ml-1 text-sm font-semibold text-brand">{ampm}</span>
                )}
              </p>

              {/* Mode tabs */}
              <div className="flex rounded-lg bg-muted p-0.5 gap-0.5">
                <button type="button" onClick={() => setClockMode("hour")}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${
                    clockMode === "hour" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
                  }`}>Hour</button>
                <button type="button" onClick={() => setClockMode("minute")}
                  disabled={hour12 === null}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${
                    clockMode === "minute" ? "bg-background text-foreground shadow-sm" :
                    hour12 !== null ? "text-muted-foreground" : "text-muted-foreground/40 cursor-not-allowed"
                  }`}>Minute</button>
              </div>

              {/* Analog clock */}
              <div className="relative" style={{ width: 200, height: 200 }}>
                <svg viewBox="0 0 200 200" className="w-full h-full">
                  {/* Face */}
                  <circle cx={CX} cy={CY} r={R} className="fill-background stroke-border" strokeWidth="2" />

                  {/* Ticks */}
                  {Array.from({ length: 60 }).map((_, i) => {
                    const angle = (i * 6 - 90) * (Math.PI / 180);
                    const isHour = i % 5 === 0;
                    const r1 = R - 2;
                    const r2 = isHour ? R - 7 : R - 4;
                    return (
                      <line key={`t${i}`}
                        x1={CX + Math.cos(angle) * r1} y1={CY + Math.sin(angle) * r1}
                        x2={CX + Math.cos(angle) * r2} y2={CY + Math.sin(angle) * r2}
                        className={isHour ? "stroke-muted-foreground" : "stroke-border"}
                        strokeWidth={isHour ? 1.5 : 0.8}
                      />
                    );
                  })}

                  {/* Numbers — only the active mode's labels are visible */}
                  {hourPositions.map((pos, i) => (
                    <text key={i} x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="central"
                      className={`text-[12px] font-semibold select-none pointer-events-none transition-opacity ${
                        clockMode === "hour"
                          ? pos.h === hour12 ? "fill-brand" : "fill-foreground"
                          : pos.m === minute ? "fill-brand" : "fill-muted-foreground"
                      }`}
                      style={{ opacity: clockMode === "hour" ? 1 : 0.7 }}
                    >
                      {clockMode === "hour" ? pos.h : String(pos.m).padStart(2, "0")}
                    </text>
                  ))}

                  {/* Hand */}
                  {clockMode === "hour" && hour12 !== null && (
                    <>
                      <line x1={CX} y1={CY} x2={hx} y2={hy}
                        stroke="#0d21a1" strokeWidth="3" strokeLinecap="round" />
                      <circle cx={CX} cy={CY} r="5" fill="#0d21a1" />
                      <circle cx={CX} cy={CY} r="2.5" className="fill-background" />
                    </>
                  )}
                  {clockMode === "minute" && minute !== null && (
                    <>
                      <line x1={CX} y1={CY} x2={mx} y2={my}
                        stroke="#0d21a1" strokeWidth="2.5" strokeLinecap="round" />
                      <circle cx={CX} cy={CY} r="5" fill="#0d21a1" />
                      <circle cx={CX} cy={CY} r="2.5" className="fill-background" />
                    </>
                  )}
                </svg>

                {/* Click zones */}
                {clockMode === "hour" && hourPositions.map((pos, i) => (
                  <button key={`h${i}`} type="button" onClick={() => pickHour(pos.h)}
                    className="absolute w-10 h-10 -ml-5 -mt-5 rounded-full hover:bg-brand/10 transition-colors"
                    style={{ left: pos.x, top: pos.y }} />
                ))}
                {clockMode === "minute" && hourPositions.map((pos, i) => (
                  <button key={`m${i}`} type="button" onClick={() => pickMinute(pos.m)}
                    className="absolute w-10 h-10 -ml-5 -mt-5 rounded-full hover:bg-brand/10 transition-colors"
                    style={{ left: pos.x, top: pos.y }} />
                ))}
              </div>

              {/* AM/PM */}
              <div className="flex rounded-xl border border-border overflow-hidden">
                {(["AM", "PM"] as const).map((ap) => (
                  <button key={ap} type="button"
                    onClick={() => setAmpm(ap)}
                    className={`px-8 py-2 text-xs font-bold transition-all ${
                      ampm === ap ? "bg-brand text-white" : "text-muted-foreground hover:bg-muted"
                    }`}>{ap}</button>
                ))}
              </div>

              <button type="button" onClick={() => setStep("date")}
                className="text-xs text-muted-foreground hover:text-brand transition-colors">
                ← Back to calendar
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
