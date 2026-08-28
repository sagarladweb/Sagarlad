import type { Metadata } from "next";
import Image from "next/image";
import { SITE, pageMetadata } from "@/lib/site";
import { JsonLd } from "@/components/JsonLd";
import { MentorshipClient } from "./MentorshipClient";

export const metadata: Metadata = pageMetadata({
  title: "Mentorship",
  description:
    "Book a 1:1 mentorship session with Sagar Lad — career guidance, portfolio reviews and honest advice.",
  path: "/mentorship",
});

export const revalidate = 604800;

export default function MentorshipPage() {
  return (
    <div className="bg-background overflow-x-clip">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: SITE.url },
            { "@type": "ListItem", position: 2, name: "Mentorship", item: `${SITE.url}/mentorship` },
          ],
        }}
      />
      <MentorshipClient />
    </div>
  );
}
