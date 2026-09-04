import { SITE, VISIBLE_POST_WHERE } from "@/lib/site";
import { getSiteSocials } from "@/lib/social-links";
import { getCategoriesWithFallback, getFeaturedPostsWithFallback, getActiveAnnouncement } from "@/lib/content";
import { prisma } from "@/lib/db";
import { JsonLd } from "@/components/JsonLd";

import { Hero } from "@/components/home/Hero";
import { FeaturedOn } from "@/components/home/FeaturedOn";
import { AboutMe } from "@/components/home/AboutMe";
import { TopicsGrid } from "@/components/home/TopicsGrid";
import { MindUp } from "@/components/home/MindUp";
import { MindUpBook } from "@/components/home/MindUpBook";
import { BlogPreview } from "@/components/home/BlogPreview";
import { Testimonials } from "@/components/home/Testimonials";
import { MentorshipCta } from "@/components/home/MentorshipCta";
import { NewsletterCta } from "@/components/home/NewsletterCta";
import { SagarGallery } from "@/components/home/SagarGallery";
import { AnnouncementSection } from "@/components/home/AnnouncementSection";
import { AnnouncementPopup } from "@/components/home/AnnouncementPopup";

export const revalidate = 300;

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ announce_preview?: string; id?: string }>;
}) {
  const params = await searchParams;
  const previewMode = params.announce_preview;

  const fetchAnnouncement = params.id
    ? prisma.announcement.findUnique({ where: { id: params.id } }).catch(() => null)
    : getActiveAnnouncement();

  const [posts, socials, allCategories, announcement] = await Promise.all([
    getFeaturedPostsWithFallback(VISIBLE_POST_WHERE, 4),
    getSiteSocials(),
    getCategoriesWithFallback(),
    fetchAnnouncement,
  ]);

  const topicsWithViews = allCategories
    .map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      postCount: (c._count?.posts ?? 0) + (c._count?.videos ?? 0),
    }))
    .sort((a, b) => b.postCount - a.postCount)
    .slice(0, 10);

  if (previewMode === "section") {
    return (
      <div className="min-h-screen bg-background">
        {announcement && <AnnouncementSection announcement={announcement} />}
      </div>
    );
  }

  if (previewMode === "all") {
    return (
      <>
        <Hero />
        <FeaturedOn />
        <AboutMe />
        <TopicsGrid topics={topicsWithViews} />
        <MindUp />
        <MindUpBook />
      <BlogPreview posts={posts} showStats />
        <Testimonials />
        <MentorshipCta />
        <NewsletterCta />
        <SagarGallery />
        {announcement && <AnnouncementSection announcement={announcement} />}
      </>
    );
  }

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Person",
          name: SITE.name,
          url: SITE.url,
          sameAs: socials.map((s) => s.href),
          knowsAbout: ["personal finance", "investing", "career", "data engineering"],
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: SITE.name,
          url: SITE.url,
          potentialAction: {
            "@type": "SearchAction",
            target: {
              "@type": "EntryPoint",
              urlTemplate: `${SITE.url}/blog?q={search_term_string}`,
            },
            "query-input": "required name=search_term_string",
          },
        }}
      />
      <Hero />
      <FeaturedOn />
      <AboutMe />
      <TopicsGrid topics={topicsWithViews} />
      <MindUp />
      <MindUpBook />
      <BlogPreview posts={posts} />
      <Testimonials />
      <MentorshipCta />
      <NewsletterCta />
      <SagarGallery />
      {announcement && <AnnouncementSection announcement={announcement} />}
      {announcement && <AnnouncementPopup announcement={announcement} />}
    </>
  );
}
