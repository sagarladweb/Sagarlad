"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Play, Brain, Heart, Users, Briefcase, TrendingUp, Star } from "lucide-react";
import { MINDUP_PILLARS, type MindUpPillar } from "@/lib/mindup";
import { Pill } from "@/components/ui/Pill";

const CX = 200;
const CY = 200;
const OUTER = 188;
const INNER = 106;
const MID = (OUTER + INNER) / 2;
const GAP = 1.4;
const STEP = 360 / MINDUP_PILLARS.length;
const TRACE_DUR = 1800;

const PILLAR_ICONS: Record<string, typeof Brain> = {
  M: Brain,
  I: Heart,
  N: Users,
  D: Briefcase,
  P: TrendingUp,
  U: Star,
};

const polar = (angleDeg: number, radius: number): [number, number] => {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  const x = Math.round((CX + radius * Math.cos(rad)) * 1e6) / 1e6;
  const y = Math.round((CY + radius * Math.sin(rad)) * 1e6) / 1e6;
  return [x, y];
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

function traceArc(startDeg: number, endDeg: number): string {
  const s = startDeg + GAP;
  const e = endDeg - GAP;
  const [ox, oy] = polar(s, OUTER);
  const [ex, ey] = polar(e, OUTER);
  const large = e - s > 180 ? 1 : 0;
  return `M ${ox} ${oy} A ${OUTER} ${OUTER} 0 ${large} 1 ${ex} ${ey}`;
}

type RingProps = {
  active: string | null;
  activePillar: MindUpPillar | null;
  playing: boolean;
  playIdx: number;
  playProgress: number;
  onHover: (id: string) => void;
  onLeave: () => void;
  onSelect: (id: string) => void;
  onPlayToggle: () => void;
};

function PillarRing({
  active,
  activePillar,
  playing,
  playIdx,
  playProgress,
  onHover,
  onLeave,
  onSelect,
  onPlayToggle,
}: RingProps) {
  const arcLen = 2 * Math.PI * MID;
  const segArc = arcLen / MINDUP_PILLARS.length;

  return (
    <div className="mx-auto w-full max-w-[340px] sm:max-w-[400px] lg:max-w-[480px]">
      <div className="relative aspect-square w-full select-none">
        <svg viewBox="0 0 400 400" className="h-full w-full" role="img" aria-labelledby="mindup-title">
          <title id="mindup-title">Mind Up Theory — Six Pillars. One Unshakable Life.</title>

          {/* Background ring */}
          <circle cx={CX} cy={CY} r={MID} fill="none" stroke="#FAF9F6" strokeWidth={OUTER - INNER + 2} />

          {/* Segments */}
          {MINDUP_PILLARS.map((p, i) => {
            const start = 240 + i * STEP;
            const isActive = active === p.id;
            const isPlayingDone = playing && i < playIdx;
            const isPlayingActive = playing && i === playIdx;
            const isPlayingPending = playing && i > playIdx;

            let fill = p.color;
            let opacity = 1;
            if (playing) {
              if (isPlayingPending) {
                fill = "#e2e8f0";
                opacity = 0.4;
              } else if (isPlayingActive) {
                opacity = 0.3 + playProgress * 0.7;
              } else {
                opacity = 1;
              }
            } else if (active && !isActive) {
              opacity = 0.3;
            }

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
                className="cursor-pointer focus:outline-none"
                style={{
                  opacity,
                  transform: isActive && !playing ? "scale(1.03)" : "scale(1)",
                  transformBox: "fill-box",
                  transformOrigin: "center",
                  transition: "opacity 0.4s ease, transform 0.3s ease",
                }}
              >
                <path
                  d={sectorPath(start, start + STEP)}
                  fill={fill}
                  stroke="#FAF9F6"
                  strokeWidth={2}
                  strokeLinejoin="round"
                />
                <foreignObject
                  x={polar(start + STEP / 2, MID)[0] - 14}
                  y={polar(start + STEP / 2, MID)[1] - 14}
                  width={28}
                  height={28}
                  aria-hidden="true"
                >
                  <div className="flex h-full w-full items-center justify-center">
                    {(() => {
                      const Icon = PILLAR_ICONS[p.id] ?? Brain;
                      const showIcon = isActive || (playing && (i <= playIdx));
                      
                      if (showIcon) {
                        return (
                          <Icon
                            className="h-5 w-5 sm:h-6 sm:w-6"
                            style={{
                              color: playing && isPlayingPending ? "#94a3b8" : isActive ? "#1e293b" : p.color,
                              transition: "color 0.3s ease",
                            }}
                            strokeWidth={1.5}
                          />
                        );
                      }
                      
                      return (
                        <span className="font-display text-xl sm:text-2xl font-bold text-white select-none pointer-events-none">
                          {p.id}
                        </span>
                      );
                    })()}
                  </div>
                </foreignObject>
              </g>
            );
          })}

          {/* Progressive trace lines during play */}
          {playing && MINDUP_PILLARS.map((p, i) => {
            const start = 240 + i * STEP;
            const d = traceArc(start, start + STEP);
            const status = i < playIdx ? "done" : i === playIdx ? "active" : "pending";
            if (status === "pending") return null;

            return (
              <path
                key={`trace-${p.id}`}
                d={d}
                fill="none"
                stroke={p.color}
                strokeWidth={3}
                strokeLinecap="round"
                strokeDasharray={segArc}
                strokeDashoffset={status === "done" ? 0 : segArc * (1 - playProgress)}
                opacity={status === "done" ? 0.8 : 1}
              />
            );
          })}
        </svg>

        {/* Centre core */}
        <div
          aria-live="polite"
          className="pointer-events-none absolute left-1/2 top-1/2 flex h-[52%] w-[52%] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full bg-[#FAF9F6]/95 text-center ring-1 ring-black/5 overflow-hidden"
        >
          {playing && activePillar ? (
            <div key={`play-${activePillar.id}`} className="pillar-swap px-5 z-10">
              <p className="text-[0.6rem] font-bold uppercase tracking-[0.35em]" style={{ color: activePillar.color }}>
                {activePillar.short}
              </p>
              <p className="mt-1 font-display text-sm font-semibold leading-snug text-[#1e293b]">
                {activePillar.shortDescription}
              </p>
            </div>
          ) : activePillar ? (
            <div key={activePillar.id} className="pillar-swap px-5 z-10">
              <p className="text-[0.6rem] font-bold uppercase tracking-[0.35em] text-[#94a3b8]">
                {activePillar.short}
              </p>
              <p className="mt-1.5 font-display text-sm sm:text-base font-bold leading-snug text-[#1e293b]">
                {activePillar.shortDescription}
              </p>
            </div>
          ) : (
            <div className="relative flex flex-col items-center justify-center w-full h-full p-2">
              <p className="font-display text-[1rem] sm:text-[1.15rem] font-bold uppercase leading-none tracking-[0.12em] text-[#1e293b]">
                Mind Up
              </p>
              <p className="mt-1 text-[0.55rem] font-semibold uppercase tracking-[0.4em] text-[#94a3b8]">
                Theory
              </p>
              <button
                type="button"
                onClick={onPlayToggle}
                aria-label="Play pillar walkthrough"
                className="btn-premium pointer-events-auto z-10 mt-4 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full border border-[#1e293b]/15 bg-transparent hover:bg-[#1e293b]/5 text-[#1e293b] active:scale-95"
              >
                <Play className="h-6 w-6 sm:h-7 sm:w-7 ml-0.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      <p className="mt-8 text-center text-xs text-[#94a3b8]">
        <span className="lg:hidden">Tap a pillar to explore it.</span>
        <span className="hidden lg:inline">Hover over a pillar to explore it.</span>
      </p>
    </div>
  );
}

export function MindUpPillars() {
  const [active, setActive] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [playIdx, setPlayIdx] = useState(-1);
  const [playProgress, setPlayProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number>(0);
  const idxRef = useRef(0);
  const startTimeRef = useRef(0);

  const activePillar = active
    ? (MINDUP_PILLARS.find((p) => p.id === active) ?? null)
    : null;

  const stopPlay = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    timerRef.current = null;
    rafRef.current = 0;
    setPlaying(false);
    setPlayIdx(-1);
    setPlayProgress(0);
    idxRef.current = 0;
  }, []);

  const animateSegment = useCallback(() => {
    const elapsed = performance.now() - startTimeRef.current;
    const progress = Math.min(elapsed / TRACE_DUR, 1);
    setPlayProgress(progress);
    if (progress < 1) {
      rafRef.current = requestAnimationFrame(animateSegment);
    }
  }, []);

  const playNext = useCallback(() => {
    const i = idxRef.current;
    if (i >= MINDUP_PILLARS.length) {
      timerRef.current = setTimeout(() => {
        stopPlay();
        setActive(null);
      }, 500);
      return;
    }
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setActive(MINDUP_PILLARS[i].id);
    setPlayIdx(i);
    setPlayProgress(0);
    startTimeRef.current = performance.now();
    rafRef.current = requestAnimationFrame(animateSegment);
    idxRef.current = i + 1;
    timerRef.current = setTimeout(playNext, TRACE_DUR + 50);
  }, [stopPlay, animateSegment]);

  const startPlay = useCallback(() => {
    if (playing) {
      stopPlay();
      return;
    }
    idxRef.current = 0;
    setPlaying(true);
    playNext();
  }, [playing, stopPlay, playNext]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const hoverDevice = () =>
    typeof window !== "undefined" && window.matchMedia("(hover: hover)").matches;

  const hover = (id: string) => {
    if (hoverDevice() && !playing) setActive(id);
  };
  const leave = () => {
    if (hoverDevice() && !playing) setActive(null);
  };
  const select = (id: string) => {
    stopPlay();
    setActive((prev) => (prev === id ? null : id));
  };

  return (
    <section
      aria-label="Mind Up Theory — Six Pillars"
      className="relative overflow-hidden bg-[#FAF9F6] py-16 md:py-24 border-b border-[#e2e8f0]/40"
    >
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        {/* Mobile / tablet */}
        <div className="text-center lg:hidden" data-animate="up" suppressHydrationWarning>
          <Pill>The Mind Up Theory</Pill>
          <h2 className="mt-8 font-display text-4xl font-bold leading-[1.1] tracking-tight text-[#1e293b] sm:text-5xl">
            Six Pillars.
            <br />
            One Unshakable Life.
          </h2>
          <p className="mx-auto mt-6 max-w-md text-base leading-relaxed text-[#64748b] sm:text-lg">
            Master your mind and build a life that stays strong no matter what
            comes your way.
          </p>
          <p className="mt-3 text-sm text-[#94a3b8]">By: Sagar Lad</p>
        </div>

        {/* Desktop */}
        <div className="hidden lg:grid lg:grid-cols-2 lg:items-center lg:gap-16 xl:gap-24" suppressHydrationWarning>
          <div className="lg:min-h-[280px]" data-animate="left" suppressHydrationWarning>
            <Pill>The Mind Up Theory</Pill>
            <div key={activePillar?.id ?? "intro"} className="pillar-swap mt-8">
              {activePillar && !playing ? (
                <>
                  <h2 className="font-display text-4xl xl:text-[3.25rem] font-bold leading-[1.05] tracking-tight text-[#1e293b]">
                    {activePillar.short}
                  </h2>
                  <p className="mt-4 text-lg font-semibold text-[#1e293b]">
                    {activePillar.shortDescription}
                  </p>
                  <p className="mt-3 max-w-md text-base leading-relaxed text-[#64748b]">
                    {activePillar.description}
                  </p>
                </>
              ) : (
                <>
                  <h2 className="font-display text-4xl xl:text-[3.25rem] font-bold leading-[1.05] tracking-tight text-[#1e293b]">
                    Six Pillars.
                    <br />
                    One Unshakable Life.
                  </h2>
                  <p className="mt-5 max-w-md text-base leading-relaxed text-[#64748b]">
                    Master your mind and build a life that stays strong no
                    matter what comes your way.
                  </p>
                  <p className="mt-3 text-sm text-[#94a3b8]">By: Sagar Lad</p>
                </>
              )}
            </div>
          </div>

          <div data-animate="right" suppressHydrationWarning>
            <PillarRing
              active={active}
              activePillar={activePillar}
              playing={playing}
              playIdx={playIdx}
              playProgress={playProgress}
              onHover={hover}
              onLeave={leave}
              onSelect={select}
              onPlayToggle={startPlay}
            />
          </div>
        </div>

        {/* Mobile / tablet ring */}
        <div className="mt-14 lg:hidden" data-animate="zoom" suppressHydrationWarning>
          <PillarRing
            active={active}
            activePillar={activePillar}
            playing={playing}
            playIdx={playIdx}
            playProgress={playProgress}
            onHover={hover}
            onLeave={leave}
            onSelect={select}
            onPlayToggle={startPlay}
          />
        </div>
      </div>
    </section>
  );
}
