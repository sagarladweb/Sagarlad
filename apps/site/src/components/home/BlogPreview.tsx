import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Pill } from "@/components/ui/Pill";
import { BlogCard } from "@/components/blog/BlogCard";

type FeaturedPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  publishedAt: Date | string;
  category: { id: string; name: string; slug: string } | null;
};

export function BlogPreview({
  posts,
}: {
  posts: FeaturedPost[];
}) {
  return (
    <section className="py-16 md:py-24 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 text-center sm:text-left" suppressHydrationWarning>
           <div data-animate="left" suppressHydrationWarning>
            <Pill>The Blog</Pill>
            <h2 className="mt-3 font-display text-3xl md:text-4xl font-bold">
              Recent writing
            </h2>
          </div>
        </div>

        <div data-animate="right" suppressHydrationWarning className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {posts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>

        {/* View More Button redirecting to blogs page */}
        <div className="mt-12 text-center">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent-strong hover:underline underline-offset-4 transition-colors"
          >
            View More
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
