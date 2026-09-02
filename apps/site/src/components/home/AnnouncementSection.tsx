"use client";

import Link from "next/link";
import { ArrowRight, Calendar } from "lucide-react";

type AnnouncementData = {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  buttonText: string | null;
  buttonLink: string | null;
  eventDate: string | Date | null;
};

function formatDate(dateStr: string | Date) {
  const d = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function AnnouncementSection({
  announcement,
}: {
  announcement: AnnouncementData;
}) {
  const { id, title, description, imageUrl, buttonText, buttonLink, eventDate } =
    announcement;

  return (
    <Link
      href={`/announcements/${id}`}
      className="group block border-b border-border bg-background"
    >
      <section className="relative overflow-hidden">
        {imageUrl ? (
          <div className="relative w-full min-h-[240px] sm:min-h-[320px] lg:min-h-[420px] transition-transform duration-700 group-hover:scale-[1.01]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {/* Premium gradient overlays — matches hero pattern */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent transition-opacity duration-500 group-hover:from-black/90" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />

            <div className="relative z-10 flex flex-col justify-end h-full p-6 sm:p-10 lg:p-14 max-w-7xl mx-auto min-h-[240px] sm:min-h-[320px] lg:min-h-[420px]">
              {eventDate && (
                <span className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-white/70 border border-white/20 rounded-full px-4 py-1.5 mb-3 self-start">
                  <Calendar className="w-3 h-3" />
                  {formatDate(eventDate)}
                </span>
              )}
              <h2 className="font-display text-2xl sm:text-3xl lg:text-5xl font-bold text-white leading-tight max-w-2xl drop-shadow-md">
                {title}
              </h2>
              {description && (
                <p className="mt-3 text-sm sm:text-base text-white/70 max-w-xl leading-relaxed">
                  {description}
                </p>
              )}
              <div className="mt-5 flex items-center gap-3">
                {buttonText && buttonLink ? (
                  <span
                    className="inline-flex items-center gap-2 rounded-full bg-accent text-accent-foreground px-5 py-2.5 text-sm font-semibold shadow-sm group-hover:scale-[1.03] transition-transform"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {buttonText}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/90 text-foreground px-5 py-2.5 text-sm font-semibold shadow-sm group-hover:bg-white transition-colors">
                    Learn more
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14 lg:py-16 text-center group-hover:py-12 lg:group-hover:py-18 transition-all duration-500">
            {eventDate && (
              <span className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-brand bg-brand/5 border border-brand/10 rounded-full px-4 py-1.5 mb-3">
                <Calendar className="w-3 h-3" />
                {formatDate(eventDate)}
              </span>
            )}
            <h2 className="font-display text-2xl sm:text-3xl lg:text-5xl font-bold text-foreground leading-tight max-w-2xl mx-auto">
              {title}
            </h2>
            {description && (
              <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
                {description}
              </p>
            )}
            <div className="mt-5">
              {buttonText && buttonLink ? (
                <span
                  className="inline-flex items-center gap-2 rounded-full bg-accent text-accent-foreground px-5 py-2.5 text-sm font-semibold shadow-sm group-hover:scale-[1.03] transition-transform"
                  onClick={(e) => e.stopPropagation()}
                >
                  {buttonText}
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground group-hover:border-accent/50 group-hover:bg-accent/5 transition-colors">
                  Learn more
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              )}
            </div>
          </div>
        )}
      </section>
    </Link>
  );
}
