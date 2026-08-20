"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Trash2,
  Download,
  Search,
} from "lucide-react";
import { Dropdown } from "@/components/ui/Dropdown";
import { SITE } from "@/lib/site";

type Subscriber = { id: string; email: string; createdAt: string };
type Comment = {
  id: string;
  name: string;
  email: string | null;
  ip: string | null;
  userAgent: string | null;
  content: string;
  approved: boolean;
  clientToken: string | null;
  userId: string | null;
  postId: string;
  createdAt: string;
  post: { title: string; slug: string };
};
type Enquiry = {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string;
  phone: string | null;
  organization: string;
  eventDate: string | null;
  message: string | null;
  type: string;
  createdAt: string;
};

type Data = { subscribers: Subscriber[]; comments: Comment[]; enquiries: Enquiry[] };

const TABS = ["Comments", "Subscribers", "Enquiries"] as const;
type Tab = (typeof TABS)[number];

function tabFromUrl(): Tab {
  if (typeof window === "undefined") return "Comments";
  const t = new URLSearchParams(window.location.search).get("tab");
  return TABS.includes(t as Tab) ? (t as Tab) : "Comments";
}

function setTabInUrl(tab: Tab) {
  const url = new URL(window.location.href);
  url.searchParams.set("tab", tab);
  window.history.replaceState(null, "", url.toString());
}

function toCsv(rows: (string | number)[][]) {
  return rows
    .map((r) =>
      r
        .map((cell) => {
          const s = String(cell ?? "");
          return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
        })
        .join(",")
    )
    .join("\n");
}

