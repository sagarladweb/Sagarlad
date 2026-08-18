"use client";

import { useEffect, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { CheckCircle2, XCircle, Clock } from "lucide-react";
import { NewsletterComposer } from "@/components/admin/NewsletterComposer";

type Subscriber = {
  id: string;
  email: string;
  name: string | null;
  acceptedTerms: boolean;
  unsubscribed: boolean;
  createdAt: string;
};

type Campaign = {
  id: string;
  subject: string;
  createdAt: string;
  total: number;
  queued: number;
  sent: number;
  failed: number;
};

type ApiData = {
  subscriberCount: number;
  subscribers: Subscriber[];
  campaigns: Campaign[];
};

export function NewsletterManager() {
  const [data, setData] = useState<ApiData>({
    subscriberCount: 0,
    subscribers: [],
    campaigns: [],
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const subscribersRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: data.subscribers.length,
    getScrollElement: () => subscribersRef.current,
    estimateSize: () => 48,
    overscan: 10,
  });

  async function load() {
    try {
      const res = await fetch("/api/admin/newsletter");
      if (res.ok) setData(await res.json());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const percent = (c: Campaign) =>
    c.total === 0 ? 0 : Math.round((c.sent / c.total) * 100);

  return (
    <div className="space-y-8">
      {message && (
        <p
          role={message.ok ? "status" : "alert"}
          className={`text-sm ${message.ok ? "text-green-600" : "text-red-600"}`}
        >
          {message.text}
        </p>
      )}

      <div>
        <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Write a newsletter
        </h2>
        <NewsletterComposer
          subscriberCount={data.subscriberCount}
          onSent={(queued, sentNow, remainingToday) => {
            setMessage({
              ok: true,
              text: `Queued for ${queued} subscriber${queued === 1 ? "" : "s"}. ` +
                `Sent ${sentNow} now; ${remainingToday} emails left in today's quota. ` +
                `The rest send automatically as quota frees up.`,
            });
            load();
          }}
          onError={(text) => setMessage({ ok: false, text })}
        />
      </div>

      <div>
        <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Past newsletters
        </h2>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : data.campaigns.length === 0 ? (
          <p className="text-sm text-muted-foreground">No newsletters yet. Send your first one above.</p>
        ) : (
          <ul className="divide-y divide-border border-y border-border">
            {data.campaigns.map((c) => (
              <li key={c.id} className="py-3.5 space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{c.subject}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {new Date(c.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 text-xs text-muted-foreground">
                    {c.queued > 0 && (
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {c.queued}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 text-green-600">
                      <CheckCircle2 className="w-3.5 h-3.5" /> {c.sent}
                    </span>
                    {c.failed > 0 && (
                      <span className="inline-flex items-center gap-1 text-red-600">
                        <XCircle className="w-3.5 h-3.5" /> {c.failed}
                      </span>
                    )}
                  </div>
                </div>
                <div className="h-1 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-accent transition-all"
                    style={{ width: `${percent(c)}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Subscribers
        </h2>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : data.subscribers.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No subscribers yet. Share the signup link to grow your list.
          </p>
        ) : (
            <div className="rounded-2xl border border-border bg-card">
              <div ref={subscribersRef} className="max-h-96 overflow-auto">
                <div
                  className="relative w-full"
                  style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
                >
                  {rowVirtualizer.getVirtualItems().map((vi) => {
                    const s = data.subscribers[vi.index];
                    return (
                      <div
                        key={s.id}
                        data-index={vi.index}
                        ref={rowVirtualizer.measureElement}
                        className="absolute top-0 left-0 w-full border-b border-border last:border-b-0"
                        style={{ transform: `translateY(${vi.start}px)` }}
                      >
                        <div className="px-5 py-3 flex items-center justify-between gap-4">
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">
                              {s.name || s.email}
                              {s.unsubscribed && (
                                <span className="ml-2 inline-block rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                                  Unsubscribed
                                </span>
                              )}
                            </p>
                            {s.name && <p className="mt-0.5 text-xs text-muted-foreground truncate">{s.email}</p>}
                          </div>
                          <div className="flex items-center gap-3 shrink-0 text-xs text-muted-foreground">
                            {s.acceptedTerms ? (
                              <span className="inline-flex items-center gap-1 text-green-600" title="Accepted terms">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Terms
                              </span>
                            ) : null}
                            <span>
                              {new Date(s.createdAt).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
        )}
      </div>
    </div>
  );
}