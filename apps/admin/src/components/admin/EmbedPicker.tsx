"use client";

import { useCallback, useEffect, useState } from "react";
import {
  X,
  Loader2,
  AlertCircle,
  Video,
  BookOpen,
  MonitorSmartphone,
  Share2,
  Quote as QuoteIcon,
  Plus,
  Search,
  Check,
} from "lucide-react";
import type { EmbedData, EmbedKind } from "@/components/admin/ContentEmbed";
import { youtubeThumb, youtubeWatchUrl } from "@/lib/youtube";

type Tab = Exclude<EmbedKind, "quote"> | "quote";

type Row = {
  kind: EmbedKind;
  id: string;
  title: string;
  subtitle: string;
  href: string;
  image: string;
};

type VideoRow = {
  id: string;
  title: string;
  slug: string | null;
  embedUrl: string;
  thumbnail: string | null;
  category: { id: string; name: string } | null;
  published: boolean | null;
};

type BookRow = {
  id: string;
  title: string;
  type: string | null;
  author: string | null;
  tagline: string | null;
  imageUrl: string | null;
  buyUrl: string | null;
  published: boolean | null;
};

type SocialRow = {
  id: string;
  label: string;
  handle: string | null;
  href: string;
  logoUrl: string | null;
  active: boolean | null;
};

const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: "video", label: "Video", icon: <Video className="w-3.5 h-3.5" /> },
  { key: "book", label: "Book", icon: <BookOpen className="w-3.5 h-3.5" /> },
  { key: "ebook", label: "E-book", icon: <MonitorSmartphone className="w-3.5 h-3.5" /> },
  { key: "social", label: "Social", icon: <Share2 className="w-3.5 h-3.5" /> },
  { key: "quote", label: "Quote", icon: <QuoteIcon className="w-3.5 h-3.5" /> },
];

const keyOf = (row: Row) => (row.kind === "quote" ? `quote:${row.title}` : `${row.kind}:${row.id}`);