function download(filename: string, rows: (string | number)[][]) {
  const blob = new Blob([toCsv(rows)], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border py-12 text-center">
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

export function ModerationPanel() {
  const [data, setData] = useState<Data | null>(null);
  const [tab, setTab] = useState<Tab>(() => tabFromUrl());
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [subscriberFilter, setSubscriberFilter] = useState("");
  const [error, setError] = useState("");

  async function load(): Promise<boolean> {
    try {
      const res = await fetch("/api/admin/moderation");
      if (!res.ok) return false;
      setData(await res.json());
      return true;
    } catch {
      return false;
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- setState happens after the await in load()
    void load();
  }, []);

  function switchTab(t: Tab) {
    setTab(t);
    setSelected(new Set());
    setTabInUrl(t);
  }

  async function act(kind: "subscriber" | "comment" | "enquiry", ids: string[]) {
    if (!ids.length) return;
    const res = await fetch("/api/admin/moderation", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind, action: "delete", ids }),
    });
    if (!res.ok) {
      setError("Action failed. Please try again.");
      return;
    }
    setSelected(new Set());
    await load();
  }

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll(ids: string[]) {
    setSelected((prev) => {
      const allSelected = ids.length > 0 && ids.every((id) => prev.has(id));
      const next = new Set(prev);
      ids.forEach((id) => {
        if (allSelected) next.delete(id);
        else next.add(id);
      });
      return next;
    });
  }

  function exportSubscribersCsv() {
    if (!data) return;
    download("subscribers.csv", [
      ["Email", "Subscribed at"],
      ...data.subscribers.map((s) => [s.email, new Date(s.createdAt).toLocaleString()]),
    ]);
  }

  function exportEnquiriesCsv() {
    if (!data) return;
    download("enquiries.csv", [
      ["Name", "Email", "Phone", "Organization", "Type", "Event date", "Message", "Received at"],
      ...data.enquiries.map((e) => [
        `${e.firstName} ${e.lastName ?? ""}`.trim(),
        e.email,
        e.phone ?? "",
        e.organization,
        e.type,
        e.eventDate ?? "",
        e.message ?? "",
        new Date(e.createdAt).toLocaleString(),
      ]),
    ]);
  }

  function exportCommentsCsv() {
    if (!data) return;
    download("comments.csv", [
      ["Name", "Email", "IP", "User Agent", "Post", "Comment", "Approved", "User ID", "Device token", "Received at"],
      ...data.comments.map((c) => [
        c.name,
        c.email ?? "",
        c.ip ?? "",
        c.userAgent ?? "",
        c.post.title,
        c.content,
        c.approved ? "Yes" : "No",
        c.userId ?? "",
        c.clientToken ?? "",
        new Date(c.createdAt).toLocaleString(),
      ]),
    ]);
  }

  const filteredSubscribers = useMemo(() => {
    if (!data) return [];
    const q = subscriberFilter.trim().toLowerCase();
    if (!q) return data.subscribers;
    return data.subscribers.filter((s) => s.email.toLowerCase().includes(q));
  }, [data, subscriberFilter]);

  const counts = {
    Comments: data?.comments.length ?? 0,
    Subscribers: data?.subscribers.length ?? 0,
    Enquiries: data?.enquiries.length ?? 0,
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold">Community</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review blog comments, newsletter subscribers, and contact form enquiries.
        </p>
      </header>

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      <div className="flex gap-2 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => switchTab(t)}
            className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              tab === t
                ? "border-accent text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t}
            <span
              className={`ml-2 inline-flex rounded-full px-2 py-0.5 text-xs font-bold ${
                tab === t ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              {counts[t]}
            </span>
          </button>
        ))}
      </div>

      {!data ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : tab === "Comments" ? (
        <div>
          {data.comments.length > 0 && (
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={
                    data.comments.length > 0 &&
                    data.comments.every((c) => selected.has(c.id))
                  }
                  onChange={() => toggleAll(data.comments.map((c) => c.id))}
                  className="accent-[var(--accent)]"
                />
                Select all
              </label>
              {selected.size > 0 && (
                <>
                  <span className="text-xs text-muted-foreground">
                    {selected.size} selected
                  </span>
                  <div className="w-52">
                    <Dropdown
                      id="comment-actions"
                      label="Bulk actions"
                      value=""
                      onChange={(v) => {
                        if (v === "delete") act("comment", [...selected]);
                      }}
                      placeholder="With selected…"
                      options={[{ value: "delete", label: "Delete selected" }]}
                    />
                  </div>
                </>
              )}
              <button
                type="button"
                onClick={exportCommentsCsv}
                className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:border-accent transition-colors ml-auto"
              >
                <Download className="w-4 h-4" /> Export CSV
              </button>
            </div>
          )}
          {data.comments.length === 0 ? (
            <EmptyState text="No comments yet. Comments on blog posts will appear here automatically." />
          ) : (
            <ul className="divide-y divide-border border-y border-border">
              {data.comments.map((c) => (
                <li key={c.id} className="py-4 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <input
                      type="checkbox"
                      checked={selected.has(c.id)}
                      onChange={() => toggle(c.id)}
                      aria-label={`Select comment by ${c.name}`}
                      className="accent-[var(--accent)] mt-1"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm">{c.name}</span>
                        {c.email && (
                          <a
                            href={`mailto:${c.email}`}
                            className="text-xs text-muted-foreground hover:text-accent"
                          >
                            {c.email}
                          </a>
                        )}
                        <span className="text-xs text-muted-foreground">
                          on {c.post.title}
                        </span>
                        <time className="text-xs text-muted-foreground" dateTime={c.createdAt}>
                          {new Date(c.createdAt).toLocaleString()}
                        </time>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                        {c.content}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold ${
                            c.approved
                              ? "bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-400"
                              : "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400"
                          }`}
                        >
                          {c.approved ? "Approved" : "Pending"}
                        </span>
                        <a
                          href={`${SITE.url}/blog/${c.post.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-accent font-medium underline"
                        >
                          Post: {c.post.slug}
                        </a>
                        {c.ip && (
                          <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-muted-foreground">
                            IP: {c.ip}
                          </span>
                        )}
                        {c.userAgent && (
                          <span className="rounded bg-muted px-1.5 py-0.5 text-muted-foreground truncate max-w-[240px]" title={c.userAgent}>
                            UA: {c.userAgent}
                          </span>
                        )}
                        {c.userId && (
                          <span className="text-muted-foreground">User ID: {c.userId}</span>
                        )}
                        {c.clientToken && (
                          <span className="text-muted-foreground">Token: {c.clientToken}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => act("comment", [c.id])}
                    aria-label="Delete comment"
                    className="p-2 rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : tab === "Subscribers" ? (
        <div>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <div className="relative max-w-sm flex-1 min-w-56">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="search"
                value={subscriberFilter}
                onChange={(e) => setSubscriberFilter(e.target.value)}
                placeholder="Filter by email…"
                className="w-full rounded-xl border border-border bg-background pl-9 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <button
              type="button"
              onClick={exportSubscribersCsv}
              disabled={data.subscribers.length === 0}
              className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:border-accent disabled:opacity-50 transition-colors"
            >
              <Download className="w-4 h-4" /> Export CSV
            </button>
          </div>
          {filteredSubscribers.length === 0 ? (
            <EmptyState text={subscriberFilter ? "No subscribers match your filter." : "No subscribers yet."} />
          ) : (
            <ul className="divide-y divide-border border-y border-border">
              {filteredSubscribers.map((s) => (
                <li key={s.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm truncate">{s.email}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(s.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => act("subscriber", [s.id])}
                    aria-label="Remove subscriber"
                    className="p-2 rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <div>
          <div className="mb-4 flex justify-end">
            <button
              type="button"
              onClick={exportEnquiriesCsv}
              disabled={data.enquiries.length === 0}
              className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:border-accent disabled:opacity-50 transition-colors"
            >
              <Download className="w-4 h-4" /> Export CSV
            </button>
          </div>
          {data.enquiries.length === 0 ? (
            <EmptyState text="No enquiries yet. Contact form submissions will appear here." />
          ) : (
            <ul className="divide-y divide-border border-y border-border">
              {data.enquiries.map((e) => (
                <li key={e.id} className="py-4 flex items-start justify-between gap-4">
                  <div className="min-w-0 space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm">
                        {`${e.firstName} ${e.lastName ?? ""}`.trim()}
                      </span>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                        {e.type}
                      </span>
                      <time className="text-xs text-muted-foreground" dateTime={e.createdAt}>
                        {new Date(e.createdAt).toLocaleString()}
                      </time>
                    </div>
                    <p className="text-sm">
                      <a href={`mailto:${e.email}`} className="text-accent hover:underline">
                        {e.email}
                      </a>
                      {e.phone && <span className="text-muted-foreground"> · {e.phone}</span>}
                    </p>
                    <p className="text-sm text-muted-foreground">{e.organization}</p>
                    {e.eventDate && (
                      <p className="text-sm text-muted-foreground">
                        Event date: {new Date(e.eventDate).toLocaleDateString()}
                      </p>
                    )}
                    {e.message && (
                      <p className="text-sm text-muted-foreground leading-relaxed">{e.message}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => act("enquiry", [e.id])}
                    aria-label="Delete enquiry"
                    className="p-2 rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}