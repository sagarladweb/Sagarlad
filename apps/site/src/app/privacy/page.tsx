import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { JsonLd } from "@/components/JsonLd";
import { SITE, formatDate, pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Privacy Policy",
  description: "How we collect, use and protect your information on sagarlad.com.",
  path: "/privacy",
});

export const revalidate = 604800;

export default function PrivacyPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Privacy Policy — Sagar Lad",
          description: "How we collect, use and protect your information on sagarlad.com.",
          url: `${SITE.url}/privacy`,
          author: { "@type": "Person", name: "Sagar Lad", url: SITE.url },
          dateModified: new Date().toISOString(),
        }}
      />
      <PageHeader
        eyebrow="Legal"
        title="Privacy Policy"
        subtitle="How we collect, use and protect your information."
      />
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-14 space-y-10 text-sm text-muted-foreground leading-relaxed">
        <section>
          <h2 className="font-display text-lg font-bold text-foreground mb-2">1. What we collect</h2>
          <p>
            We collect only the information you provide directly — such as your
            name, email address and message when you subscribe to the
            newsletter, post a comment, download an ebook or send a contact
            message. We also collect basic, anonymous usage data to understand
            how the site is used and to keep it fast and reliable.
          </p>
        </section>
        <section>
          <h2 className="font-display text-lg font-bold text-foreground mb-2">2. How we use it</h2>
          <p>
            Your information is used to deliver the newsletter you asked for,
            respond to your enquiries, publish the comments and testimonials you
            choose to share, and improve the experience on this site. We never
            sell, rent or trade your personal data to third parties — full stop.
          </p>
        </section>
        <section>
          <h2 className="font-display text-lg font-bold text-foreground mb-2">3. Cookies &amp; analytics</h2>
          <p>
            We use cookies only where necessary for essential site
            functionality. Anonymous, aggregated analytics help us understand
            which content people find useful; this data cannot be used to
            identify you individually. This site does not serve advertising or
            tracking cookies.
          </p>
        </section>
        <section>
          <h2 className="font-display text-lg font-bold text-foreground mb-2">4. Where data is stored</h2>
          <p>
            Newsletter sign-ups and messages are stored securely and used only
            for the purpose you provided them. Reasonable technical safeguards
            are in place to protect your information, and access is limited to
            what is needed to run this site.
          </p>
        </section>
        <section>
          <h2 className="font-display text-lg font-bold text-foreground mb-2">5. Your rights</h2>
          <p>
            You may unsubscribe from the newsletter at any time using the link
            in any email, and you may contact us to request access to,
            correction of, or deletion of your personal data. We honour these
            requests promptly.
          </p>
        </section>
        <section>
          <h2 className="font-display text-lg font-bold text-foreground mb-2">6. Contact</h2>
          <p>
            For any privacy-related question, or to exercise your rights, please
            reach out through the contact page.
          </p>
        </section>
        <p className="pt-4 border-t border-border text-xs">
          Last updated: {formatDate(new Date())}
        </p>
      </div>
    </>
  );
}