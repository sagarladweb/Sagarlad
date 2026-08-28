"use client";

import { useState, useEffect, useCallback } from "react";

type Props = {
  storageKey: string;
  label?: string;
  targetSelector?: string;
};

export function DevImageTuner({ storageKey, label = "Image Position", targetSelector }: Props) {
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
    // Apply to target element directly
    if (targetSelector) {
      const el = document.querySelector(targetSelector) as HTMLElement | null;
      if (el) el.style.objectPosition = `${nx}% ${ny}%`;
    }
  }, [storageKey, targetSelector]);

  // Apply saved position on mount
  useEffect(() => {
    if (targetSelector) {
      const el = document.querySelector(targetSelector) as HTMLElement | null;
      if (el) el.style.objectPosition = `${x}% ${y}%`;
    }
  }, [targetSelector, x, y]);

  return (
    <div
      style={{ position: "fixed", bottom: "16px", right: "16px", zIndex: 2147483647 }}
    >
      {/* Toggle button */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "44px",
          height: "44px",
          borderRadius: "50%",
          background: "#0d21a1",
          color: "white",
          border: "2px solid white",
          boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
          cursor: "pointer",
          fontSize: "18px",
          display: "grid",
          placeItems: "center",
          fontWeight: "bold",
        }}
        aria-label="Toggle image position tuner"
      >
        {open ? "×" : "⚙"}
      </button>

      {/* Panel */}
      {open && (
        <div
          style={{
            position: "absolute",
            bottom: "56px",
            right: "0",
            width: "280px",
            background: "white",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
            padding: "16px",
            fontFamily: "system-ui, sans-serif",
            color: "#1e293b",
          }}
        >
          <p style={{ fontWeight: 600, fontSize: "14px", marginBottom: "12px" }}>{label}</p>

          <div style={{ marginBottom: "10px" }}>
            <span style={{ fontSize: "12px", color: "#64748b" }}>X: {x}%</span>
            <input
              type="range"
              min={0}
              max={100}
              value={x}
              onChange={(e) => save(Number(e.target.value), y)}
              style={{ width: "100%", marginTop: "4px", accentColor: "#0d21a1" }}
            />
          </div>

          <div style={{ marginBottom: "12px" }}>
            <span style={{ fontSize: "12px", color: "#64748b" }}>Y: {y}%</span>
            <input
              type="range"
              min={0}
              max={100}
              value={y}
              onChange={(e) => save(x, Number(e.target.value))}
              style={{ width: "100%", marginTop: "4px", accentColor: "#0d21a1" }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "11px", color: "#94a3b8", fontFamily: "monospace" }}>
              object-[{x}%_{y}%]
            </span>
            <button
              type="button"
              onClick={() => save(50, 50)}
              style={{ fontSize: "12px", color: "#0d21a1", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}
            >
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
