import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Podcast",
  description:
    "Woice with Sagar Lad — conversations on money, life and everything in between.",
  path: "/podcast",
});

export default function PodcastPage() {
  return (
    <>
      <PageHeader
        eyebrow="Podcast"
        title="Woice with Sagar Lad"
        subtitle="Long-form conversations with people who've done it — founders, creators, athletes and thinkers."
      />
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-16 text-center">
        <div className="rounded-3xl border border-border bg-card p-8 sm:p-12">
          <p className="text-5xl">🎙️</p>
          <h2 className="mt-4 font-display text-2xl font-bold">
            Coming soon to this site
          </h2>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
            The podcast episodes and show notes are being moved here. Meanwhile,
            you can find every episode on your favourite podcast app.
          </p>
          <div className="mt-6 flex justify-center gap-3 flex-wrap">
            <span className="rounded-full border border-border px-5 py-2 text-sm font-medium">
              Spotify
            </span>
            <span className="rounded-full border border-border px-5 py-2 text-sm font-medium">
              Apple Podcasts
            </span>
            <span className="rounded-full border border-border px-5 py-2 text-sm font-medium">
              YouTube
            </span>
          </div>
        </div>
      </div>
    </>
  );
}