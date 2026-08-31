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
        <div className="relative w-full min-h-[200px] sm:min-h-[280px] lg:min-h-[360px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="relative z-10 flex flex-col justify-end h-full p-6 sm:p-10 lg:p-14 max-w-7xl mx-auto min-h-[200px] sm:min-h-[280px] lg:min-h-[360px]">
            {eventDate && (
              <p className="text-xs sm:text-sm font-medium text-white/80 mb-1">
                {formatDate(eventDate)}
              </p>
            )}
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight max-w-2xl">
              {title}
            </h2>
            {description && (
              <p className="mt-2 text-sm sm:text-base text-white/70 max-w-xl leading-relaxed">
                {description}
              </p>
            )}
            {buttonText && buttonLink && (
              <Link
                href={buttonLink}
                className="inline-flex items-center gap-2 rounded-full bg-white text-foreground px-5 py-2.5 text-sm font-semibold shadow-sm hover:scale-[1.03] transition-transform mt-4 self-start"
              >
                {buttonText}
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14 lg:py-16 text-center">
          {eventDate && (
            <p className="text-sm font-medium text-muted-foreground mb-1">
              {formatDate(eventDate)}
            </p>
          )}
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground leading-tight max-w-2xl mx-auto">
            {title}
          </h2>
          {description && (
            <p className="mt-2 text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
              {description}
            </p>
          )}
          {buttonText && buttonLink && (
            <Link
              href={buttonLink}
              className="inline-flex items-center gap-2 rounded-full bg-accent text-accent-foreground px-5 py-2.5 text-sm font-semibold shadow-sm hover:scale-[1.03] transition-transform mt-5"
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
