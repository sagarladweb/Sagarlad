import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { BookLibrary } from "@/components/books/BookLibrary";
import { pageMetadata } from "@/lib/site";
import { getPublishedBooks } from "@/lib/content";

export const metadata: Metadata = pageMetadata({
  title: "eBooks & Guides",
  description:
    "Free and premium eBooks and guides by Sagar Lad on money, careers and productivity.",
  path: "/ebooks",
});

export const revalidate = 604800;

export default async function EbooksPage() {
  // Free eBook file links are never exposed to the client — downloads are gated
  // server-side via POST /api/ebooks/download/[id]. Strip buyUrl here so it
  // cannot leak into the HTML.
  const ebooks = (await getPublishedBooks("EBOOK")).map((b) =>
    b.free ? { ...b, buyUrl: null as string | null } : b
  );

  return (
    <>
      <PageHeader
        eyebrow="eBooks"
        title="Guides you can start today"
        subtitle="Quick, practical reads to help you get moving on money, career and productivity."
      />
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
        {ebooks.length === 0 ? (
          <p className="text-center text-muted-foreground">No eBooks yet.</p>
        ) : (
          <BookLibrary books={ebooks} variant="ebook" />
        )}
      </div>
    </>
  );
}