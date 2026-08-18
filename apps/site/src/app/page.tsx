import { prisma, dbSafe } from "@/lib/db";
import { SITE } from "@/lib/site";
import { getSiteSocials } from "@/lib/social-links";
import { JsonLd } from "@/components/JsonLd";
import { Hero } from "@/components/home/Hero";
import { MindUp } from "@/components/home/MindUp";
import { MindUpBook } from "@/components/home/MindUpBook";
import { FeaturedOn } from "@/components/home/FeaturedOn";
import { AboutMe } from "@/components/home/AboutMe";
import { BlogPreview } from "@/components/home/BlogPreview";
import { Testimonials } from "@/components/home/Testimonials";
import { NewsletterCta } from "@/components/home/NewsletterCta";
import { SagarGallery } from "@/components/home/SagarGallery";
import { ScrollAnimations } from "@/components/home/ScrollAnimations";

export const revalidate = 604800;

export default async function HomePage() {
  const [posts, socials] = await Promise.all([
    dbSafe(
      () =>
        prisma.post.findMany({
          where: { published: true },
          include: { category: true },
          orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
          take: 3,
        }),
      []
    ),
    getSiteSocials(),
  ]);

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
      <Hero />
      <FeaturedOn />
      <AboutMe />
      <MindUp />
      <MindUpBook />
      <BlogPreview posts={posts} />
      <Testimonials />
      <NewsletterCta />
      <SagarGallery />
      <ScrollAnimations />
    </>
  );
}