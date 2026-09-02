"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { AnnouncementSection } from "./AnnouncementSection";

type AnnouncementData = {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  buttonText: string | null;
  buttonLink: string | null;
  eventDate: string | Date | null;
};

const DISMISS_KEY = "announcement-dismissed";

export function AnnouncementPopup({
  announcement,
}: {
  announcement: AnnouncementData;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (sessionStorage.getItem(DISMISS_KEY) === announcement.id) {
      document.documentElement.dataset.announcementActive = 'false';
      return;
    }
    
    // Signal that announcement is active to pause other popups
    document.documentElement.dataset.announcementActive = 'true';
    window.dispatchEvent(new CustomEvent('announcementInit'));

    // Show after 8 seconds
    const timer = setTimeout(() => setOpen(true), 8000);
    return () => clearTimeout(timer);
  }, [announcement.id]);

  function dismiss(e?: React.MouseEvent) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setOpen(false);
    sessionStorage.setItem(DISMISS_KEY, announcement.id);
    document.documentElement.dataset.announcementActive = 'false';
    window.dispatchEvent(new CustomEvent('announcementClosed'));
  }

  if (!open || !mounted) return null;

  const content = (
    <div
      className="fixed inset-0 z-[9999] grid place-items-center p-4"
      role="dialog"
      aria-label="Announcement"
    >
      <div className="absolute inset-0 bg-black/60" />

      <div className="relative w-full max-w-[420px] rounded-xl border border-border/80 bg-card/95 shadow-2xl shadow-black/15 overflow-hidden animate-in zoom-in-95 duration-300">
        <button
          type="button"
          onClick={dismiss}
          className="absolute top-3 right-3 z-[100] p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div onClick={dismiss}>
          <AnnouncementSection announcement={announcement} />
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
