import Link from "next/link";
import { ExternalLink } from "lucide-react";

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
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function AnnouncementSection({
  announcement,
}: {
  announcement: AnnouncementData;
}) {
  const { title, description, imageUrl, buttonText, buttonLink, eventDate } = announcement;

  return (
    <section className="relative overflow-hidden border-b border-border bg-background">
      {imageUrl ? (
        <div className="relative w-full min-h-[240px] sm:min-h-[320px] lg:min-h-[400px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="relative z-10 flex flex-col justify-end h-full p-6 sm:p-10 lg:p-14 max-w-7xl mx-auto min-h-[240px] sm:min-h-[320px] lg:min-h-[400px]">
            <span className="inline-flex items-center rounded-full bg-accent px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-accent-foreground mb-3 self-start">
              New Event
            </span>
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight max-w-2xl">
              {title}
            </h2>
            {eventDate && (
              <p className="mt-2 text-xs sm:text-sm font-medium text-white/90">
                {formatDate(eventDate)}
              </p>
            )}
            {description && (
              <p className="mt-3 text-sm sm:text-base text-white/80 max-w-xl leading-relaxed">
                {description}
              </p>
            )}
            {buttonText && buttonLink && (
              <Link
                href={buttonLink}
                className="inline-flex items-center gap-2 rounded-full bg-accent text-accent-foreground px-6 py-3 text-sm font-bold shadow-sm hover:scale-[1.03] transition-transform mt-5 self-start"
              >
                {buttonText}
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-20 text-center">
          <span className="inline-flex items-center rounded-full bg-accent/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-accent-strong mb-4">
            New Event
          </span>
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground leading-tight max-w-2xl mx-auto">
            {title}
          </h2>
          {eventDate && (
            <p className="mt-2 text-sm font-medium text-muted-foreground">
              {formatDate(eventDate)}
            </p>
          )}
          {description && (
            <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
              {description}
            </p>
          )}
          {buttonText && buttonLink && (
            <Link
              href={buttonLink}
              className="inline-flex items-center gap-2 rounded-full bg-accent text-accent-foreground px-6 py-3 text-sm font-bold shadow-sm hover:scale-[1.03] transition-transform mt-6"
            >
              {buttonText}
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      )}
    </section>
  );
}
