"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";

type CalendarPickerProps = {
  value: string | null;
  onChange: (date: string | null) => void;
};

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function toStr(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function formatDisplay(val: string) {
  const d = new Date(val + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function CalendarPicker({ value, onChange }: CalendarPickerProps) {
  const [open, setOpen] = useState(false);
  const today = new Date();
  const d = value ? new Date(value + "T00:00:00") : null;
  const [vy, setVy] = useState(d?.getFullYear() ?? today.getFullYear());
  const [vm, setVm] = useState(d?.getMonth() ?? today.getMonth());

  function prev() { vm === 0 ? (setVy(vy - 1), setVm(11)) : setVm(vm - 1); }
  function next() { vm === 11 ? (setVy(vy + 1), setVm(0)) : setVm(vm + 1); }

  const dim = getDaysInMonth(vy, vm);
  const fd = getFirstDayOfMonth(vy, vm);
  const cells: (number | null)[] = [];
  for (let i = 0; i < fd; i++) cells.push(null);
  for (let d = 1; d <= dim; d++) cells.push(d);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2.5 text-sm hover:border-accent/50 transition-colors w-full text-left"
        >
          <CalendarIcon className="w-4 h-4 text-muted-foreground shrink-0" />
          <span className={value ? "text-foreground" : "text-muted-foreground"}>
            {value ? formatDisplay(value) : "Select date"}
          </span>
        </button>
        {value && (
          <button
            type="button"
            onClick={() => { onChange(null); setOpen(false); }}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
          >
            Clear
          </button>
        )}
      </div>

      {open && (
        <div className="rounded-lg border border-border bg-card p-3 w-full max-w-[280px]">
          <div className="flex items-center justify-between mb-3">
            <button type="button" onClick={prev} className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-semibold text-foreground">
              {MONTHS[vm]} {vy}
            </span>
            <button type="button" onClick={next} className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-0 mb-1">
            {DAYS.map((d) => (
              <div key={d} className="text-center text-[10px] font-semibold text-muted-foreground py-1">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-0">
            {cells.map((day, i) => {
              if (day === null) return <div key={`e-${i}`} />;
              const ds = toStr(vy, vm, day);
              const sel = ds === value;
              const td = day === today.getDate() && vm === today.getMonth() && vy === today.getFullYear();
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => { onChange(ds); setOpen(false); }}
                  className={`flex items-center justify-center h-8 text-xs font-medium rounded-md transition-colors ${
                    sel ? "bg-accent text-accent-foreground font-bold"
                    : td ? "bg-accent/15 text-accent-strong font-semibold"
                    : "text-foreground hover:bg-muted"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
