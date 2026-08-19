"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  Loader2,
  Pencil,
  AlertCircle,
  CheckCircle2,
  Link2,
  FileUp,
} from "lucide-react";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { showConfirm } from "@/components/admin/ConfirmDialog";
import { Dropdown } from "@/components/ui/Dropdown";
import { Modal } from "@/components/ui/Modal";

type BookType = "PUBLISHED" | "READ" | "EBOOK";

type Book = {
  id: string;
  type: BookType;
  title: string;
  author: string | null;
  tagline: string | null;
  description: string | null;
  learning: string | null;
  note: string | null;
  imageUrl: string | null;
  buyUrl: string | null;
  fileKey: string | null;
  free: boolean;
  featured: boolean;
  published: boolean;
  sortOrder: number;
};

type BookForm = {
  type: BookType;
  title: string;
  author: string;
  tagline: string;
  description: string;
  learning: string;
  note: string;
  imageUrl: string | null;
  buyUrl: string;
  fileKey: string | null;
  free: boolean;
  featured: boolean;
  published: boolean;
  sortOrder: number;
};

const empty: BookForm = {
  type: "PUBLISHED",
  title: "",
  author: "",
  tagline: "",
  description: "",
  learning: "",
  note: "",
  imageUrl: null,
  buyUrl: "",
  fileKey: null,
  free: false,
  featured: false,
  published: true,
  sortOrder: 0,
};

const TABS: { value: BookType | "ALL"; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "PUBLISHED", label: "Books I Published" },
  { value: "READ", label: "Books I Read" },
  { value: "EBOOK", label: "E-books" },
];

const inputCls =
  "rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent w-full";

