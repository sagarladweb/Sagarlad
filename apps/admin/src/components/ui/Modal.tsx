"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

export function Modal({
  open,
  title,
  onClose,
  children,
  footer,
  wide,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[140] grid place-items-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-md"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-elevated animate-in zoom-in-95 fade-in-0 duration-200 ${
          wide ? "max-w-3xl" : "max-w-xl"
        }`}
      >
        <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4">
          <h2 className="font-display text-lg font-bold">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-150 active:scale-95"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && (
          <div className="border-t border-border px-5 py-4">{footer}</div>
        )}
      </div>
    </div>
  );
}