export function EmbedPicker({
  onPick,
  onClose,
}: {
  onPick: (items: EmbedData[]) => void;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<Tab>("video");
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [quoteText, setQuoteText] = useState("");
  const [quoteTag, setQuoteTag] = useState("");
  const [selected, setSelected] = useState<Row[]>([]);

  const switchTab = (t: Tab) => {
    setTab(t);
    setRows(null);
    setLoading(true);
    setError("");
  };

  const isSelected = (row: Row) =>
    selected.some((s) => keyOf(s) === keyOf(row));

  const toggle = (row: Row) =>
    setSelected((prev) =>
      isSelected(row)
        ? prev.filter((s) => keyOf(s) !== keyOf(row))
        : [...prev, row]
    );

  const addQuote = () => {
    const text = quoteText.trim();
    if (!text) return;
    toggle({ kind: "quote", id: "", title: text, subtitle: quoteTag.trim(), href: "", image: "" });
    setQuoteText("");
    setQuoteTag("");
  };

  const fetchRows = useCallback(async (t: Tab) => {
    if (t === "quote") return;
    try {
      let rows: Row[] = [];
      if (t === "video") {
        const res = await fetch("/api/admin/videos");
        const data = (await res.json().catch(() => ({}))) as { videos?: VideoRow[] };
        rows = (data.videos ?? [])
          .filter((v) => v.published !== false)
          .map((v) => ({
            kind: "video" as const,
            id: v.id,
            title: v.title,
            subtitle: v.category?.name ?? "",
            href: v.slug
              ? `/videos/${v.slug}`
              : youtubeWatchUrl(v.embedUrl) || v.embedUrl,
            image: v.thumbnail ?? youtubeThumb(v.embedUrl) ?? "",
          }));
      } else if (t === "book" || t === "ebook") {
        const want = t === "book" ? "PUBLISHED" : "EBOOK";
        const res = await fetch("/api/admin/books");
        const data = (await res.json().catch(() => ({}))) as { books?: BookRow[] };
        rows = (data.books ?? [])
          .filter((b) => b.published !== false && (b.type ?? "PUBLISHED") === want)
          .map((b) => ({
            kind: t,
            id: b.id,
            title: b.title,
            subtitle: b.author ?? b.tagline ?? "",
            href: b.buyUrl ?? "",
            image: b.imageUrl ?? "",
          }));
      } else {
        const res = await fetch("/api/admin/socials");
        const data = (await res.json().catch(() => ({}))) as { socials?: SocialRow[] };
        rows = (data.socials ?? [])
          .filter((s) => s.active !== false)
          .map((s) => ({
            kind: "social" as const,
            id: s.id,
            title: s.label,
            subtitle: s.handle ?? "",
            href: s.href,
            image: s.logoUrl ?? "",
          }));
      }
      setRows(rows);
    } catch {
      setError("Could not load the list. Try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async fetch; states only set after await
    void fetchRows(tab);
  }, [tab, fetchRows]);

  const filtered =
    rows?.filter(
      (r) =>
        !query.trim() ||
        r.title.toLowerCase().includes(query.toLowerCase()) ||
        r.subtitle.toLowerCase().includes(query.toLowerCase())
    ) ?? [];

  const rowThumb = (row: Row) => {
    if (!row.image) {
      return (
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-muted text-sm font-bold text-accent">
          {(row.title || "S").charAt(0).toUpperCase()}
        </span>
      );
    }
    if (row.kind === "book" || row.kind === "ebook") {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={row.image}
          alt=""
          className="h-12 w-9 shrink-0 rounded object-cover ring-1 ring-border"
        />
      );
    }
    if (row.kind === "video") {
      return (
        <span className="relative h-12 w-[4.5rem] shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={row.image}
            alt=""
            className="h-full w-full rounded object-cover"
          />
          <span className="absolute inset-0 grid place-items-center rounded">
            <span className="grid h-4 w-4 place-items-center rounded-full bg-black/55 text-white">
              <span className="ml-0.5 text-[8px] leading-none">▶</span>
            </span>
          </span>
        </span>
      );
    }
    if (row.kind === "social") {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={row.image}
          alt=""
          className="h-10 w-10 shrink-0 rounded-full object-cover"
        />
      );
    }
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={row.image}
        alt=""
        className="h-11 w-11 shrink-0 rounded-lg object-cover"
      />
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Insert content"
    >
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative flex max-h-[85vh] w-full max-w-xl flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div>
            <h3 className="font-display text-base font-bold">Insert content</h3>
            <p className="text-xs text-muted-foreground">
              Pick one or more items to add to your post.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-wrap gap-1 border-b border-border px-4 py-2">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => switchTab(t.key)}
              aria-pressed={tab === t.key}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                tab === t.key
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {t.icon}
              {t.label}
              {selected.filter((s) => s.kind === t.key).length > 0 && (
                <span
                  className={`grid h-4 min-w-4 place-items-center rounded-full px-1 text-[10px] font-bold ${
                    tab === t.key ? "bg-accent-foreground/20 text-accent-foreground" : "bg-accent text-accent-foreground"
                  }`}
                >
                  {selected.filter((s) => s.kind === t.key).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {selected.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 border-b border-border bg-muted/30 px-4 py-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Selected
            </span>
            {selected.map((s) => (
              <span
                key={keyOf(s)}
                className="inline-flex max-w-[14rem] items-center gap-1 rounded-full border border-accent/40 bg-accent/10 px-2 py-0.5 text-[11px] text-foreground"
              >
                <span className="truncate">{s.title}</span>
                <button
                  type="button"
                  onClick={() => toggle(s)}
                  aria-label={`Remove ${s.title}`}
                  className="shrink-0 rounded-full p-0.5 text-muted-foreground hover:bg-accent/20 hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="min-h-[12rem] flex-1 overflow-y-auto p-4">
          {tab === "quote" ? (
            <div className="space-y-3">
              <textarea
                autoFocus
                value={quoteText}
                onChange={(e) => setQuoteText(e.target.value)}
                placeholder="The quote itself…"
                rows={3}
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent resize-y"
              />
              <input
                type="text"
                value={quoteTag}
                onChange={(e) => setQuoteTag(e.target.value)}
                placeholder="Tag (e.g. Habits) — optional"
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent"
              />
              <button
                type="button"
                onClick={addQuote}
                disabled={!quoteText.trim()}
                className="inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-xs font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-60"
              >
                <Plus className="w-3.5 h-3.5" /> Add to selection
              </button>
            </div>
          ) : (
            <>
              <div className="relative mb-3">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={`Search ${tab === "video" ? "videos" : tab === "social" ? "social links" : tab === "book" ? "books" : "e-books"}…`}
                  className="w-full rounded-xl border border-border bg-background py-2 pl-8 pr-3 text-sm outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              {loading ? (
                <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading…
                </div>
              ) : error ? (
                <div className="flex items-center gap-2 py-8 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4 shrink-0" /> {error}
                </div>
              ) : filtered.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  {query ? "No matches." : `Nothing here yet — add it in the admin panel first.`}
                </p>
              ) : (
                <ul className="space-y-1.5">
                  {filtered.map((row) => {
                    const selectedLabel = isSelected(row);
                    return (
                      <li key={keyOf(row)}>
                        <button
                          type="button"
                          onClick={() => toggle(row)}
                          aria-pressed={selectedLabel}
                          className={`flex w-full items-center gap-3 rounded-xl border p-2.5 text-left transition-colors ${
                            selectedLabel
                              ? "border-accent bg-accent/10"
                              : "border-border hover:border-accent hover:bg-muted"
                          }`}
                        >
                          {rowThumb(row)}
                          <span className="min-w-0 flex-1">
                            <span className="flex items-center gap-2">
                              <span className="block truncate text-sm font-semibold text-foreground">
                                {row.title}
                              </span>
                              <span className="shrink-0 rounded-full border border-border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                                {row.kind === "ebook" ? "e-book" : row.kind}
                              </span>
                            </span>
                            {row.subtitle ? (
                              <span className="block truncate text-xs text-muted-foreground">
                                {row.subtitle}
                              </span>
                            ) : null}
                          </span>
                          <span
                            className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border ${
                              selectedLabel
                                ? "border-accent bg-accent text-accent-foreground"
                                : "border-border text-transparent"
                            }`}
                          >
                            <Check className="h-3 w-3" />
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-border px-4 py-3">
          <span className="text-xs text-muted-foreground">
            {selected.length
              ? `${selected.length} selected`
              : "No items selected"}
          </span>
          <div className="flex items-center gap-2">
            {selected.length > 0 && (
              <button
                type="button"
                onClick={() => setSelected([])}
                className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted"
              >
                Clear
              </button>
            )}
            <button
              type="button"
              disabled={selected.length === 0}
              onClick={() => onPick(selected)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-1.5 text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              Insert {selected.length || ""}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}