"use client";

import { useState, useEffect, useCallback } from "react";

type Props = {
  storageKey: string;
  label?: string;
};

export function DevImageTuner({ storageKey, label = "Image Position" }: Props) {
  const [x, setX] = useState(50);
  const [y, setY] = useState(50);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const d = JSON.parse(raw);
        if (typeof d.x === "number") setX(d.x);
        if (typeof d.y === "number") setY(d.y);
      }
    } catch { /* empty */ }
  }, [storageKey]);

  const save = useCallback((nx: number, ny: number) => {
    setX(nx);
    setY(ny);
    try { localStorage.setItem(storageKey, JSON.stringify({ x: nx, y: ny })); } catch { /* empty */ }
  }, [storageKey]);

  const style =
    typeof document !== "undefined"
      ? { objectPosition: `${x}% ${y}%` }
      : undefined;

  return (
    <>
      {/* Floating toggle */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-4 right-4 z-[99999] h-10 w-10 rounded-full bg-brand text-white shadow-lg grid place-items-center text-xs font-bold hover:scale-110 transition-transform"
        aria-label="Toggle image tuner"
      >
        {open ? "×" : "⚙"}
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed bottom-16 right-4 z-[99999] w-72 rounded-xl border border-border bg-card shadow-2xl p-4 text-sm">
          <p className="font-semibold text-foreground mb-3">{label}</p>

          <label className="block mb-2">
            <span className="text-muted-foreground text-xs">X: {x}%</span>
            <input
              type="range"
              min={0}
              max={100}
              value={x}
              onChange={(e) => save(Number(e.target.value), y)}
              className="w-full mt-1 accent-brand"
            />
          </label>

          <label className="block mb-3">
            <span className="text-muted-foreground text-xs">Y: {y}%</span>
            <input
              type="range"
              min={0}
              max={100}
              value={y}
              onChange={(e) => save(x, Number(e.target.value))}
              className="w-full mt-1 accent-brand"
            />
          </label>

          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-mono">
              object-[{x}%_{y}%]
            </span>
            <button
              type="button"
              onClick={() => save(50, 50)}
              className="text-xs text-brand hover:underline"
            >
              Reset
            </button>
          </div>
        </div>
      )}

      {/* Hidden style inject */}
      {style && (
        <style dangerouslySetInnerHTML={{ __html: `[data-dev-tuner]{object-position:${x}% ${y}% !important}` }} />
      )}
    </>
  );
}
