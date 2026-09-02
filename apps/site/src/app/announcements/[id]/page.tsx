import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Calendar } from "lucide-react";
import { prisma } from "@/lib/db";
import { SITE } from "@/lib/site";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { JsonLd } from "@/components/JsonLd";

export const revalidate = 604800;

function formatDate(dateStr: string | Date) {
  const d = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const announcement = await prisma.announcement
    .findUnique({ where: { id } })
    .catch(() => null);

  if (!announcement || !announcement.active) return {};

  return {
    title: `${announcement.title} | ${SITE.name}`,
    description: announcement.description || `${SITE.name} — ${announcement.title}`,
    openGraph: {
      title: announcement.title,
      description: announcement.description || SITE.description,
      type: "website",
      siteName: SITE.name,
      url: `${SITE.url}/announcements/${announcement.id}`,
      ...(announcement.imageUrl && { images: [{ url: announcement.imageUrl }] }),
    },
    twitter: {
      card: "summary_large_image" as const,
      title: announcement.title,
      description: announcement.description || SITE.description,
      ...(announcement.imageUrl && { images: [announcement.imageUrl] }),
    },
  };
}

export default async function AnnouncementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let announcement;
  try {
    announcement = await prisma.announcement.findUnique({ where: { id } });
  } catch {
    notFound();
  }

  if (!announcement || !announcement.active) notFound();

  const { title, description, imageUrl, buttonText, buttonLink, eventDate } =
    announcement;

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Event",
          name: title,
          description: description || undefined,
          url: `${SITE.url}/announcements/${id}`,
          organizer: {
            "@type": "Person",
            name: SITE.name,
            url: SITE.url,
          },
          ...(imageUrl && { image: imageUrl }),
          ...(eventDate && {
            startDate: new Date(eventDate).toISOString(),
          }),
        }}
      />

      {/* Full-bleed hero — matches homepage/speaking/about pattern */}
      <section
        className="relative -mt-16 min-h-[calc(100svh+4rem)] border-b border-border bg-foreground text-background overflow-hidden"
        aria-label={title}
      >
        {/* Background */}
        <div className="absolute inset-0" aria-hidden="true">
          {imageUrl ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt=""
                className="absolute inset-0 w-full h-full object-cover hero-drift"
              />
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-950 to-black" />
          )}
          {/* Dual gradient overlays — identical to homepage/speaking/about */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-black/10" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/40" />
          {/* Subtle brand glow when no image */}
          {!imageUrl && (
            <div
              className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-20"
              style={{
                background:
                  "radial-gradient(circle, rgba(255,213,29,0.25) 0%, transparent 70%)",
                filter: "blur(80px)",
              }}
            />
          )}
        </div>

        {/* Content — pinned to bottom, same as other heroes */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 min-h-[100svh] flex flex-col justify-end py-12 sm:py-32">
          <div
            className="max-w-3xl text-center sm:text-left mt-auto"
            style={{ display: "grid", gap: "0" }}
          >
            {/* Date eyebrow */}
            {eventDate && (
              <div className="mb-4">
                <span className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-semibold uppercase tracking-[0.25em] text-white/70 border border-white/20 rounded-full px-5 py-1.5">
                  <Calendar className="w-3 h-3" />
                  {formatDate(eventDate)}
                </span>
              </div>
            )}

            {/* Title */}
            <h1 className="mb-6 font-display text-4xl sm:text-5xl md:text-7xl font-bold leading-[1.1] tracking-tight text-white drop-shadow-md">
              {title}
            </h1>

            {/* Description */}
            {description && (
              <p className="mb-10 max-w-xl text-base sm:text-lg text-white/75 leading-relaxed">
                {description}
              </p>
            )}

            {/* CTA */}
            {buttonText && buttonLink && (
              <div>
                <Link
                  href={buttonLink}
                  className="btn-premium inline-flex items-center gap-2 rounded-full bg-accent text-accent-foreground px-8 py-3 text-sm font-semibold"
                >
                  {buttonText}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Related CTA section */}
      <section className="py-20 md:py-28 border-b border-border bg-background">
        <div className="mx-auto max-w-xl px-4 sm:px-6 text-center">
          <p className="btn-premium inline-block text-xs font-semibold uppercase tracking-[0.2em] text-brand bg-brand-light/10 rounded-full px-3.5 py-1">
            Stay Updated
          </p>
          <h2 className="mt-4 font-display text-2xl sm:text-3xl font-bold tracking-tight">
            Don&apos;t miss what&apos;s next
          </h2>
          <p className="mt-4 text-muted-foreground leading-relaxed max-w-md mx-auto">
            Subscribe to the newsletter for announcements, insights, and
            frameworks delivered straight to your inbox.
          </p>
          <div className="mt-8">
            <Link
              href="/newsletter"
              className="btn-premium inline-flex items-center gap-2 rounded-full bg-accent text-accent-foreground px-7 py-3 text-sm font-semibold"
            >
              Subscribe to the Newsletter
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
