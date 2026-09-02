"use client";

import { useEffect, useRef, useState } from "react";
import { Search, FileText, Film, BookOpen, MessageCircle, BookMarked, Tablet } from "lucide-react";

export type InsertItem = { title: string; url: string; image?: string | null };
export type InsertKind = "post" | "video" | "book" | "read" | "ebook" | "quote";

const KIND_META: Record<InsertKind, { label: string; icon: typeof FileText; color: string }> = {
  post:   { label: "Blog",   icon: FileText,    color: "bg-blue-500/10 text-blue-600" },
  video:  { label: "Video",  icon: Film,        color: "bg-purple-500/10 text-purple-600" },
  book:   { label: "Published", icon: BookOpen, color: "bg-amber-500/10 text-amber-600" },
  read:   { label: "Read",   icon: BookMarked,  color: "bg-emerald-500/10 text-emerald-600" },
  ebook:  { label: "E-Book", icon: Tablet,      color: "bg-cyan-500/10 text-cyan-600" },
  quote:  { label: "Quote",  icon: MessageCircle, color: "bg-rose-500/10 text-rose-600" },
};

type Props = {
  items: { posts: InsertItem[]; videos: InsertItem[]; books: InsertItem[]; read: InsertItem[]; ebooks: InsertItem[]; quotes: InsertItem[] };
  onInsert: (item: InsertItem, kind: InsertKind) => void;
};

export function InsertContentPicker({ items, onInsert }: Props) {
  const [expanded, setExpanded] = useState<InsertKind | null>(null);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const groups = [
    { kind: "post" as const,  rows: items.posts },
    { kind: "video" as const, rows: items.videos },
    { kind: "book" as const,  rows: items.books },
    { kind: "read" as const,  rows: items.read },
    { kind: "ebook" as const, rows: items.ebooks },
    { kind: "quote" as const, rows: items.quotes },
  ].filter((g) => g.rows.length > 0);

  const activeGroup = groups.find((g) => g.kind === expanded);
  const filteredRows = activeGroup
    ? (search ? activeGroup.rows.filter((r) => r.title.toLowerCase().includes(search.toLowerCase())) : activeGroup.rows)
    : [];

  return (
    <div ref={ref} className="space-y-1.5">
      {groups.map((g) => {
        const meta = KIND_META[g.kind];
        const Icon = meta.icon;
        const isOpen = expanded === g.kind;
        return (
          <div key={g.kind}>
            <button
              type="button"
              onClick={() => { setExpanded(isOpen ? null : g.kind); setSearch(""); }}
              className={`w-full flex items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-medium transition-colors ${isOpen ? "bg-accent/10 text-accent" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
            >
              <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${meta.color}`}>
                <Icon className="w-3 h-3" />
              </div>
              <span className="flex-1">{meta.label}</span>
              <span className="text-[10px] tabular-nums text-muted-foreground/60">{g.rows.length}</span>
            </button>
            {isOpen && (
              <div className="ml-2 mt-1 mb-2 space-y-0.5 border-l-2 border-border pl-2">
                <div className="flex items-center gap-1.5 rounded-md bg-muted/50 px-2 py-1 mb-1.5">
                  <Search className="w-3 h-3 text-muted-foreground shrink-0" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={`Search ${meta.label.toLowerCase()}s…`}
                    className="flex-1 bg-transparent text-[11px] outline-none placeholder:text-muted-foreground/40"
                    autoFocus
                  />
                  {search && <button type="button" onClick={() => setSearch("")} className="text-muted-foreground hover:text-foreground text-[10px]">✕</button>}
                </div>
                {filteredRows.length === 0 ? (
                  <p className="px-1 py-2 text-[10px] text-muted-foreground text-center">{search ? "No matches" : "None available"}</p>
                ) : (
                  filteredRows.map((row, idx) => (
                    <button
                      key={`${g.kind}-${idx}-${row.url}`}
                      type="button"
                      onClick={() => { onInsert(row, g.kind); setExpanded(null); setSearch(""); }}
                      className="w-full flex items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-accent/5 transition-colors group"
                    >
                      <span className="truncate flex-1 text-[11px] text-foreground group-hover:text-accent">{row.title}</span>
                      <span className="shrink-0 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground/50 group-hover:text-accent/70">+ add</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