export function BooksManager() {
  const [books, setBooks] = useState<Book[]>([]);
  const [tab, setTab] = useState<BookType | "ALL">("ALL");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<BookForm | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  async function importFromLink() {
    if (!editing || !editing.buyUrl.trim()) {
      setError("Enter a buy link first, then import.");
      return;
    }
    setImporting(true);
    setError("");
    setOk("");
    try {
      const res = await fetch(
        `/api/admin/books/import?url=${encodeURIComponent(editing.buyUrl.trim())}`
      );
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setEditing({
          ...editing,
          title: data.title || editing.title,
          description: data.description || editing.description,
          imageUrl: data.imageUrl || editing.imageUrl,
        });
        setOk("Book details imported from the link.");
      } else {
        setError(data.error ?? "Could not import from that link.");
      }
    } catch {
      setError("Could not reach the link.");
    } finally {
      setImporting(false);
    }
  }

  async function handleUploadEbook(file: File) {
    if (!file) return;
    if (!["application/pdf", "application/epub+zip", "application/x-mobipocket-ebook", "application/vnd.amazon.ebook"].includes(file.type)) {
      setError("Unsupported file type. Use PDF, EPUB, MOBI or AZW3.");
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      setError("File too large. Max size is 25MB.");
      return;
    }
    setError("");
    setOk("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/ebook/upload", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.path) {
        setEditing({ ...editing!, fileKey: data.path });
        setOk("E-book file uploaded (stored privately).");
      } else {
        setError(data.error ?? "Could not upload the file.");
      }
    } catch {
      setError("Could not upload the file.");
    }
  }

  async function handlePastedImage(dataUrl: string) {
    if (!editing) return;
    setError("");
    setOk("");
    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataUrl, folder: "books" }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.url) {
        setEditing({ ...editing, imageUrl: data.url });
        setOk("Pasted image uploaded.");
      } else {
        setError(data.error ?? "Could not upload that image.");
      }
    } catch {
      setError("Could not upload the pasted image.");
    }
  }

  async function load() {
    try {
      const res = await fetch("/api/admin/books");
      if (res.ok) {
        const data = await res.json();
        setBooks(data.books);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function startNew(type?: BookType) {
    const targetType = type ?? (tab === "ALL" ? "PUBLISHED" : tab);
    setEditing({ ...empty, type: targetType });
    setEditingId(null);
    setError("");
    setOk("");
  }

  function startEdit(b: Book) {
    setEditing({
      type: b.type,
      title: b.title,
      author: b.author ?? "",
      tagline: b.tagline ?? "",
      description: b.description ?? "",
      learning: b.learning ?? "",
      note: b.note ?? "",
      imageUrl: b.imageUrl,
      buyUrl: b.buyUrl ?? "",
      fileKey: b.fileKey,
      free: b.free,
      featured: b.featured,
      published: b.published,
      sortOrder: b.sortOrder,
    });
    setEditingId(b.id);
    setError("");
    setOk("");
  }

  function cancelEdit() {
    setEditing(null);
    setEditingId(null);
    setError("");
  }

  async function save() {
    if (!editing || !editing.title.trim()) {
      setError("Title is required.");
      return;
    }
    setBusy(true);
    setError("");
    setOk("");
    const savedType = editing.type;
    const payload = {
      ...(editingId ? { id: editingId } : {}),
      type: savedType,
      title: editing.title.trim(),
      author: savedType === "READ" ? editing.author || null : null,
      tagline: editing.tagline || null,
      description: editing.description || null,
      learning: savedType === "READ" ? editing.learning || null : null,
      note: savedType === "READ" ? editing.note || null : null,
      imageUrl: editing.imageUrl,
      buyUrl: editing.buyUrl || null,
      fileKey:
        savedType === "EBOOK" && editing.free ? editing.fileKey || null : null,
      free: savedType === "EBOOK" ? editing.free : false,
      featured: savedType !== "READ" ? editing.featured : false,
      published: editing.published,
      sortOrder: Number(editing.sortOrder || 0),
    };
    const res = await fetch("/api/admin/books", {
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
    setTab(savedType);
    setOk(editingId ? "Book updated successfully." : `Book added to ${TABS.find(t => t.value === savedType)?.label}.`);
    await load();
  }

  async function remove(id: string) {
    const ok = await showConfirm({
      title: "Delete book?",
      message: "This removes the book from your site. This action cannot be undone.",
    });
    if (!ok) return;
    const res = await fetch(`/api/admin/books?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setBooks((b) => b.filter((x) => x.id !== id));
      if (editingId === id) {
        setEditing(null);
        setEditingId(null);
      }
    }
  }

  const visible = tab === "ALL" ? books : books.filter((b) => b.type === tab);

  return (
    <div className="space-y-6">
      {/* Type filter dropdown */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="w-64">
          <Dropdown
            id="book-type"
            label="Book type"
            value={tab}
            onChange={(v) => {
              setTab(v as BookType | "ALL");
              if (!editing) setOk("");
            }}
            options={[
              { value: "ALL", label: `All (${books.length})` },
              { value: "PUBLISHED", label: `Books I Published (${books.filter((b) => b.type === "PUBLISHED").length})` },
              { value: "READ", label: `Books I Read (${books.filter((b) => b.type === "READ").length})` },
              { value: "EBOOK", label: `E-books (${books.filter((b) => b.type === "EBOOK").length})` },
            ]}
          />
        </div>
        <p className="text-sm text-muted-foreground">
          {visible.length} book{visible.length === 1 ? "" : "s"}
        </p>
        {!editing && (
          <button
            onClick={() => startNew()}
            className="ml-auto inline-flex items-center gap-2 rounded-full bg-accent text-accent-foreground px-5 py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add book {tab !== "ALL" ? `to ${TABS.find(t => t.value === tab)?.label}` : ""}
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
          title={editingId ? "Edit book" : "New book"}
          onClose={cancelEdit}
          wide
          footer={
            <>
              <button
                type="submit"
                form="book-form"
                disabled={busy}
                className="inline-flex items-center gap-2 rounded-full bg-accent text-accent-foreground px-5 py-2.5 text-sm font-semibold disabled:opacity-60"
              >
                {busy && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingId ? "Save changes" : "Add book"}
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
          id="book-form"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}
          className="space-y-4"
        >
          <div className="flex items-center justify-end">
            <select
              value={editing.type}
              onChange={(e) =>
                setEditing({ ...editing, type: e.target.value as BookType })
              }
              className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="PUBLISHED">Books I Published</option>
              <option value="READ">Books I Read</option>
              <option value="EBOOK">E-books</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Title *</label>
            <input
              value={editing.title}
              onChange={(e) => setEditing({ ...editing, title: e.target.value })}
              className={inputCls}
              autoFocus
            />
          </div>

          {editing.type === "READ" ? (
            <>
              <div>
                <label className="block text-sm font-medium mb-1.5">Author *</label>
                <input
                  value={editing.author}
                  onChange={(e) => setEditing({ ...editing, author: e.target.value })}
                  className={inputCls}
                  placeholder="Author name"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium">Learnings from this book (Bullet points)</label>
                  <button
                    type="button"
                    onClick={() => {
                      const prefix = editing.learning.trim() ? "\n• " : "• ";
                      setEditing({ ...editing, learning: editing.learning + prefix });
                    }}
                    className="text-xs font-semibold text-accent hover:underline"
                  >
                    + Add bullet point
                  </button>
                </div>
                <textarea
                  value={editing.learning}
                  onChange={(e) => setEditing({ ...editing, learning: e.target.value })}
                  rows={5}
                  className={`${inputCls} font-mono text-xs leading-relaxed`}
                  placeholder="• Key learning 1&#10;• Key learning 2&#10;• Key learning 3"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Each bullet point will be cleanly rendered on the website under &quot;Learnings from this book&quot;.
                </p>
              </div>
            </>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium mb-1.5">Tagline</label>
                <input
                  value={editing.tagline}
                  onChange={(e) => setEditing({ ...editing, tagline: e.target.value })}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  {editing.type === "EBOOK" ? "Link (download / landing)" : "Buy link"}
                </label>
                <input
                  value={editing.buyUrl}
                  onChange={(e) => setEditing({ ...editing, buyUrl: e.target.value })}
                  placeholder="https://…"
                  className={inputCls}
                />
                {editing.type !== "EBOOK" && (
                  <button
                    type="button"
                    onClick={importFromLink}
                    disabled={importing || !editing.buyUrl.trim()}
                    className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-accent disabled:opacity-50 transition-colors"
                  >
                    {importing ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Link2 className="w-3.5 h-3.5" />
                    )}
                    Import from link
                  </button>
                )}
                {editing.type === "EBOOK" && editing.free && (
                  <div className="mt-3 rounded-xl border border-dashed border-border p-3">
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      E-book file {editing.fileKey ? "✓ uploaded" : "(not uploaded)"}
                    </p>
                    <label className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 text-accent px-3 py-1.5 text-xs font-semibold cursor-pointer hover:bg-accent/20 transition-colors">
                      <FileUp className="w-3.5 h-3.5" />
                      {editing.fileKey ? "Replace file" : "Upload file"}
                      <input
                        type="file"
                        accept=".pdf,.epub,.mobi,.azw3"
                        className="sr-only"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handleUploadEbook(f);
                          e.target.value = "";
                        }}
                      />
                    </label>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Stored in a private bucket and served only through the gated download flow.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {editing.type !== "READ" && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium">Description (Supports normal text &amp; bullet points)</label>
                <button
                  type="button"
                  onClick={() => {
                    const prefix = editing.description.trim() ? "\n• " : "• ";
                    setEditing({ ...editing, description: editing.description + prefix });
                  }}
                  className="text-xs font-semibold text-accent hover:underline"
                >
                  + Add bullet
                </button>
              </div>
              <textarea
                value={editing.description}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                rows={4}
                className={inputCls}
                placeholder="Write description or bullet points..."
              />
            </div>
          )}

          <div className="flex flex-wrap gap-6">
            <ImageUpload
              label={editing.type === "READ" ? "Cover" : "Cover image"}
              folder="books"
              value={editing.imageUrl}
              onChange={(url) => setEditing({ ...editing, imageUrl: url })}
              onPastedDataUrl={handlePastedImage}
            />
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <label className="block text-sm font-medium mb-1.5">Sort order</label>
              </div>
              <div className="flex flex-col gap-3">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={editing.published}
                    onChange={(e) =>
                      setEditing({ ...editing, published: e.target.checked })
                    }
                    className="accent-[var(--accent)]"
                  />
                  Published (visible)
                </label>
                {editing.type === "EBOOK" && (
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={editing.free}
                      onChange={(e) =>
                        setEditing({ ...editing, free: e.target.checked })
                      }
                      className="accent-[var(--accent)]"
                    />
                    Free
                  </label>
                )}
                {editing.type !== "READ" && (
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={editing.featured}
                      onChange={(e) =>
                        setEditing({ ...editing, featured: e.target.checked })
                      }
                      className="accent-[var(--accent)]"
                    />
                    Featured
                  </label>
                )}
              </div>
            </div>
          </div>

        </form>
        </Modal>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : visible.length === 0 ? (
        <p className="text-sm text-muted-foreground">No books here yet.</p>
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {visible.map((b) => (
            <li
              key={b.id}
              className="group flex flex-col rounded-2xl border border-border bg-card overflow-hidden transition-shadow hover:shadow-lg"
            >
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-muted">
                {b.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={b.imageUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="grid h-full w-full place-items-center font-display text-2xl font-bold text-muted-foreground/50">
                    {b.title.charAt(0) || "B"}
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col gap-2 p-3">
                <p className="font-medium leading-snug line-clamp-2">{b.title}</p>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {b.learning || b.tagline || b.description || "No description"}
                </p>
                <div className="mt-auto flex flex-wrap gap-1.5 text-[11px]">
                  <span className="rounded-full bg-accent/15 text-accent px-2 py-0.5">
                    {TABS.find((t) => t.value === b.type)?.label}
                  </span>
                  <span
                    className={
                      b.published
                        ? "rounded-full bg-emerald-100 text-emerald-700 px-2 py-0.5"
                        : "rounded-full bg-muted text-muted-foreground px-2 py-0.5"
                    }
                  >
                    {b.published ? "Published" : "Hidden"}
                  </span>
                  {b.type !== "READ" && b.featured && (
                    <span className="rounded-full bg-amber-100 text-amber-700 px-2 py-0.5">
                      Featured
                    </span>
                  )}
                  {b.type === "EBOOK" && (
                    <span className="rounded-full bg-blue-100 text-blue-700 px-2 py-0.5">
                      {b.free ? "Free" : "Premium"}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 border-t border-border pt-2">
                  <button
                    onClick={() => startEdit(b)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full border border-border py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-accent transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => remove(b.id)}
                    aria-label={`Delete book ${b.title}`}
                    className="p-1.5 rounded-full text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}