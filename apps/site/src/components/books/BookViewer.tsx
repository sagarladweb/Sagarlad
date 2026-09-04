"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, ShoppingBag } from "lucide-react";
import { type BookId, type PageData, mindupPages, azurePages } from "./BookPages";

type Props = {
  bookId: BookId;
  buyUrl?: string | null;
  open: boolean;
  onClose: () => void;
};

const PAGE_FLIP_CONFIG = {
  width: 420,
  height: 600,
  size: "stretch" as const,
  minWidth: 300,
  maxWidth: 1000,
  minHeight: 400,
  maxHeight: 1200,
  maxShadowOpacity: 0.4,
  showCover: true,
  mobileScrollSupport: false,
  usePortrait: true,
};

/* eslint-disable @typescript-eslint/no-explicit-any */
type FlipInstance = any;
/* eslint-enable @typescript-eslint/no-explicit-any */

function BookViewerInner({ bookId, buyUrl, open, onClose }: Props) {
  const bookRef = useRef<HTMLDivElement>(null);
  const flipRef = useRef<FlipInstance | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  const pages = bookId === "mindup" ? mindupPages() : azurePages();

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Initialize page-flip
  useEffect(() => {
    if (!open || !bookRef.current) return;

    let instance: FlipInstance | null = null;

    const init = async () => {
      const { PageFlip } = await import("page-flip");
      if (!bookRef.current) return;

      // Clean previous instance
      if (flipRef.current) {
        try { flipRef.current.destroy(); } catch { /* ignore */ }
        flipRef.current = null;
      }

      instance = new PageFlip(bookRef.current, PAGE_FLIP_CONFIG);
      instance.loadFromHTML(bookRef.current.querySelectorAll(".book-page-wrapper"));
      setTotalPages(instance.getPageCount());

      instance.on("flip", (e: { data: number }) => {
        setCurrentPage(e.data);
      });

      flipRef.current = instance;
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(init, 50);

    return () => {
      clearTimeout(timer);
      if (instance) {
        try { instance.destroy(); } catch { /* ignore */ }
      }
      flipRef.current = null;
      setCurrentPage(0);
    };
  }, [open, bookId]);

  // Keyboard
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      if (e.key === "ArrowRight") flipRef.current?.flipNext();
      else if (e.key === "ArrowLeft") flipRef.current?.flipPrev();
      else if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Touch swipe for mobile
  const touchStartX = useRef(0);
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);
  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 30) {
      if (dx < 0) flipRef.current?.flipNext();
      else flipRef.current?.flipPrev();
    }
  }, []);

  if (!open) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex flex-col bg-black/90 backdrop-blur-lg overflow-hidden"
      onClick={onClose}
      role="dialog"
      aria-label="Book preview"
    >
      {/* Floating Close Button */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Close book preview"
        className="absolute top-4 right-4 sm:top-6 sm:right-6 z-[10000] grid h-10 w-10 sm:h-12 sm:w-12 place-items-center rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-colors"
      >
        <X className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      {/* Floating Buy Button */}
      <div className="absolute bottom-20 sm:bottom-24 left-1/2 -translate-x-1/2 z-[10000]" onClick={(e) => e.stopPropagation()}>
        <a
          href={buyUrl ?? "/books"}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-premium flex items-center justify-center gap-2 rounded-full bg-[#ffd51d] text-black px-6 py-3 sm:px-8 sm:py-3.5 text-sm sm:text-base font-bold shadow-2xl hover:opacity-90 transition-opacity"
        >
          <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
          Buy Now
        </a>
      </div>

      {/* Book area */}
      <div className="flex-1 flex items-center justify-center px-4 py-2 min-h-0" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <div className="relative flex items-center gap-2 sm:gap-3 max-w-5xl w-full">
          {/* Left arrow */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); flipRef.current?.flipPrev(); }}
            disabled={currentPage === 0}
            aria-label="Previous page"
            className="grid h-10 w-10 place-items-center rounded-full border border-white/30 bg-white/10 text-white disabled:opacity-25 hover:bg-white/20 shadow-lg shrink-0"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Book container — St.PageFlip will populate this */}
          <div
            ref={bookRef}
            className="shadow-2xl mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {pages.map((pageProps: PageData, i: number) => (
              <div 
                key={i} 
                className={`book-page-wrapper bg-white ${pageProps.className ?? ""}`} 
                style={pageProps.style}
              >
                <div dangerouslySetInnerHTML={{ __html: pageProps.content }} className="w-full h-full" />
              </div>
            ))}
          </div>

          {/* Right arrow */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); flipRef.current?.flipNext(); }}
            disabled={totalPages > 0 && currentPage >= totalPages - 1}
            aria-label="Next page"
            className="grid h-10 w-10 place-items-center rounded-full border border-white/30 bg-white/10 text-white disabled:opacity-25 hover:bg-white/20 shadow-lg shrink-0"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Page indicator */}
      <div className="hidden sm:flex w-full items-center justify-center gap-6 z-[10000] pb-6 shrink-0" onClick={(e) => e.stopPropagation()}>
        <span className="text-xs font-bold text-white tracking-widest tabular-nums bg-white/10 px-4 py-1.5 rounded-full border border-white/20">
          {totalPages > 0 ? `${currentPage + 1} / ${totalPages}` : ""}
        </span>
      </div>
    </div>
  );

  if (typeof document !== "undefined") {
    return createPortal(modalContent, document.body);
  }
  return modalContent;
}

export function BookViewer(props: Props) {
  return <BookViewerInner {...props} />;
}
