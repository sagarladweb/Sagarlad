import { prisma, dbSafe } from "@/lib/db";
import { SITE, VISIBLE_POST_WHERE } from "@/lib/site";
import { getSiteSocials } from "@/lib/social-links";
import { getCategories } from "@/lib/content";
import { JsonLd } from "@/components/JsonLd";
import dynamic from "next/dynamic";
import type { Post, Category } from "@sagarlad/db";

import { Hero } from "@/components/home/Hero";
import { FeaturedOn } from "@/components/home/FeaturedOn";
import { RssBanner } from "@/components/RssBanner";

const AboutMe = dynamic(() => import("@/components/home/AboutMe").then((m) => m.AboutMe));
const TopicsGrid = dynamic(() => import("@/components/home/TopicsGrid").then((m) => m.TopicsGrid));
const MindUp = dynamic(() => import("@/components/home/MindUp").then((m) => m.MindUp));
const MindUpBook = dynamic(() => import("@/components/home/MindUpBook").then((m) => m.MindUpBook));
const BlogPreview = dynamic(() => import("@/components/home/BlogPreview").then((m) => m.BlogPreview));
const Testimonials = dynamic(() => import("@/components/home/Testimonials").then((m) => m.Testimonials));
const MentorshipCta = dynamic(() => import("@/components/home/MentorshipCta").then((m) => m.MentorshipCta));
const NewsletterCta = dynamic(() => import("@/components/home/NewsletterCta").then((m) => m.NewsletterCta));
const SagarGallery = dynamic(() => import("@/components/home/SagarGallery").then((m) => m.SagarGallery));

export const revalidate = 604800;

export default async function HomePage() {
  const [posts, socials, allCategories] = await Promise.all([
    dbSafe(
      () =>
        prisma.post.findMany({
          where: VISIBLE_POST_WHERE,
          include: { category: true },
          orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
          take: 4,
        }) as Promise<(Post & { category: Category | null })[]>,
      []
    ),
    getSiteSocials(),
    getCategories(),
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
      <RssBanner />
    </>
  );
}
