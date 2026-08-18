import { getPublishedBooks } from "@/lib/content";
import { BookCarousel, type BookCarouselBook } from "./BookCarousel";
import { BookStats } from "./BookStats";

// Reader-facing copy for the flagship MIND UP book — written in second person
// so it speaks directly to the person about to read it.
const READER_DESCRIPTION = [
  "If you feel stuck, overthinking every decision, or exhausted from fighting your own thoughts — this book was written for you.",
  "You'll learn the one simple shift to stop resisting your mind and start aligning with it. In a few hours, you'll see stress, relationships, work and self-doubt differently.",
  "No overnight transformation. Just one unshakable mindset.",
].join("\n");

export async function MindUpBook() {
  const books = await getPublishedBooks("PUBLISHED");

  // Homepage carousel: the flagship MIND UP Theory book plus the AI Foundry
  // book. If either is missing, fall back to all published books so the
  // section never renders empty.
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
    }));

  if (!slides.length) return null;

  return (
    <section
      className="relative overflow-hidden border-b border-border bg-background"
      aria-label="Featured books"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-24">
        <BookCarousel books={slides} />
      </div>

      {/* Author Stats Bar */}
      <div className="border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-14">
          <BookStats />
        </div>
      </div>
    </section>
  );
}
