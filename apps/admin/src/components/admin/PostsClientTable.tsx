"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Search, Trash2, Eye, ExternalLink, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { showToast } from "@/components/admin/Toast";
import { showConfirm } from "@/components/admin/ConfirmDialog";
import { SITE } from "@/lib/site";

type PostItem = {
  id: string;
  slug: string;
  title: string;
  published: boolean;
  views: number;
  category: { name: string } | null;
};

export function PostsClientTable({ initialPosts }: { initialPosts: PostItem[] }) {
  const router = useRouter();
  const [posts, setPosts] = useState<PostItem[]>(initialPosts);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");
  const [page, setPage] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const PER_PAGE = 15;

  const filteredPosts = posts.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === "all"
        ? true
        : filter === "published"
        ? p.published
        : !p.published;
    return matchesSearch && matchesFilter;
  });

  const pageCount = Math.max(1, Math.ceil(filteredPosts.length / PER_PAGE));
  const current = Math.min(page, pageCount);
  const pagedPosts = filteredPosts.slice((current - 1) * PER_PAGE, current * PER_PAGE);

  async function handleDelete(id: string, title: string) {
    const ok = await showConfirm({
      title: "Delete post?",
      message: `Are you sure you want to delete "${title}"? This action cannot be undone.`,
    });
    if (!ok) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/posts?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setPosts((prev) => prev.filter((p) => p.id !== id));
        showToast("Post deleted successfully", undefined, "info");
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        showToast("Failed to delete post", data.error ?? "Error occurred", "error");
      }
    } catch {
      showToast("Network error", "Could not delete post.", "error");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Posts</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {posts.length} {posts.length === 1 ? "post" : "posts"} total.
          </p>
        </div>
        <Link
          href="/admin/posts/new"
          className="inline-flex items-center gap-2 rounded-full bg-accent text-accent-foreground px-5 py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity self-start sm:self-auto shadow-sm"
        >
          <Plus className="w-4 h-4" /> New post
        </Link>
      </header>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search posts..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl border border-border bg-muted/40 self-start sm:self-auto">
          <button
            onClick={() => {
              setFilter("all");
              setPage(1);
            }}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              filter === "all"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            All ({posts.length})
          </button>
          <button
            onClick={() => {
              setFilter("published");
              setPage(1);
            }}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              filter === "published"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Published ({posts.filter((p) => p.published).length})
          </button>
          <button
            onClick={() => {
              setFilter("draft");
              setPage(1);
            }}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              filter === "draft"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Drafts ({posts.filter((p) => !p.published).length})
          </button>
        </div>
      </div>

      {filteredPosts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
          <p>{posts.length === 0 ? "No posts yet." : "No matching posts found."}</p>
          {posts.length === 0 && (
            <Link href="/admin/posts/new" className="mt-2 inline-block text-accent font-medium">
              Create your first post →
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-card card-grad shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-muted/60 text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
              <tr>
                <th className="px-4 py-3 font-semibold">Title</th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Views</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {pagedPosts.map((p) => (
                <tr key={p.id} className="hover:bg-muted/40 transition-colors">
                  <td className="px-4 py-3 font-medium max-w-xs truncate text-foreground">
                    {p.title}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {p.category?.name ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        p.published
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {p.published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {p.views.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/posts/${p.slug}/edit`}
                        className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs font-medium hover:bg-accent hover:text-accent-foreground hover:border-accent transition-all"
                      >
                        <Pencil className="w-3 h-3" /> Edit
                      </Link>
                      <Link
                        href={`${SITE.url}/blog/${p.slug}`}
                        target="_blank"
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        title="Preview post"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        onClick={() => handleDelete(p.id, p.title)}
                        disabled={deletingId === p.id}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                        title="Delete post"
                      >
                        {deletingId === p.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pageCount > 1 && (
        <nav aria-label="Pagination" className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={current <= 1}
            aria-label="Previous page"
            className="inline-flex items-center gap-1 rounded-full border border-border px-4 py-2 text-sm font-semibold transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>
          <span className="text-sm text-muted-foreground">
            Page {current} of {pageCount}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
            disabled={current >= pageCount}
            aria-label="Next page"
            className="inline-flex items-center gap-1 rounded-full border border-border px-4 py-2 text-sm font-semibold transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </nav>
      )}
    </div>
  );
}
