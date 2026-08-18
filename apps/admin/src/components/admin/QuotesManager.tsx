"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Loader2, Pencil, AlertCircle, CheckCircle2 } from "lucide-react";
import { showConfirm } from "@/components/admin/ConfirmDialog";
import { Modal } from "@/components/ui/Modal";

type Quote = {
  id: string;
  text: string;
  tag: string;
};

const inputCls =
  "rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent w-full";

export function QuotesManager() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Quote | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  async function load() {
    try {
      const res = await fetch("/api/admin/quotes");
      if (res.ok) {
        const data = await res.json();
        setQuotes(data.quotes);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function startNew() {
    setEditing({ id: "", text: "", tag: "" });
    setEditingId(null);
    setError("");
    setOk("");
  }

  function startEdit(q: Quote) {
    setEditing({ ...q });
    setEditingId(q.id);
    setError("");
    setOk("");
  }

  function cancelEdit() {
    setEditing(null);
    setEditingId(null);
    setError("");
  }

  async function save() {
    if (!editing || !editing.text.trim() || !editing.tag.trim()) {
      setError("Text and tag are required.");
      return;
    }
    setBusy(true);
    setError("");
    setOk("");
    const payload = {
      ...(editingId ? { id: editingId } : {}),
      text: editing.text.trim(),
      tag: editing.tag.trim(),
    };
    const res = await fetch("/api/admin/quotes", {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      return;
    }
    setEditing(null);
    setEditingId(null);
    setOk(editingId ? "Quote updated successfully." : "Quote added successfully.");
    await load();
  }

  async function remove(id: string) {
    const ok = await showConfirm({
      title: "Delete quote?",
      message: "This removes the quote from your site. This action cannot be undone.",
    });
    if (!ok) return;
    const res = await fetch(`/api/admin/quotes?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setQuotes((q) => q.filter((x) => x.id !== id));
      if (editingId === id) {
        setEditing(null);
        setEditingId(null);
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-sm text-muted-foreground">
          {quotes.length} quote{quotes.length === 1 ? "" : "s"}
        </p>
        {!editing && (
          <button
            onClick={startNew}
            className="ml-auto inline-flex items-center gap-2 rounded-full bg-accent text-accent-foreground px-5 py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add quote
          </button>
        )}
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

      {editing && (
        <Modal
          open
          title={editingId ? "Edit quote" : "New quote"}
          onClose={cancelEdit}
          footer={
            <>
              <button
                type="submit"
                form="quote-form"
                disabled={busy}
                className="inline-flex items-center gap-2 rounded-full bg-accent text-accent-foreground px-5 py-2.5 text-sm font-semibold disabled:opacity-60"
              >
                {busy && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingId ? "Save changes" : "Add quote"}
              </button>
              <button
                type="button"
                onClick={cancelEdit}
                className="flex-1 sm:flex-none rounded-full border border-border px-5 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
            </>
          }
        >
        <form
          id="quote-form"
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium mb-1.5">Text *</label>
            <textarea
              value={editing.text}
              onChange={(e) => setEditing({ ...editing, text: e.target.value })}
              rows={3}
              className={inputCls}
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Tag *</label>
            <input
              value={editing.tag}
              onChange={(e) => setEditing({ ...editing, tag: e.target.value })}
              placeholder="e.g. Work, Life, Focus"
              className={inputCls}
            />
          </div>
        </form>
        </Modal>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : quotes.length === 0 ? (
        <p className="text-sm text-muted-foreground">No quotes yet.</p>
      ) : (
        <ul className="space-y-3">
          {quotes.map((q) => (
            <li
              key={q.id}
              className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4"
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium">“{q.text}”</p>
                <span className="mt-1 inline-block rounded-full bg-accent/15 text-accent px-2 py-0.5 text-xs">
                  {q.tag}
                </span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => startEdit(q)}
                  aria-label="Edit quote"
                  className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => remove(q.id)}
                  aria-label="Delete quote"
                  className="p-2 rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-50"
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