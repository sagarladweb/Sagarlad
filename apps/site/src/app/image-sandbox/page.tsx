"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";

const PRESETS = [
  { label: "Contact", page: "contact" },
  { label: "Books", page: "books" },
] as const;

type PageKey = (typeof PRESETS)[number]["page"];

interface ImageConfig {
  zoom: number;
  offsetX: number;
  offsetY: number;
  maxWidth: number;
  borderRadius: number;
  maskEnabled: boolean;
  maskStart: number;
  shadowEnabled: boolean;
  shadowBlur: number;
  shadowY: number;
  bgColor: string;
}

const DEFAULTS: Record<PageKey, ImageConfig> = {
  contact: {
    zoom: 100,
    offsetX: 0,
    offsetY: 0,
    maxWidth: 380,
    borderRadius: 0,
    maskEnabled: true,
    maskStart: 20,
    shadowEnabled: false,
    shadowBlur: 50,
    shadowY: 25,
    bgColor: "#ffffff",
  },
  books: {
    zoom: 100,
    offsetX: 0,
    offsetY: 0,
    maxWidth: 380,
    borderRadius: 0,
    maskEnabled: true,
    maskStart: 20,
    shadowEnabled: false,
    shadowBlur: 50,
    shadowY: 25,
    bgColor: "#ffffff",
  },
};

