"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Trash2,
  Loader2,
  Pencil,
  AlertCircle,
  CheckCircle2,
  ArrowUpRight,
} from "lucide-react";
import { showConfirm } from "@/components/admin/ConfirmDialog";
import { Modal } from "@/components/ui/Modal";

type CategoryItem = { id: string; title: string };

type Category = {
  id: string;
  name: string;
  slug: string;
  _count: { posts: number; videos: number };
  posts: CategoryItem[];
  videos: CategoryItem[];
};

const inputCls =
  "rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent w-full";

export function ContentManager() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [busy, setBusy] = useState(false);
  const [modal, setModal] = useState<{ id: string | null; name: string } | null>(
    null
  );

  async function load() {
    try {
      const res = await fetch("/api/admin/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!modal) return;
    const name = modal.name.trim();
    if (!name) return;
    setBusy(true);
    setError("");
    setOk("");
    const res = await fetch("/api/admin/categories", {
      method: modal.id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(modal.id ? { id: modal.id, name } : { name }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (res.ok) {
      setModal(null);
      setOk(modal.id ? "Topic renamed." : "Topic added. It now shows in the header Content menu.");
      await load();
    } else {
      setError(data.error ?? "Could not save topic.");
    }
  }

  async function remove(c: Category) {
    const label = c._count.posts + c._count.videos;
    const confirmMsg =
      label > 0
        ? `"${c.name}" has ${c._count.posts} post${c._count.posts === 1 ? "" : "s"} and ${c._count.videos} video${c._count.videos === 1 ? "" : "s"}. Deleting it removes the topic link but keeps the posts.`
        : `Delete "${c.name}"?`;
    const ok = await showConfirm({
      title: "Delete topic?",
      message: confirmMsg,
    });
    if (!ok) return;
    const res = await fetch(`/api/admin/categories?id=${c.id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setOk(`Topic "${c.name}" deleted.`);
      await load();
    } else {
      setError("Could not delete topic.");
    }
  }

  const openModal = (c: { id: string | null; name: string }) => {
    setModal(c);
    setError("");
    setOk("");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {categories.length} topic{categories.length === 1 ? "" : "s"} in the
          Content menu
        </p>
        <button
          onClick={() => openModal({ id: null, name: "" })}
          className="inline-flex shrink-0 items-center gap-2 rounded-full bg-accent text-accent-foreground px-5 py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add topic
        </button>
      </div>

      {error && (
        <p className="flex items-center gap-1.5 text-sm text-red-600" role="alert">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </p>
      )}
      {ok && (
        <p className="flex items-center gap-1.5 text-sm text-emerald-600" role="status">
          <CheckCircle2 className="w-4 h-4 shrink-0" /> {ok}
        </p>
      )}

      {modal && (
        <Modal
          open
          title={modal.id ? "Rename topic" : "Add topic"}
          onClose={() => setModal(null)}
          footer={
            <>
              <button
                type="submit"
                form="topic-form"
                disabled={busy || !modal.name.trim()}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-accent text-accent-foreground px-5 py-2.5 text-sm font-semibold disabled:opacity-60"
              >
                {busy && <Loader2 className="w-4 h-4 animate-spin" />}
                {modal.id ? "Save" : "Add topic"}
              </button>
              <button
                type="button"
                onClick={() => setModal(null)}
                className="flex-1 sm:flex-none rounded-full border border-border px-5 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
            </>
          }
        >
          <form id="topic-form" onSubmit={save} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Topic name
              </label>
              <input
                value={modal.name}
                onChange={(e) => setModal({ ...modal, name: e.target.value })}
                placeholder="e.g. Investing"
                className={inputCls}
                autoFocus
              />
            </div>
          </form>
        </Modal>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : categories.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No topics yet. Add one above to show it in the header Content menu.
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((c) => (
            <li key={c.id} className="group relative">
              <button
                type="button"
                onClick={() => router.push(`/admin/content/topics/${c.slug}`)}
                aria-label={`View content in ${c.name}`}
                className="flex h-full w-full flex-col gap-3 rounded-2xl border border-border bg-card card-grad p-4 text-left transition-shadow hover:shadow-lg"
              >
                <div className="flex items-start justify-between">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent/15 text-accent font-display font-bold text-lg">
                    {c.name.charAt(0)}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                    {c._count.posts + c._count.videos} item
                    {c._count.posts + c._count.videos === 1 ? "" : "s"}
                    <ArrowUpRight className="h-3 w-3" />
                  </span>
                </div>
                <div>
                  <p className="truncate font-medium">{c.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {c._count.posts} post{c._count.posts === 1 ? "" : "s"} ·{" "}
                    {c._count.videos} video{c._count.videos === 1 ? "" : "s"}
                  </p>
                </div>
              </button>
              <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  onClick={() => openModal({ id: c.id, name: c.name })}
                  aria-label={`Rename topic ${c.name}`}
                  className="rounded-lg border border-border bg-background p-1.5 text-muted-foreground shadow-sm hover:text-foreground transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => remove(c)}
                  aria-label={`Delete topic ${c.name}`}
                  className="rounded-lg border border-border bg-background p-1.5 text-muted-foreground shadow-sm hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
