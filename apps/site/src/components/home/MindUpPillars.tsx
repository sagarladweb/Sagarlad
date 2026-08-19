"use client";

import { useState } from "react";
import { MINDUP_PILLARS, type MindUpPillar } from "@/lib/mindup";

// MIND UP THEORY — Six Pillars. One Unshakable Life.
// One interactive system: the SVG ring, the pillar cards and the info panel
// all read from a single `active` state. Pastel palette from design/mindup.ts.

const CX = 200;
const CY = 200;
const OUTER = 188;
const INNER = 106;
const MID = (OUTER + INNER) / 2;
const GAP = 1.4; // degrees of off-white divider between segments
const STEP = 360 / MINDUP_PILLARS.length;

// Abstract line marks per pillar (24×24 space) — no letters, no avatars.
const MARKS: Record<string, React.ReactNode> = {
  M: (
    <>
      <path d="M12 3l7 9-7 9-7-9 7-9z" />
      <path d="M12 8.5l3.5 3.5-3.5 3.5-3.5-3.5 3.5-3.5z" />
    </>
  ),
  I: <path d="M3 12h4l2-5 4 10 2-5h6" />,
  N: (
    <>
      <circle cx="9" cy="12" r="6" />
      <circle cx="15" cy="12" r="6" />
    </>
  ),
  D: (
    <>
      <path d="M3 21h18" />
      <path d="M7 21v-4h3v-4h3v-4h3V5" />
    </>
  ),
  P: (
    <>
      <path d="M20 12a8 8 0 1 1-2.34-5.66" />
      <path d="M20 3v4h-4" />
    </>
  ),
  U: (
    <>
      <circle cx="12" cy="10" r="5" />
      <path d="M12 15v6" />
    </>
  ),
};

const polar = (angleDeg: number, radius: number): [number, number] => {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return [CX + radius * Math.cos(rad), CY + radius * Math.sin(rad)];
};

function sectorPath(startDeg: number, endDeg: number): string {
  const s = startDeg + GAP;
  const e = endDeg - GAP;
  const [ox, oy] = polar(s, OUTER);
  const [ex, ey] = polar(e, OUTER);
  const [ix, iy] = polar(e, INNER);
  const [jx, jy] = polar(s, INNER);
  const large = e - s > 180 ? 1 : 0;
  return [
    `M ${ox} ${oy}`,
    `A ${OUTER} ${OUTER} 0 ${large} 1 ${ex} ${ey}`,
    `L ${ix} ${iy}`,
    `A ${INNER} ${INNER} 0 ${large} 0 ${jx} ${jy}`,
    "Z",
  ].join(" ");
}

type RingProps = {
  active: string | null;
  activePillar: MindUpPillar | null;
  onHover: (id: string) => void;
  onLeave: () => void;
  onSelect: (id: string) => void;
};

// The six-pillar ring. Every segment carries its icon at all breakpoints; the
// centre swaps to the selected pillar.
function PillarRing({ active, activePillar, onHover, onLeave, onSelect }: RingProps) {
  return (
    <div className="mx-auto w-full max-w-[340px] sm:max-w-[400px] lg:max-w-[480px]">
      <div className="relative aspect-square w-full select-none">
        <svg
          viewBox="0 0 400 400"
          className="h-full w-full"
          role="img"
          aria-labelledby="mindup-pillars-title"
        >
          <title id="mindup-pillars-title">
            Mind Up Theory — Six Pillars. One Unshakable Life.
          </title>
          {/* Subtle guide ring */}
          <circle
            cx={CX}
            cy={CY}
            r={OUTER + 12}
            fill="none"
            stroke="#111827"
            strokeOpacity={0.05}
            strokeWidth={1}
            strokeDasharray="2 6"
          />
          {/* Off-white ring behind the segments forms the dividers */}
          <circle
            cx={CX}
            cy={CY}
            r={MID}
            fill="none"
            stroke="#FAF9F6"
            strokeWidth={OUTER - INNER + 2}
          />
          {MINDUP_PILLARS.map((p, i) => {
            const start = -90 - STEP / 2 + i * STEP;
            const centerDeg = start + STEP / 2;
            const [ix, iy] = polar(centerDeg, MID);
            const isActive = active === p.id;
            return (
              <g
                key={p.id}
                role="button"
                tabIndex={0}
                aria-label={`${p.short} — ${p.shortDescription}`}
                aria-pressed={isActive}
                onMouseEnter={() => onHover(p.id)}
                onMouseLeave={onLeave}
                onFocus={() => onHover(p.id)}
                onBlur={onLeave}
                onClick={() => onSelect(p.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelect(p.id);
                  }
                }}
                className="cursor-pointer focus:outline-none focus-visible:opacity-90"
                style={{
                  opacity: active && !isActive ? 0.35 : 1,
                  transform: isActive ? "scale(1.04)" : "scale(1)",
                  transformBox: "fill-box",
                  transformOrigin: "center",
                  transition: "opacity 0.3s ease, transform 0.3s ease",
                }}
              >
                <path
                  d={sectorPath(start, start + STEP)}
                  fill={p.color}
                  stroke="#FAF9F6"
                  strokeWidth={2}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  style={{
                    filter: isActive
                      ? "drop-shadow(0 8px 14px rgba(17,24,39,0.14))"
                      : undefined,
                    transition: "filter 0.3s ease",
                  }}
                />
                {/* Icon — visible at every breakpoint */}
                <g
                  transform={`translate(${ix - 15} ${iy - 15}) scale(1.25)`}
                  fill="none"
                  stroke={isActive ? "#111827" : p.color}
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  {MARKS[p.id]}
                </g>
              </g>
            );
          })}
        </svg>

        {/* Centre core — MIND UP, or the selected pillar */}
        <div
          aria-live="polite"
          className="pointer-events-none absolute left-1/2 top-1/2 flex h-[46%] w-[46%] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full bg-[#FAF9F6] text-center ring-1 ring-black/5"
        >
          {activePillar ? (
            <div key={activePillar.id} className="pillar-swap px-5">
              <p className="text-[0.62rem] font-bold uppercase tracking-[0.4em] text-[#1738B8]">
                {activePillar.short}
              </p>
              <p className="mt-1.5 font-display text-sm font-bold leading-snug text-[#111827]">
                {activePillar.shortDescription}
              </p>
            </div>
          ) : (
            <>
              <p className="font-display text-[1.15rem] font-extrabold uppercase leading-none tracking-[0.14em] text-[#111827] sm:text-[1.3rem]">
                Mind Up
              </p>
              <p className="mt-1.5 text-[0.6rem] font-bold uppercase tracking-[0.45em] text-[#1738B8]">
                Theory
              </p>
              <span aria-hidden="true" className="mt-2 h-px w-8 bg-black/10" />
              <p className="mt-2 px-6 text-[0.72rem] font-medium leading-snug text-[#666666]">
                The Unshakable Life
              </p>
            </>
          )}
        </div>
      </div>

      <p className="mt-7 text-center text-xs text-[#999999]">
        <span className="lg:hidden">Tap a pillar to explore it.</span>
        <span className="hidden lg:inline">Hover over a pillar to explore it.</span>
      </p>
    </div>
  );
}

