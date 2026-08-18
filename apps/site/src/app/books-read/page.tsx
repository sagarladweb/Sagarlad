import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { BookLibrary } from "@/components/books/BookLibrary";
import { pageMetadata } from "@/lib/site";
import { getPublishedBooks } from "@/lib/content";

export const metadata: Metadata = pageMetadata({
  title: "Books I've Read",
  description:
    "A running list of the books that have shaped my thinking — with the one clear lesson each one left me with.",
  path: "/books-read",
});

export const revalidate = 604800;

export default async function BooksReadPage() {
  const books = await getPublishedBooks("READ");

  return (
    <>
      <PageHeader
        eyebrow="Books I read"
        title="What's on my shelf"
        subtitle="Books that changed how I think — and the one clear lesson each one left me with."
      />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
        {books.length === 0 ? (
          <p className="text-center text-muted-foreground">No books yet.</p>
        ) : (
          <BookLibrary books={books} variant="read" />
        )}

        <div className="mt-12 flex justify-center">
          <Link
            href="/books"
            className="inline-flex items-center gap-1.5 text-sm font-semibold hover:underline underline-offset-4"
          >
            Want books I&apos;ve written? Browse them <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </>
  );
}