function Slider({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-foreground/70">{label}</span>
        <span className="text-xs tabular-nums text-muted-foreground">
          {value}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none bg-border cursor-pointer accent-brand
                   [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                   [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand [&::-webkit-slider-thumb]:cursor-grab
                   [&::-webkit-slider-thumb]:active:cursor-grabbing [&::-webkit-slider-thumb]:shadow-sm"
      />
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between cursor-pointer">
      <span className="text-xs font-medium text-foreground/70">{label}</span>
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div className="w-9 h-5 rounded-full bg-border peer-checked:bg-brand transition-colors" />
        <div className="absolute left-0.5 top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-4" />
      </div>
    </label>
  );
}

export default function ImageSandbox() {
  const [activePage, setActivePage] = useState<PageKey>("contact");
  const [configs, setConfigs] = useState<Record<PageKey, ImageConfig>>({
    contact: { ...DEFAULTS.contact },
    books: { ...DEFAULTS.books },
  });
  const [copied, setCopied] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const config = configs[activePage];

  const update = useCallback(
    (patch: Partial<ImageConfig>) => {
      setConfigs((prev) => ({
        ...prev,
        [activePage]: { ...prev[activePage], ...patch },
      }));
    },
    [activePage]
  );

  const reset = () => {
    setConfigs((prev) => ({
      ...prev,
      [activePage]: { ...DEFAULTS[activePage] },
    }));
  };

  const maskStyle = config.maskEnabled
    ? {
        maskImage: `linear-gradient(to top, transparent 0%, black ${config.maskStart}%, black 100%)`,
        WebkitMaskImage: `linear-gradient(to top, transparent 0%, black ${config.maskStart}%, black 100%)`,
      }
    : {};

  const shadowStyle = config.shadowEnabled
    ? `drop-shadow(0 ${config.shadowY}px ${config.shadowBlur}px rgba(0,0,0,0.5))`
    : "none";

  const scale = config.zoom / 100;
  const lines: string[] = [
    `/* ${activePage} page portrait */`,
    `className: "h-auto w-full"`,
    `style={{`,
    `  transform: "scale(${scale}) translate(${config.offsetX}px, ${config.offsetY}px)",`,
  ];
  if (config.shadowEnabled) {
    lines.push(`  filter: "drop-shadow(0 ${config.shadowY}px ${config.shadowBlur}px rgba(0,0,0,0.5))",`);
  }
  if (config.maskEnabled) {
    lines.push(`  maskImage: "linear-gradient(to top, transparent 0%, black ${config.maskStart}%, black 100%)",`);
  }
  lines.push(`}}`, `maxWidth: ${config.maxWidth}px`);
  const outputCSS = lines.join("\n");

  const copyCSS = () => {
    navigator.clipboard.writeText(outputCSS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <h1 className="font-display text-lg font-bold text-foreground">
            Image Sandbox
          </h1>
          <div className="flex gap-1.5">
            {PRESETS.map((p) => (
              <button
                key={p.page}
                onClick={() => setActivePage(p.page)}
                className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                  activePage === p.page
                    ? "bg-brand text-white shadow-sm"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* ── Preview ──────────────────────────────────── */}
          <div className="lg:col-span-8">
            <div
              ref={previewRef}
              className="relative overflow-hidden rounded-xl border border-border"
              style={{ backgroundColor: config.bgColor }}
            >
              {/* Hero simulation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-6 p-6 sm:p-10 min-h-[400px] sm:min-h-[500px]">
                {/* Portrait */}
                <div className="flex justify-center sm:justify-start">
                  <div
                    className="relative"
                    style={{ maxWidth: `${config.maxWidth}px`, width: "100%" }}
                  >
                    <Image
                      src="/images/section.png"
                      alt="Sagar Lad"
                      width={800}
                      height={890}
                      priority
                      className="h-auto w-full"
                      style={{
                        transform: `scale(${config.zoom / 100}) translate(${config.offsetX}px, ${config.offsetY}px)`,
                        filter: shadowStyle,
                        ...maskStyle,
                      }}
                    />
                  </div>
                </div>

                {/* Fake copy */}
                <div className="flex flex-col gap-4">
                  <div className="h-3 w-20 rounded-full bg-foreground/10" />
                  <div className="space-y-2">
                    <div className="h-8 w-3/4 rounded bg-foreground/8" />
                    <div className="h-8 w-1/2 rounded bg-foreground/8" />
                  </div>
                  <div className="space-y-1.5 mt-2">
                    <div className="h-3 w-full rounded bg-foreground/5" />
                    <div className="h-3 w-4/5 rounded bg-foreground/5" />
                    <div className="h-3 w-3/5 rounded bg-foreground/5" />
                  </div>
                </div>
              </div>

              {/* Device frame labels */}
              <div className="absolute bottom-3 left-3 flex gap-2">
                <span className="rounded bg-foreground/10 px-2 py-0.5 text-[10px] font-medium text-foreground/50">
                  Preview
                </span>
              </div>
            </div>

            {/* Output */}
            <div className="mt-4 rounded-xl border border-border bg-muted/30 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-foreground/60 uppercase tracking-wider">
                  Generated Code
                </span>
                <button
                  onClick={copyCSS}
                  className="rounded-lg bg-brand px-3 py-1 text-xs font-medium text-white hover:bg-brand/90 transition-colors"
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
              <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono leading-relaxed">
                {outputCSS}
              </pre>
            </div>
          </div>

          {/* ── Controls ─────────────────────────────────── */}
          <div className="lg:col-span-4">
            <div className="sticky top-20 space-y-5 rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-foreground">Controls</h2>
                <button
                  onClick={reset}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Reset
                </button>
              </div>

              {/* Size & Position */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                  Size & Position
                </h3>
                <Slider
                  label="Zoom"
                  value={config.zoom}
                  min={50}
                  max={200}
                  step={5}
                  unit="%"
                  onChange={(v) => update({ zoom: v })}
                />
                <Slider
                  label="Max Width"
                  value={config.maxWidth}
                  min={200}
                  max={600}
                  step={10}
                  unit="px"
                  onChange={(v) => update({ maxWidth: v })}
                />
                <Slider
                  label="Offset X"
                  value={config.offsetX}
                  min={-100}
                  max={100}
                  step={1}
                  unit="px"
                  onChange={(v) => update({ offsetX: v })}
                />
                <Slider
                  label="Offset Y"
                  value={config.offsetY}
                  min={-100}
                  max={100}
                  step={1}
                  unit="px"
                  onChange={(v) => update({ offsetY: v })}
                />
              </div>

              {/* Border Radius */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                  Shape
                </h3>
                <Slider
                  label="Border Radius"
                  value={config.borderRadius}
                  min={0}
                  max={200}
                  step={1}
                  unit="px"
                  onChange={(v) => update({ borderRadius: v })}
                />
              </div>

              {/* Mask */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                  Bottom Fade (Mask)
                </h3>
                <Toggle
                  label="Enable Mask"
                  checked={config.maskEnabled}
                  onChange={(v) => update({ maskEnabled: v })}
                />
                {config.maskEnabled && (
                  <Slider
                    label="Fade Start"
                    value={config.maskStart}
                    min={0}
                    max={80}
                    step={1}
                    unit="%"
                    onChange={(v) => update({ maskStart: v })}
                  />
                )}
              </div>

              {/* Shadow */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                  Shadow
                </h3>
                <Toggle
                  label="Enable Shadow"
                  checked={config.shadowEnabled}
                  onChange={(v) => update({ shadowEnabled: v })}
                />
                {config.shadowEnabled && (
                  <>
                    <Slider
                      label="Blur"
                      value={config.shadowBlur}
                      min={0}
                      max={150}
                      step={5}
                      unit="px"
                      onChange={(v) => update({ shadowBlur: v })}
                    />
                    <Slider
                      label="Y Offset"
                      value={config.shadowY}
                      min={0}
                      max={80}
                      step={1}
                      unit="px"
                      onChange={(v) => update({ shadowY: v })}
                    />
                  </>
                )}
              </div>

              {/* Background */}
              <div className="space-y-3">
                <h3 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                  Background
                </h3>
                <div className="flex gap-2">
                  {["#ffffff", "#f8f8f8", "#0A1930", "#1B1B1B"].map((c) => (
                    <button
                      key={c}
                      onClick={() => update({ bgColor: c })}
                      className={`h-8 w-8 rounded-lg border-2 transition-all ${
                        config.bgColor === c
                          ? "border-brand scale-110"
                          : "border-border hover:border-foreground/30"
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              {/* Current values */}
              <div className="rounded-lg bg-muted/50 p-3">
                <h3 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-2">
                  Current Values
                </h3>
                <div className="grid grid-cols-2 gap-1.5 text-xs font-mono text-muted-foreground">
                  <div>zoom: {config.zoom}%</div>
                  <div>maxW: {config.maxWidth}px</div>
                  <div>offsetX: {config.offsetX}px</div>
                  <div>offsetY: {config.offsetY}px</div>
                  <div>radius: {config.borderRadius}px</div>
                  <div>mask: {config.maskEnabled ? `${config.maskStart}%` : "off"}</div>
                  <div>shadow: {config.shadowEnabled ? "on" : "off"}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
