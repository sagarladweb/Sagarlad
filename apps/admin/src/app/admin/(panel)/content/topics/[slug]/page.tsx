import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FileText, Video, Pencil } from "lucide-react";
import { prisma } from "@/lib/db";
import { assertPhase2 } from "@/lib/phase";

export const dynamic = "force-dynamic";

export default async function TopicDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  assertPhase2();
  const { slug } = await params;

  let category: Awaited<ReturnType<typeof getCategory>> = null;
  try {
    category = await getCategory(slug);
  } catch (err) {
    console.warn("[admin topic] DB query failed:", (err as Error).message);
  }

  if (!category) notFound();

  const empty = category.posts.length === 0 && category.videos.length === 0;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center gap-3">
        <Link
          href="/admin/content?tab=topics"
          className="p-2 rounded-full border border-border hover:bg-muted transition-colors"
          aria-label="Back to topics"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="font-display text-2xl font-bold">{category.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {category.posts.length} post{category.posts.length === 1 ? "" : "s"} ·{" "}
            {category.videos.length} video{category.videos.length === 1 ? "" : "s"}
          </p>
        </div>
      </header>

      {empty ? (
        <p className="rounded-2xl border border-border bg-card card-grad p-6 text-sm text-muted-foreground">
          Nothing is assigned to this topic yet. Assign posts or videos from the{" "}
          <Link href="/admin/posts" className="font-semibold text-accent hover:underline">
            Posts
          </Link>{" "}
          or{" "}
          <Link href="/admin/content?tab=videos" className="font-semibold text-accent hover:underline">
            Videos
          </Link>{" "}
          pages.
        </p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="space-y-3">
            <h2 className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wider text-muted-foreground">
              <FileText className="h-4 w-4 text-accent" />
              Posts · {category.posts.length}
            </h2>
            {category.posts.length === 0 ? (
              <p className="rounded-2xl border border-border bg-card card-grad p-5 text-sm text-muted-foreground">
                No posts in this topic yet.
              </p>
            ) : (
              <ul className="space-y-2.5">
                {category.posts.map((p) => (
                  <li
                    key={p.id}
                    className="group flex items-center gap-3 rounded-2xl border border-border bg-card card-grad p-4 transition-shadow hover:shadow-lg"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{p.title}</p>
                      <span
                        className={
                          p.published
                            ? "text-xs text-emerald-600"
                            : "text-xs text-muted-foreground"
                        }
                      >
                        {p.published ? "Published" : "Hidden (draft)"}
                      </span>
                    </div>
                    <Link
                      href={`/admin/posts/${p.slug}/edit`}
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:border-accent hover:text-accent transition-colors"
                    >
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="space-y-3">
            <h2 className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wider text-muted-foreground">
              <Video className="h-4 w-4 text-accent" />
              Videos · {category.videos.length}
            </h2>
            {category.videos.length === 0 ? (
              <p className="rounded-2xl border border-border bg-card card-grad p-5 text-sm text-muted-foreground">
                No videos in this topic yet.
              </p>
            ) : (
              <ul className="space-y-2.5">
                {category.videos.map((v) => (
                  <li
                    key={v.id}
                    className="group flex items-center gap-3 rounded-2xl border border-border bg-card card-grad p-4 transition-shadow hover:shadow-lg"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{v.title}</p>
                      <span
                        className={
                          v.published
                            ? "text-xs text-emerald-600"
                            : "text-xs text-muted-foreground"
                        }
                      >
                        {v.published ? "Published" : "Hidden"}
                      </span>
                    </div>
                    <Link
                      href={`/admin/content?tab=videos&edit=${v.id}`}
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:border-accent hover:text-accent transition-colors"
                    >
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

async function getCategory(slug: string) {
  return prisma.category.findUnique({
    where: { slug },
    include: {
      posts: {
        select: { id: true, title: true, slug: true, published: true },
        orderBy: { createdAt: "desc" },
      },
      videos: {
        select: { id: true, title: true, published: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}