export function MindUpPillars() {
  const [active, setActive] = useState<string | null>(null);

  const activePillar = active
    ? (MINDUP_PILLARS.find((p) => p.id === active) ?? null)
    : null;

  const hoverDevice = () =>
    typeof window !== "undefined" && window.matchMedia("(hover: hover)").matches;

  const hover = (id: string) => {
    if (hoverDevice()) setActive(id);
  };
  const leave = () => {
    if (hoverDevice()) setActive(null);
  };
  const select = (id: string) => setActive((prev) => (prev === id ? null : id));

  return (
    <section
      aria-label="Mind Up Theory — Six Pillars"
      className="relative overflow-hidden bg-[#FAF9F6] py-20 md:py-28"
    >
      {/* Soft radial tint behind the diagram */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[-10%] top-1/3 hidden h-[520px] w-[520px] rounded-full opacity-60 blur-3xl lg:block"
        style={{
          background:
            "radial-gradient(circle, rgba(102,116,184,0.10), rgba(249,249,246,0) 65%)",
        }}
      />

      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        {/* ---------- Intro (mobile / tablet) ---------- */}
        <div className="text-center lg:hidden">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#1738B8]">
            The Mind Up Theory
          </p>
          <h2 className="mt-4 font-display text-4xl font-bold leading-[1.08] tracking-tight text-[#111827] sm:text-5xl">
            Six Pillars.
            <br />
            One <em className="italic text-[#1738B8]">Unshakable</em> Life.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-[#666666] sm:text-lg">
            Master your mind and build a life that stays strong no matter what
            comes your way.
          </p>
        </div>

        {/* ---------- Desktop row: info panel (left) + ring (right) ---------- */}
        <div className="hidden lg:grid lg:grid-cols-2 lg:items-center lg:gap-14 xl:gap-20">
          <div className="lg:min-h-[250px]">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#1738B8]">
              The Mind Up Theory
            </p>
            <div key={activePillar?.id ?? "intro"} className="pillar-swap mt-4">
              {activePillar ? (
                <>
                  <h2 className="font-display text-4xl xl:text-[3.25rem] font-bold leading-[1.05] tracking-tight text-[#111827]">
                    {activePillar.short}
                  </h2>
                  <p className="mt-3 text-lg font-semibold text-[#111827]">
                    {activePillar.shortDescription}
                  </p>
                  <p className="mt-2 max-w-md text-base leading-relaxed text-[#666666]">
                    {activePillar.description}
                  </p>
                </>
              ) : (
                <>
                  <h2 className="font-display text-4xl xl:text-[3.25rem] font-bold leading-[1.05] tracking-tight text-[#111827]">
                    Six Pillars.
                    <br />
                    One <em className="italic text-[#1738B8]">Unshakable</em> Life.
                  </h2>
                  <p className="mt-4 max-w-md text-base leading-relaxed text-[#666666]">
                    Master your mind and build a life that stays strong no
                    matter what comes your way.
                  </p>
                </>
              )}
            </div>
          </div>

          <div>
            <PillarRing
              active={active}
              activePillar={activePillar}
              onHover={hover}
              onLeave={leave}
              onSelect={select}
            />
          </div>
        </div>

        {/* ---------- Mobile / tablet ring ---------- */}
        <div className="mt-12 lg:hidden">
          <PillarRing
            active={active}
            activePillar={activePillar}
            onHover={hover}
            onLeave={leave}
            onSelect={select}
          />
        </div>
      </div>
    </section>
  );
}