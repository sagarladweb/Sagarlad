import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Film, FileText } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { pageMetadata } from "@/lib/site";
import { getCategories } from "@/lib/content";

export const metadata: Metadata = pageMetadata({
  title: "Content",
  description:
    "Browse Sagar Lad's content by topic — habits, confidence, happiness, money and more. Videos and articles in one place.",
  path: "/content",
});

export const revalidate = 604800;

export default async function ContentPage() {
  const categories = await getCategories();

  return (
    <>
      <PageHeader
        eyebrow="Content"
        title="Learn by topic"
        subtitle="Pick a topic you want to work on — every category brings together the videos and articles that cover it."
      />
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
        {categories.length === 0 ? (
          <p className="text-muted-foreground text-sm">Content coming soon.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/content/${c.slug}`}
                className="group rounded-2xl border border-border bg-card p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-0.5"
              >
                <div>
                  <span className="inline-flex w-11 h-11 items-center justify-center rounded-xl bg-brand-light/15 text-brand mb-4">
                    <span className="w-2 h-2 rounded-full bg-brand-light" aria-hidden="true" />
                  </span>
                  <h2 className="font-display text-xl font-bold group-hover:text-brand transition-colors">
                    {c.name}
                  </h2>
                  <p className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" />{" "}
                      {c._count.posts} article{c._count.posts === 1 ? "" : "s"}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Film className="w-3.5 h-3.5" />{" "}
                      {c._count.videos} video{c._count.videos === 1 ? "" : "s"}
                    </span>
                  </p>
                </div>
                <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-accent-strong">
                  Explore{" "}
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
