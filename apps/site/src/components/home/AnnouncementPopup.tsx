"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X, ExternalLink } from "lucide-react";

type AnnouncementData = {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  buttonText: string | null;
  buttonLink: string | null;
};

const DISMISS_KEY = "announcement-dismissed";

export function AnnouncementPopup({
  announcement,
}: {
  announcement: AnnouncementData;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Don't show if dismissed in this session
    if (sessionStorage.getItem(DISMISS_KEY) === announcement.id) return;
    const timer = setTimeout(() => setOpen(true), 6000);
    return () => clearTimeout(timer);
  }, [announcement.id]);

  function dismiss() {
    setOpen(false);
    sessionStorage.setItem(DISMISS_KEY, announcement.id);
  }

  if (!open) return null;

  const { title, description, imageUrl, buttonText, buttonLink } = announcement;

  return (
    <div
      className="fixed inset-0 z-[9998] flex items-end sm:items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Announcement"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/60 backdrop-blur-sm"
        onClick={dismiss}
      />

      {/* Panel */}
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
        <button
          type="button"
          onClick={dismiss}
          className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-background/80 hover:bg-background text-muted-foreground transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-36 object-cover"
          />
        )}

        <div className="p-5 space-y-3">
          <span className="inline-flex items-center rounded-full bg-accent/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent-strong">
            New Event
          </span>
          <h3 className="font-display text-lg font-bold text-foreground leading-snug">
            {title}
          </h3>
          {description && (
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
              {description}
            </p>
          )}
          {buttonText && buttonLink && (
            <Link
              href={buttonLink}
              onClick={dismiss}
              className="inline-flex items-center gap-2 rounded-full bg-accent text-accent-foreground px-5 py-2.5 text-sm font-bold shadow-sm hover:scale-[1.03] transition-transform mt-1"
            >
              {buttonText}
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
