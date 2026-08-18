"use client";

import { useState } from "react";
import { Hash, BookOpen, Video, Quote } from "lucide-react";
import { ContentManager } from "@/components/admin/ContentManager";
import { BooksManager } from "@/components/admin/BooksManager";
import { VideosManager } from "@/components/admin/VideosManager";
import { QuotesManager } from "@/components/admin/QuotesManager";

const TABS = [
  { value: "topics", label: "Topics", icon: Hash },
  { value: "books", label: "Books", icon: BookOpen },
  { value: "videos", label: "Videos", icon: Video },
  { value: "quotes", label: "Quotes", icon: Quote },
] as const;

type Tab = (typeof TABS)[number]["value"];

function isTab(value: string | undefined): value is Tab {
  return TABS.some((x) => x.value === value);
}

export function ContentHub({ initialTab }: { initialTab?: string }) {
  const [tab, setTab] = useState<Tab>(isTab(initialTab) ? initialTab : "topics");

  function switchTab(t: Tab) {
    setTab(t);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", t);
    window.history.replaceState(null, "", url.toString());
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-1 rounded-full bg-muted p-1 w-fit">
        {TABS.map((t) => {
          const active = tab === t.value;
          return (
            <button
              key={t.value}
              type="button"
              onClick={() => switchTab(t.value)}
              aria-current={active ? "page" : undefined}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                active
                  ? "bg-foreground text-background shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === "topics" && <ContentManager />}
      {tab === "books" && <BooksManager />}
      {tab === "videos" && <VideosManager />}
      {tab === "quotes" && <QuotesManager />}
    </div>
  );
}