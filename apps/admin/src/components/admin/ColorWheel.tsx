"use client";

import { useEffect, useRef, useState } from "react";

// Rendering at SIZE*CSS_ZOOM then CSS-shrinking back gives a crisp HD wheel
// (the old pure-CSS conic-gradient looked soft and banded).
const CSS_SIZE = 176;
const CANVAS = 3; // supersample factor

export function hexToHsv(hex: string): { h: number; s: number; v: number } {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return { h: 0, s: 0, v: 1 };
  const n = parseInt(m[1], 16);
  const r = ((n >> 16) & 255) / 255;
  const g = ((n >> 8) & 255) / 255;
  const b = (n & 255) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h = ((h * 60 + 360) % 360) / 360;
  }
  return { h: h * 360, s: max === 0 ? 0 : d / max, v: max };
}

export function hsvToHex(h: number, s: number, v: number): string {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let rgb: [number, number, number];
  if (h < 60) rgb = [c, x, 0];
  else if (h < 120) rgb = [x, c, 0];
  else if (h < 180) rgb = [0, c, x];
  else if (h < 240) rgb = [0, x, c];
  else if (h < 300) rgb = [x, 0, c];
  else rgb = [c, 0, x];
  return (
    "#" +
    rgb
      .map((ch) => Math.round((ch + m) * 255).toString(16).padStart(2, "0"))
      .join("")
  );
}

function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  switch (Math.floor((h / 60) % 6)) {
    case 0: return [(c + m) * 255, (x + m) * 255, m * 255];
    case 1: return [(x + m) * 255, (c + m) * 255, m * 255];
    case 2: return [m * 255, (c + m) * 255, (x + m) * 255];
    case 3: return [m * 255, (x + m) * 255, (c + m) * 255];
    case 4: return [(x + m) * 255, m * 255, (c + m) * 255];
    default: return [(c + m) * 255, m * 255, (x + m) * 255];
  }
}

function HexInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (hex: string) => void;
}) {
  const [draft, setDraft] = useState(value);
  const valid = /^#[0-9a-f]{6}$/i.test(draft);
  return (
    <input
      type="text"
      value={draft}
      onChange={(e) => {
        const next = e.target.value.replace(/[^0-9a-f#]/gi, "").slice(0, 7);
        setDraft(next);
        if (/^#[0-9a-f]{6}$/i.test(next)) onChange(next);
      }}
      className={`w-20 rounded-md border bg-background px-2 py-1 text-xs font-mono text-center outline-none focus:ring-2 focus:ring-accent ${
        valid ? "border-border" : "border-red-500"
      }`}
      aria-label="Hex color"
      spellCheck={false}
    />
  );
}

export function ColorWheel({
  value,
  onChange,
}: {
  value: string;
  onChange: (hex: string) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wheelRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const hsv = hexToHsv(value);
  const size = CSS_SIZE * CANVAS;
  const center = size / 2;
  const ringWidth = 5 * CANVAS; // gap between outer edge and handle travel
  const maxR = center - ringWidth;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const img = ctx.createImageData(size, size);
    const data = img.data;
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const dx = x - center;
        const dy = y - center;
        const r = Math.sqrt(dx * dx + dy * dy);
        const i = (y * size + x) * 4;
        if (r > maxR) {
          data[i + 3] = 0; // transparent outside the wheel
          continue;
        }
        const h = ((Math.atan2(dy, dx) * 180) / Math.PI + 360) % 360;
        const s = r / maxR;
        const [rr, gg, bb] = hsvToRgb(h, s, 1);
        data[i] = rr;
        data[i + 1] = gg;
        data[i + 2] = bb;
        data[i + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
  }, [size, center, maxR]);

  // Map a pointer position (in CSS pixels over the element) to an HS (v fixed).
  const pickAt = (clientX: number, clientY: number, el: HTMLDivElement) => {
    const rect = el.getBoundingClientRect();
    const dx = clientX - (rect.left + rect.width / 2);
    const dy = clientY - (rect.top + rect.height / 2);
    const h = ((Math.atan2(dy, dx) * 180) / Math.PI + 360) % 360;
    const s = Math.min(Math.hypot(dx, dy) / (rect.width / 2 - 7), 1);
    onChange(hsvToHex(h, s, hsv.v));
  };

  // Window-level listeners, not React pointer events: React state updates are
  // async, so gating onPointerMove on `dragging` drops moves until a re-render
  // lands — which makes drag feel dead. Listening on the window from the moment
  // dragging starts updates the color on every move, no matter the render state.
  useEffect(() => {
    if (!dragging) return;
    const el = wheelRef.current;
    if (!el) return;
    const move = (e: PointerEvent) => {
      e.preventDefault();
      pickAt(e.clientX, e.clientY, el);
    };
    const stop = () => setDragging(false);
    window.addEventListener("pointermove", move, { passive: false });
    window.addEventListener("pointerup", stop);
    window.addEventListener("pointercancel", stop);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", stop);
      window.removeEventListener("pointercancel", stop);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragging, hsv.v]);

  const angle = (hsv.h * Math.PI) / 180;
  const handleX = CSS_SIZE / 2 + Math.cos(angle) * hsv.s * (CSS_SIZE / 2 - 6);
  const handleY = CSS_SIZE / 2 + Math.sin(angle) * hsv.s * (CSS_SIZE / 2 - 6);
  const hex = hsvToHex(hsv.h, hsv.s, hsv.v);

  return (
    <div className="w-48 space-y-3">
      <div
        ref={wheelRef}
        className="relative touch-none select-none cursor-crosshair rounded-full ring-1 ring-black/10 shadow-inner"
        style={{ width: CSS_SIZE, height: CSS_SIZE }}
        onPointerDown={(e) => {
          e.preventDefault();
          e.currentTarget.setPointerCapture(e.pointerId);
          setDragging(true);
          pickAt(e.clientX, e.clientY, e.currentTarget);
        }}
        aria-label="Color wheel"
        role="slider"
        aria-valuemin={0}
        aria-valuemax={360}
        aria-valuenow={Math.round(hsv.h)}
        aria-valuetext={`hue ${Math.round(hsv.h)}° saturation ${Math.round(hsv.s * 100)}%`}
      >
        <canvas
          ref={canvasRef}
          className="block"
          style={{ width: CSS_SIZE, height: CSS_SIZE }}
        />
        <span
          className="pointer-events-none absolute h-[18px] w-[18px] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white"
          style={{
            left: handleX,
            top: handleY,
            backgroundColor: hex,
            boxShadow: dragging
              ? "0 0 0 2px rgba(0,0,0,.35), 0 0 0 5px rgba(255,255,255,.85), 0 2px 8px rgba(0,0,0,.4)"
              : "0 0 0 1.5px rgba(0,0,0,.25), 0 0 0 4px rgba(255,255,255,.75), 0 2px 8px rgba(0,0,0,.3)",
          }}
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round(hsv.v * 100)}
          onChange={(e) =>
            onChange(hsvToHex(hsv.h, hsv.s, Number(e.target.value) / 100))
          }
          className="flex-1 accent-[var(--accent)]"
          aria-label="Brightness"
        />
        <HexInput key={value} value={hex} onChange={onChange} />
      </div>
    </div>
  );
}