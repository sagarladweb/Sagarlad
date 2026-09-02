import Link from "next/link";
import type { Metadata } from "next";
import { SITE, pageMetadata } from "@/lib/site";
import { JsonLd } from "@/components/JsonLd";
import { NewsletterSignup } from "@/components/NewsletterSignup";

export const metadata: Metadata = pageMetadata({
  title: "The Sagar Lad Letter",
  description:
    "The Sagar Lad Letter — a free weekly email on money, life and everything in between.",
  path: "/newsletter",
});

export const revalidate = 604800;

export default function NewsletterPage() {
  return (
    <div className="overflow-x-clip">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: SITE.url },
            { "@type": "ListItem", position: 2, name: "Newsletter", item: `${SITE.url}/newsletter` },
          ],
        }}
      />

      <section className="py-20 md:py-28 border-b border-border bg-background">
        <div className="mx-auto max-w-xl px-4 sm:px-6 text-center">
          <p className="btn-premium inline-block text-xs font-semibold uppercase tracking-[0.2em] text-brand bg-brand-light/10 rounded-full px-3.5 py-1">
            Newsletter
          </p>
          <h1 className="mt-4 font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            The Sagar Lad Letter
          </h1>
          <p className="mt-4 text-muted-foreground leading-relaxed max-w-md mx-auto">
            One email a week. No spam, no noise — just the frameworks I use for
            money, work and life.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-20 border-b border-border bg-card/40">
        <div className="mx-auto max-w-lg px-4 sm:px-6">
          <NewsletterSignup />

          <div className="mt-10 text-center">
            <Link
              href="/blog"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4 decoration-border hover:decoration-foreground/40"
            >
              Prefer to just read the blog? Start here →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
