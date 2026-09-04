import { SITE, VISIBLE_POST_WHERE } from "@/lib/site";
import { getSiteSocials } from "@/lib/social-links";
import { getCategories, getFeaturedPosts, getActiveAnnouncement } from "@/lib/content";
import { prisma } from "@/lib/db";
import { JsonLd } from "@/components/JsonLd";
import dynamic from "next/dynamic";

import { Hero } from "@/components/home/Hero";
import { FeaturedOn } from "@/components/home/FeaturedOn";
import { AnnouncementSection } from "@/components/home/AnnouncementSection";
import { AnnouncementPopup } from "@/components/home/AnnouncementPopup";

const AboutMe = dynamic(() => import("@/components/home/AboutMe").then((m) => m.AboutMe));
const TopicsGrid = dynamic(() => import("@/components/home/TopicsGrid").then((m) => m.TopicsGrid));
const MindUp = dynamic(() => import("@/components/home/MindUp").then((m) => m.MindUp));
const MindUpBook = dynamic(() => import("@/components/home/MindUpBook").then((m) => m.MindUpBook));
const BlogPreview = dynamic(() => import("@/components/home/BlogPreview").then((m) => m.BlogPreview));
const Testimonials = dynamic(() => import("@/components/home/Testimonials").then((m) => m.Testimonials));
const MentorshipCta = dynamic(() => import("@/components/home/MentorshipCta").then((m) => m.MentorshipCta));
const NewsletterCta = dynamic(() => import("@/components/home/NewsletterCta").then((m) => m.NewsletterCta));
const SagarGallery = dynamic(() => import("@/components/home/SagarGallery").then((m) => m.SagarGallery));

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
    getFeaturedPosts(VISIBLE_POST_WHERE, 4),
    getSiteSocials(),
    getCategories(),
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
        <BlogPreview posts={posts} />
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
