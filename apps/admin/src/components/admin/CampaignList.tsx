"use client";

import { useState } from "react";
import { FileText, Pencil, Trash2, Loader2 } from "lucide-react";
import Link from "next/link";
import { showConfirm } from "@/components/admin/ConfirmDialog";

type Campaign = {
  id: string;
  subject: string;
  createdAt: string;
  draft: boolean;
  sent: number;
  total: number;
};

export function CampaignList({ campaigns }: { campaigns: Campaign[] }) {
  const [items, setItems] = useState(campaigns);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete(id: string, subject: string) {
    const ok = await showConfirm({
      title: "Delete campaign",
      message: `Delete "${subject || "Untitled"}"? This cannot be undone.`,
      confirmLabel: "Delete",
    });
    if (!ok) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/newsletter?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      if (res.ok) {
        setItems((prev) => prev.filter((c) => c.id !== id));
      } else {
        setError("Failed to delete campaign.");
      }
    } catch {
      setError("Network error — try again.");
    } finally {
      setDeleting(null);
    }
  }

  return (
    <>
      {error && (
        <div className="mb-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 flex items-center justify-between">
          <span>{error}</span>
          <button type="button" onClick={() => setError(null)} className="text-xs underline">Dismiss</button>
        </div>
      )}

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border px-6 py-10 text-center">
          <FileText className="mx-auto h-8 w-8 text-muted-foreground/40" />
          <p className="mt-3 text-sm text-muted-foreground">
            No campaigns yet. Send your first newsletter!
          </p>
          <Link
            href="/admin/newsletter/compose"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline"
          >
            <Pencil className="w-3.5 h-3.5" />
            Compose now
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-border rounded-xl border border-border bg-card">
          {items.map((c) => (
            <li key={c.id} className="flex items-center gap-4 px-5 py-3">
              <FileText className="w-4 h-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{c.subject || "Untitled"}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {new Date(c.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
              {c.draft ? (
                <Link href={`/admin/newsletter/compose?draft=${c.id}`}
                  className="shrink-0 inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition-colors">
                  <Pencil className="w-2.5 h-2.5" />
                  Draft
                </Link>
              ) : (
                <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                  {c.sent}/{c.total}
                </span>
              )}
              <button
                type="button"
                onClick={() => handleDelete(c.id, c.subject)}
                disabled={deleting === c.id}
                className="shrink-0 p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors disabled:opacity-40"
                title="Delete campaign"
              >
                {deleting === c.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
