import type { Metadata } from "next";
import { SITE, pageMetadata } from "@/lib/site";
import { getSiteSocials } from "@/lib/social-links";
import { SocialsGrid } from "@/components/socials/SocialsGrid";
import { JsonLd } from "@/components/JsonLd";

export const metadata: Metadata = pageMetadata({
  title: "Social Links",
  description: "Find Sagar Lad across all social platforms.",
  path: "/socials",
});

export default async function SocialsPage() {
  const socials = await getSiteSocials();

  return (
    <div className="overflow-x-clip">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: SITE.url },
            { "@type": "ListItem", position: 2, name: "Socials", item: `${SITE.url}/socials` },
          ],
        }}
      />
      <section className="border-b border-border bg-background py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-brand">
            Follow Sagar
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
            Find me <span className="text-brand">everywhere.</span>
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto">
            All the places you can connect, follow, and stay in touch.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 sm:px-6 py-12 md:py-16">
        <SocialsGrid socials={socials} />
      </section>
    </div>
  );
}
