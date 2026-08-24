"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Pencil } from "lucide-react";
import { showConfirm } from "@/components/admin/ConfirmDialog";
import { showToast } from "@/components/admin/Toast";
import { Modal } from "@/components/ui/Modal";
import { Button, IconButton } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { inputCls } from "@/components/ui/Input";

type Quote = {
  id: string;
  text: string;
  tag: string;
};

export function QuotesManager() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Quote | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

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
  }

  function startEdit(q: Quote) {
    setEditing({ ...q });
    setEditingId(q.id);
  }

  function cancelEdit() {
    setEditing(null);
    setEditingId(null);
  }

  async function save() {
    if (!editing || !editing.text.trim() || !editing.tag.trim()) {
      showToast("Text and tag are required.", undefined, "error");
      return;
    }
    setBusy(true);
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
      showToast(data.error ?? "Something went wrong.", undefined, "error");
      return;
    }
    setEditing(null);
    setEditingId(null);
    showToast(editingId ? "Quote updated successfully." : "Quote added successfully.");
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
          <Button onClick={startNew} className="ml-auto">
            <Plus className="w-4 h-4" /> Add quote
          </Button>
        )}
      </div>

      {editing && (
        <Modal
          open
          title={editingId ? "Edit quote" : "New quote"}
          onClose={cancelEdit}
          footer={
            <>
              <Button type="submit" form="quote-form" disabled={busy} loading={busy}>
                {editingId ? "Save changes" : "Add quote"}
              </Button>
              <Button type="button" variant="secondary" onClick={cancelEdit} className="flex-1 sm:flex-none">
                Cancel
              </Button>
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
              className="flex items-center gap-4 rounded-2xl border border-border bg-card card-grad p-4"
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium">&ldquo;{q.text}&rdquo;</p>
                <Badge variant="accent" className="mt-1">{q.tag}</Badge>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <IconButton onClick={() => startEdit(q)} title="Edit quote">
                  <Pencil className="w-4 h-4" />
                </IconButton>
                <IconButton variant="danger" onClick={() => remove(q.id)} title="Delete quote">
                  <Trash2 className="w-4 h-4" />
                </IconButton>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
