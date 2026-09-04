import { getPublishedBooks } from "@/lib/content";
import { BookCarousel, type BookCarouselBook } from "./BookCarousel";

// Reader-facing copy for the flagship MIND UP book
const READER_DESCRIPTION = [
  "If you feel stuck, overthinking every decision, or exhausted from fighting your own thoughts — this book was written for you.",
  "You'll learn the one simple shift to stop resisting your mind and start aligning with it. In a few hours, you'll see stress, relationships, work and self-doubt differently.",
  "No overnight transformation. Just one unshakable mindset.",
].join("\n");

export async function MindUpBook() {
  const books = await getPublishedBooks("PUBLISHED");

  const slides: BookCarouselBook[] = books
    .filter((b) => /mind up/i.test(b.title) || /foundry/i.test(b.title))
    .sort((a, b) => (/mind up/i.test(a.title) ? -1 : /mind up/i.test(b.title) ? 1 : 0))
    .map((b) => ({
      id: b.id,
      title: b.title,
      tagline: b.tagline,
      imageUrl: b.imageUrl,
      buyUrl: b.buyUrl,
      description: /mind up/i.test(b.title) ? READER_DESCRIPTION : b.description,
      author: b.author,
    }));

  if (!slides.length) {
    return (
      <section
        className="relative overflow-hidden border-b border-border bg-background"
        aria-label="Featured books"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24 text-center">
          <p className="text-muted-foreground">Loading featured books…</p>
        </div>
      </section>
    );
  }

  return (
    <section
      className="relative overflow-hidden border-b border-border bg-background"
      aria-label="Featured books"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24">
        <BookCarousel books={slides} />
      </div>
    </section>
  );
}
