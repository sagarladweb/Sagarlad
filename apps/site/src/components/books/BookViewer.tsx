"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, ShoppingBag, MousePointerClick } from "lucide-react";
import { SiteLogo } from "@/components/SiteLogo";

type BookViewerBook = {
  title: string;
  tagline: string | null;
  imageUrl: string | null;
  description: string | null;
  author: string | null;
  buyUrl?: string | null;
};

type Props = {
  book: BookViewerBook;
  open: boolean;
  onClose: () => void;
};

function playPageTurnSound() {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const bufferSize = ctx.sampleRate * 0.16;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.28));
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(900, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.16);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.16);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start();
  } catch {
    // Ignore audio context restrictions
  }
}

export function BookViewer({ book, open, onClose }: Props) {
  const [page, setPage] = useState(0);
  const [prevPage, setPrevPage] = useState(0);
  const [targetPage, setTargetPage] = useState(0);
  const [animDir, setAnimDir] = useState<"next" | "prev" | null>(null);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      setPage(0);
      setPrevPage(0);
      setTargetPage(0);
      return () => {
        document.body.style.overflow = "";
      };
    }
    document.body.style.overflow = "";
  }, [open]);

  // Keyboard
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      if (e.key === "ArrowRight") {
        setPage((p) => { if (p < 3) { playPageTurnSound(); return p + 1; } return p; });
      } else if (e.key === "ArrowLeft") {
        setPage((p) => { if (p > 0) { playPageTurnSound(); return p - 1; } return p; });
      } else if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Swipe
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    // Desktop: horizontal swipe; Mobile: vertical swipe
    const isMobile = window.innerWidth < 640;
    const dominant = isMobile ? Math.abs(dy) : Math.abs(dx);
    const threshold = isMobile ? 30 : 40;
    if (dominant > threshold) {
      const forward = isMobile ? dy < 0 : dx < 0;
      setPage((p) => {
        const next = forward ? p + 1 : p - 1;
        if (next >= 0 && next < 4) { playPageTurnSound(); return next; }
        return p;
      });
    }
  }, []);

  if (!open) return null;

  const totalPages = 4;

  const flipTo = (target: number) => {
    if (target < 0 || target >= totalPages || animDir) return;
    playPageTurnSound();
    // Batch all state: outgoing shows prevPage, incoming shows targetPage
    setPrevPage(page);
    setTargetPage(target);
    setPage(target);
    setAnimDir(target > page ? "next" : "prev");
    // After CSS animations complete (350ms + 60ms delay), clean up
    setTimeout(() => {
      setPrevPage(target);
      setTargetPage(target);
      setAnimDir(null);
    }, 420);
  };

  const prev = () => flipTo(page - 1);
  const next = () => flipTo(page + 1);

  // Desktop flip classes
  const outCls = animDir === "next" ? "book-page-out-left" : animDir === "prev" ? "book-page-out-right" : "";
  const inCls = animDir === "next" ? "book-page-in-right" : animDir === "prev" ? "book-page-in-left" : "";

  // Mobile flip classes
  const mOutCls = animDir === "next" ? "book-mob-out-down" : animDir === "prev" ? "book-mob-out-up" : "";
  const mInCls = animDir === "next" ? "book-mob-in-up" : animDir === "prev" ? "book-mob-in-down" : "";

  const desc = book.description ?? "";
  const firstParagraph = desc.split("\n").find((p) => p.trim()) || desc;

  /* ── Page content renderers ── */

  const leftPage = (p: number) => {
    if (p === 0) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#FAF8F5] to-[#ece5da]">
          {book.imageUrl ? (
            <div className="relative w-[70%] h-[80%] rounded-xl overflow-hidden shadow-2xl border border-black/10">
              <Image src={book.imageUrl} alt={book.title} fill sizes="300px" className="object-contain" priority />
            </div>
          ) : (
            <div className="w-[70%] h-[80%] grid place-items-center rounded-xl bg-muted p-4 text-center">
              <span className="font-display text-xl font-bold">{book.title}</span>
            </div>
          )}
        </div>
      );
    }
    if (p === 1) {
      return (
        <div className="w-full h-full p-6 sm:p-10 flex flex-col justify-between bg-[#FAF8F5] overflow-hidden">
          <div className="min-h-0 overflow-hidden">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0d21a1]">Preface</span>
            <h3 className="font-display text-xl sm:text-2xl font-bold mt-1 mb-4">Why I Wrote This Book</h3>
            <p className="text-xs sm:text-sm leading-relaxed text-foreground/80 break-words">
              {firstParagraph || "This book was written for anyone seeking clarity, discipline, and actionable frameworks in a noisy world. No fluff, no synthetic hype — just battle-tested principles applied across real engineering, investments, and life."}
            </p>
          </div>
          <div className="text-xs text-muted-foreground pt-4 border-t border-border/60 shrink-0">Page 1</div>
        </div>
      );
    }
    if (p === 2) {
      return (
        <div className="w-full h-full p-6 sm:p-10 flex flex-col justify-between bg-[#FAF8F5] overflow-hidden">
          <div className="min-h-0 overflow-hidden">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0d21a1]">Chapter 1 Excerpt</span>
            <h3 className="font-display text-xl sm:text-2xl font-bold mt-1 mb-3">The Mindset Shift</h3>
            <p className="text-xs sm:text-sm leading-relaxed text-foreground/85 break-words">
              {book.description ?? "Most people react to life automatically. The moment you pause and observe your choices, you transition from autopilot to intentional action. Mindset isn't about positive thinking; it's about clear thinking."}
            </p>
          </div>
          <div className="text-xs text-muted-foreground pt-4 border-t border-border/60 shrink-0">Page 3</div>
        </div>
      );
    }
    return (
      <div className="w-full h-full p-6 sm:p-10 flex flex-col justify-between bg-[#FAF8F5] overflow-hidden">
        <div className="min-h-0 overflow-hidden">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0d21a1]">Final Note</span>
          <h3 className="font-display text-xl sm:text-2xl font-bold mt-1 mb-3">Ready to Rise Within?</h3>
          <p className="text-xs sm:text-sm leading-relaxed text-foreground/80 break-words">
            You have experienced a glimpse of {book.title}. Get the full official copy to unlock the complete exercises, frameworks, and practical guidance.
          </p>
        </div>
        <div className="text-xs text-muted-foreground pt-4 border-t border-border/60 shrink-0">Page 5</div>
      </div>
    );
  };

  const rightPage = (p: number) => {
    if (p === 0) {
      return (
        <div className="w-full h-full p-6 sm:p-10 flex flex-col justify-between bg-[#FAF8F5] overflow-hidden">
          <div className="space-y-3 min-h-0 overflow-hidden">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#0d21a1]">
              {book.tagline ?? "Official Edition"}
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-foreground leading-tight break-words">{book.title}</h2>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium">By {book.author ?? "Sagar Lad"}</p>
          </div>
          <div className="my-auto py-4 space-y-2 border-y border-border/70 min-h-0 overflow-hidden">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {book.tagline ?? "Mindset & Execution Playbook"}
            </p>
            <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed italic break-words">
              &ldquo;{firstParagraph || "People don't make poor choices — they make the best choices they can with the information they have."}&rdquo;
            </p>
          </div>
          <div className="flex items-center justify-center pt-2 shrink-0">
            <SiteLogo className="h-6 w-auto logo-black opacity-60" />
          </div>
        </div>
      );
    }
    if (p === 1) {
      return (
        <div className="w-full h-full p-6 sm:p-10 flex flex-col justify-between bg-[#FAF8F5] overflow-hidden">
          <div className="min-h-0 overflow-hidden">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0d21a1]">Structure</span>
            <h3 className="font-display text-xl sm:text-2xl font-bold mt-1 mb-4">Table of Contents</h3>
            <ul className="space-y-2 text-xs sm:text-sm text-foreground/85">
              {["The Foundation of Mindset", "Emotional Alignment & Awareness", "Daily Habits & Discipline", "Unshakable Resilience", "Purpose, Legacy & Giving Back"].map((ch, i) => (
                <li key={ch} className="flex justify-between border-b border-border/50 pb-1.5">
                  <span className="break-words">0{i + 1}. {ch}</span>
                  <span className="font-bold text-muted-foreground shrink-0 ml-2">p. {[9, 27, 45, 81, 119][i]}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="text-xs text-muted-foreground pt-4 border-t border-border/60 flex items-center justify-center gap-4 shrink-0">
            <span>Page 2</span>
            <SiteLogo className="h-5 w-auto logo-black opacity-50" />
          </div>
        </div>
      );
    }
    if (p === 2) {
      return (
        <div className="w-full h-full p-6 sm:p-10 flex flex-col justify-between bg-[#FAF8F5] overflow-hidden">
          <div className="min-h-0 overflow-hidden">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0d21a1]">Key Takeaway</span>
            <h3 className="font-display text-xl sm:text-2xl font-bold mt-1 mb-3">Action Over Intention</h3>
            <div className="p-4 rounded-xl bg-[#ffd51d]/15 border border-[#ffd51d]/30 text-xs sm:text-sm text-foreground font-medium leading-relaxed break-words">
              &ldquo;Intention without daily execution is just a pleasant dream. Small, relentless steps compound into extraordinary life trajectories.&rdquo;
            </div>
          </div>
          <div className="text-xs text-muted-foreground pt-4 border-t border-border/60 flex items-center justify-center gap-4 shrink-0">
            <span>Page 4</span>
            <SiteLogo className="h-5 w-auto logo-black opacity-50" />
          </div>
        </div>
      );
    }
    return (
      <div className="w-full h-full p-6 sm:p-10 flex flex-col justify-between items-center text-center bg-[#FAF8F5] overflow-hidden">
        <div className="my-auto space-y-4 min-h-0 overflow-hidden">
          <SiteLogo className="h-8 w-auto logo-black mx-auto" />
          <h4 className="font-display text-lg sm:text-xl font-bold break-words">{book.title}</h4>
          <p className="text-xs text-muted-foreground">Available worldwide on Amazon & digital stores.</p>
          <a
            href={book.buyUrl ?? "/books"}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-[#ffd51d] text-black px-6 py-3 text-xs font-bold shadow-lg hover:scale-105 transition-transform"
          >
            <ShoppingBag className="w-4 h-4" />
            Get Official Copy Now
          </a>
        </div>
        <div className="text-xs text-muted-foreground pt-4 border-t border-border/60 w-full flex justify-between shrink-0">
          <span>Page 6</span>
          <span>End of Preview</span>
        </div>
      </div>
    );
  };

  const mobilePage = (p: number) => {
    if (p === 0) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-[#FAF8F5] to-[#ece5da] overflow-hidden">
          {book.imageUrl ? (
            <div className="relative w-[65%] aspect-[3/4] rounded-xl overflow-hidden shadow-2xl border border-black/10">
              <Image src={book.imageUrl} alt={book.title} fill sizes="300px" className="object-contain" priority />
            </div>
          ) : (
            <div className="w-[65%] aspect-[3/4] grid place-items-center rounded-xl bg-muted p-4 text-center">
              <span className="font-display text-xl font-bold">{book.title}</span>
            </div>
          )}
          <div className="mt-4 flex flex-col items-center gap-1 animate-bounce">
            <MousePointerClick className="w-4 h-4 text-white/60" />
            <span className="text-[10px] font-medium text-white/50">Click on image</span>
          </div>
        </div>
      );
    }
    if (p === 1) {
      return (
        <div className="w-full h-full p-4 flex flex-col justify-between bg-[#FAF8F5] overflow-hidden">
          <div className="min-h-0 overflow-hidden">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0d21a1]">Preface</span>
            <h3 className="font-display text-base font-bold mt-1 mb-2">Why I Wrote This Book</h3>
            <p className="text-[11px] leading-relaxed text-foreground/80 break-words">
              {firstParagraph || "This book was written for anyone seeking clarity, discipline, and actionable frameworks in a noisy world."}
            </p>
          </div>
          <div className="text-[10px] text-muted-foreground pt-2 border-t border-border/60 shrink-0">Page 1</div>
        </div>
      );
    }
    if (p === 2) {
      return (
        <div className="w-full h-full p-4 flex flex-col justify-between bg-[#FAF8F5] overflow-hidden">
          <div className="min-h-0 overflow-hidden">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0d21a1]">Chapter 1 Excerpt</span>
            <h3 className="font-display text-base font-bold mt-1 mb-2">The Mindset Shift</h3>
            <p className="text-[11px] leading-relaxed text-foreground/85 break-words">
              {book.description ?? "Most people react to life automatically. The moment you pause and observe your choices, you transition from autopilot to intentional action."}
            </p>
          </div>
          <div className="text-[10px] text-muted-foreground pt-2 border-t border-border/60 shrink-0">Page 3</div>
        </div>
      );
    }
    return (
      <div className="w-full h-full p-4 flex flex-col justify-between bg-[#FAF8F5] overflow-hidden">
        <div className="min-h-0 overflow-hidden">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0d21a1]">Final Note</span>
          <h3 className="font-display text-base font-bold mt-1 mb-2">Ready to Rise Within?</h3>
          <p className="text-[11px] leading-relaxed text-foreground/80 break-words">
            You have experienced a glimpse of {book.title}. Get the full official copy to unlock the complete exercises, frameworks, and practical guidance.
          </p>
        </div>
        <div className="text-[10px] text-muted-foreground pt-2 border-t border-border/60 shrink-0">Page 5</div>
      </div>
    );
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex flex-col bg-black/90 backdrop-blur-lg overflow-hidden"
      onClick={onClose}
      role="dialog"
      aria-label={`Preview of ${book.title}`}
    >
      {/* ── Top Bar ── */}
      <div
        className="w-full flex items-center justify-between gap-4 z-[10000] px-4 sm:px-6 pt-4 sm:pt-6 pb-2 shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="text-sm sm:text-base text-white font-semibold truncate">{book.title}</span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close book preview"
          className="btn-premium grid h-9 w-9 place-items-center rounded-full bg-white/90 text-foreground shadow-md hover:bg-white"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* ═══ DESKTOP ═══ */}
      <div className="hidden sm:flex flex-1 items-center justify-center px-6 py-4 min-h-0">
        <div className="relative flex items-center gap-3">
          {/* Left arrow */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); prev(); }}
            disabled={page === 0}
            aria-label="Previous spread"
            className="btn-premium grid h-10 w-10 place-items-center rounded-full border border-white/30 bg-white/10 text-white disabled:opacity-25 hover:bg-white/20 shadow-lg shrink-0"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div
            className="relative w-full max-w-4xl aspect-[1.5/1] rounded-xl shadow-2xl overflow-hidden border-4 border-[#2b2927] bg-[#1a1918]"
            onClick={(e) => e.stopPropagation()}
            style={{ perspective: "2000px" }}
          >
            {/* Left page */}
            <div className="absolute left-0 top-0 w-1/2 h-full overflow-hidden" style={{ transformOrigin: "right center" }}>
              {/* Outgoing: z-10 during anim (on top), z-0 when idle */}
              <div
                className={`absolute inset-0 ${outCls}`}
                style={{ zIndex: animDir ? 10 : 0, pointerEvents: animDir ? "none" : "auto" }}
              >
                {leftPage(prevPage)}
              </div>
              {/* Incoming: z-0 during anim (behind), z-10 when idle (on top) */}
              <div
                className={`absolute inset-0 ${inCls}`}
                style={{ zIndex: animDir ? 0 : 10 }}
              >
                {leftPage(page)}
              </div>
            </div>

            {/* Right page */}
            <div className="absolute right-0 top-0 w-1/2 h-full overflow-hidden" style={{ transformOrigin: "left center" }}>
              <div
                className={`absolute inset-0 ${outCls}`}
                style={{ zIndex: animDir ? 10 : 0, pointerEvents: animDir ? "none" : "auto" }}
              >
                {rightPage(prevPage)}
              </div>
              <div
                className={`absolute inset-0 ${inCls}`}
                style={{ zIndex: animDir ? 0 : 10 }}
              >
                {rightPage(page)}
              </div>
            </div>

            {/* Central spine */}
            <div className="absolute left-1/2 top-0 bottom-0 w-8 -translate-x-1/2 bg-gradient-to-r from-black/20 via-black/35 to-black/20 z-30 pointer-events-none" />
          </div>

          {/* Right arrow */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); next(); }}
            disabled={page === totalPages - 1}
            aria-label="Next spread"
            className="btn-premium grid h-10 w-10 place-items-center rounded-full border border-white/30 bg-white/10 text-white disabled:opacity-25 hover:bg-white/20 shadow-lg shrink-0"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ═══ MOBILE — vertical single-page ═══ */}
      <div
        className="sm:hidden flex-1 flex flex-col items-center justify-center px-4 py-3 min-h-0"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div
          className="relative w-full max-w-sm rounded-xl shadow-2xl overflow-hidden border-2 border-[#2b2927] bg-[#1a1918]"
          onClick={(e) => e.stopPropagation()}
          style={{ height: "60vh", perspective: "1200px" }}
        >
          {/* Outgoing */}
          <div
            className={`absolute inset-0 ${mOutCls}`}
            style={{ zIndex: animDir ? 10 : 0, pointerEvents: animDir ? "none" : "auto" }}
          >
            {mobilePage(prevPage)}
          </div>
          {/* Incoming */}
          <div
            className={`absolute inset-0 ${mInCls}`}
            style={{ zIndex: animDir ? 0 : 10 }}
          >
            {mobilePage(page)}
          </div>

          {/* Side arrows */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); prev(); }}
            disabled={page === 0}
            aria-label="Previous page"
            className="absolute left-2 top-1/2 -translate-y-1/2 z-40 grid h-9 w-9 place-items-center rounded-full bg-black/40 text-white backdrop-blur-sm disabled:opacity-0 transition-opacity"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); next(); }}
            disabled={page === totalPages - 1}
            aria-label="Next page"
            className="absolute right-2 top-1/2 -translate-y-1/2 z-40 grid h-9 w-9 place-items-center rounded-full bg-black/40 text-white backdrop-blur-sm disabled:opacity-0 transition-opacity"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Page indicator */}
        <div className="mt-3 flex items-center gap-2">
          <button type="button" onClick={prev} disabled={page === 0} className="btn-premium text-white/60 disabled:opacity-25">
            <ChevronUp className="w-4 h-4" />
          </button>
          <span className="text-[11px] font-bold text-white/70 tabular-nums">{page + 1} / {totalPages}</span>
          <button type="button" onClick={next} disabled={page === totalPages - 1} className="btn-premium text-white/60 disabled:opacity-25">
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Buy Now CTA — bottom, easy thumb reach ── */}
      <div
        className="w-full shrink-0 px-4 sm:px-6 pb-4 sm:pb-6 pt-2 z-[10000]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="max-w-md mx-auto sm:max-w-lg">
          <a
            href={book.buyUrl ?? "/books"}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full rounded-full bg-[#ffd51d] text-black px-6 py-3.5 text-sm font-bold shadow-lg hover:scale-[1.02] transition-transform"
          >
            <ShoppingBag className="w-4 h-4" />
            Buy Now
          </a>
        </div>
      </div>

      {/* ── Desktop page indicator ── */}
      <div
        className="hidden sm:flex w-full items-center justify-center gap-6 z-[10000] pb-4 shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="btn-premium text-xs font-bold text-white tracking-widest tabular-nums bg-white/10 px-4 py-1.5 rounded-full border border-white/20 shadow-sm">
          {page + 1} / {totalPages}
        </span>
      </div>
    </div>
  );

  if (typeof document !== "undefined") {
    return createPortal(modalContent, document.body);
  }
  return modalContent;
}
