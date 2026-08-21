import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { FaYoutube, FaInstagram } from "react-icons/fa6";
import { pageMetadata } from "@/lib/site";
import { getPublishedVideos } from "@/lib/content";
import { VideoFeed } from "@/components/video/VideoFeed";

export const metadata: Metadata = pageMetadata({
  title: "Videos",
  description:
    "Watch Sagar Lad's videos on money, career, relationships and life lessons.",
  path: "/videos",
});

export const revalidate = 604800;

const PAGE_SIZE = 12;

export default async function VideosPage() {
  const videos = await getPublishedVideos(PAGE_SIZE);

  return (
    <div className="overflow-x-clip">
      <PageHeader
        eyebrow="Videos"
        title="Learn by watching"
        subtitle="New videos every week on YouTube — money, careers, life and everything in between. Reels and clips play right here, in-page."
      />
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 space-y-16">
        <section>
          <h2 className="mb-6 flex items-center gap-2 text-lg font-bold">
            <FaYoutube className="w-5 h-5 text-red-600" /> Videos
          </h2>
          <VideoFeed initial={videos} masonry />
        </section>

        <div className="rounded-2xl bg-foreground text-background p-8 sm:p-12 text-center">
          <h2 className="font-display text-2xl sm:text-3xl font-bold">
            Subscribe for the full library
          </h2>
          <p className="mt-3 text-background/70 text-sm max-w-lg mx-auto">
            New videos every week on money, careers and life.
          </p>
          <div className="mt-6 flex justify-center gap-3 flex-wrap">
            <a
              href="https://www.youtube.com/@Sagarlad692"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-accent text-accent-foreground px-6 py-3 text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              <FaYoutube className="w-4 h-4" /> Subscribe on YouTube
            </a>
            <a
              href="https://www.instagram.com/grow_with__sagar/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-background/30 px-6 py-3 text-sm font-semibold hover:bg-background/10 transition-colors"
            >
              <FaInstagram className="w-4 h-4" /> Follow on Instagram
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}