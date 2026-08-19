"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, ChevronDown } from "lucide-react";

export type InsertItem = { title: string; url: string };
export type InsertKind = "post" | "video" | "book" | "read" | "quote";

const KIND_LABEL: Record<InsertKind, string> = {
  post: "Blog",
  video: "Video",
  book: "Book",
  read: "Read",
  quote: "Quote",
};

type Props = {
  items: {
    posts: InsertItem[];
    videos: InsertItem[];
    books: InsertItem[];
    read: InsertItem[];
    quotes: InsertItem[];
  };
  onInsert: (item: InsertItem, kind: InsertKind) => void;
  label?: string;
  align?: "left" | "right";
  compact?: boolean;
};

export function InsertContentPicker({
  items,
  onInsert,
  label = "Insert content",
  align = "left",
  compact,
}: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, [open]);

  const allGroups: { kind: InsertKind; label: string; rows: InsertItem[] }[] = [
    { kind: "post", label: "Blogs", rows: items.posts },
    { kind: "video", label: "Videos", rows: items.videos },
    { kind: "book", label: "Books I publish", rows: items.books },
    { kind: "read", label: "Books I read", rows: items.read },
    { kind: "quote", label: "Quotes", rows: items.quotes },
  ];
  const groups = allGroups.filter((g) => g.rows.length > 0);

  if (groups.length === 0) return null;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="true"
        aria-expanded={open}
        className={
          compact
            ? "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-muted"
            : "inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-border px-3 py-2.5 text-sm font-medium text-muted-foreground hover:border-accent hover:text-accent"
        }
      >
        <Plus className={compact ? "w-3.5 h-3.5" : "w-4 h-4"} />
        {label}
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="Recent content"
          className={`absolute z-40 mt-2 w-72 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-border bg-card shadow-2xl ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          <div className="border-b border-border px-4 py-2.5">
            <p className="text-sm font-semibold">Recent content</p>
            <p className="text-xs text-muted-foreground">
              Link a blog, video, book or quote.
            </p>
          </div>
          <div className="max-h-72 overflow-y-auto p-2">
            {groups.map((g) => (
              <div key={g.kind} className="mb-1 last:mb-0">
                <p className="px-2 pb-1 pt-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  {g.label}
                </p>
                {g.rows.map((row) => (
                  <button
                    key={row.url}
                    type="button"
                    onClick={() => {
                      onInsert(row, g.kind);
                      setOpen(false);
                    }}
                    className="flex w-full items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-muted"
                  >
                    <span className="truncate">{row.title}</span>
                    <span className="shrink-0 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                      {KIND_LABEL[g.kind]}
                    </span>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}