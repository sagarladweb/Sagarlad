import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { JsonLd } from "@/components/JsonLd";
import { SITE, formatDate, pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Terms of Use",
  description: "The rules of the road for using the Sagar Lad website.",
  path: "/terms",
});

export const revalidate = 604800;

export default function TermsPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Terms of Use — Sagar Lad",
          description: "The rules of the road for using the Sagar Lad website.",
          url: `${SITE.url}/terms`,
          author: { "@type": "Person", name: "Sagar Lad", url: SITE.url },
          dateModified: new Date().toISOString(),
        }}
      />
      <PageHeader
        eyebrow="Legal"
        title="Terms of Use"
        subtitle="The rules of the road for using this website."
      />
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-14 space-y-10 text-sm text-muted-foreground leading-relaxed">
        <section>
          <h2 className="font-display text-lg font-bold text-foreground mb-2">1. Content accuracy</h2>
          <p>
            Content on this site, including articles, quotes, opinions and
            investing ideas, is provided for general informational and
            educational purposes only. It is not professional financial, legal,
            medical or investment advice. Always do your own research and
            consult a qualified professional before acting on anything you read
            here.
          </p>
        </section>
        <section>
          <h2 className="font-display text-lg font-bold text-foreground mb-2">2. Intellectual property</h2>
          <p>
            All original content — text, graphics, layouts, audio and branding —
            is the property of Sagar Lad. You are welcome to share and reference
            content with attribution and a link, but may not reproduce it
            commercially or present it as your own without written permission.
          </p>
        </section>
        <section>
          <h2 className="font-display text-lg font-bold text-foreground mb-2">3. Bookings &amp; commercial engagements</h2>
          <p>
            Speaking engagements, workshops, mentorship and other paid services
            are confirmed through separate written agreements. Those agreements
            take precedence over anything stated on this page.
          </p>
        </section>
        <section>
          <h2 className="font-display text-lg font-bold text-foreground mb-2">4. User conduct</h2>
          <p>
            When submitting comments, testimonials, questions or other content,
            you agree not to post unlawful, abusive, defamatory, misleading or
            infringing material. We reserve the right to moderate, edit or
            remove any user content at our discretion.
          </p>
        </section>
        <section>
          <h2 className="font-display text-lg font-bold text-foreground mb-2">5. Limitation of liability</h2>
          <p>
            This site is provided &quot;as is&quot;. We are not liable for any
            loss or damage arising from your use of, or reliance on, the content
            or services offered on this site.
          </p>
        </section>
        <section>
          <h2 className="font-display text-lg font-bold text-foreground mb-2">6. Changes</h2>
          <p>
            We may update these terms from time to time. Continued use of the
            site after changes are posted constitutes acceptance of the updated
            terms.
          </p>
        </section>
        <p className="pt-4 border-t border-border text-xs">
          Last updated: {formatDate(new Date())}
        </p>
      </div>
    </>
  );
}