"use client";

import { useMemo, useState } from "react";
import {
  Send,
  Loader2,
  Trash2,
  Plus,
  Save,
  MailCheck,
  ChevronDown,
  ChevronRight,
  Eye,
  Pencil,
} from "lucide-react";
import {
  BRAND_ACCENTS,
  buildTemplateBody,
  emailShell,
  defaultNewsletter,
  TEMPLATES,
  type NewsletterContent,
  type TemplateId,
} from "@/lib/newsletterTemplates";
import { SITE } from "@/lib/site";
import {
  InsertContentPicker,
  type InsertItem,
  type InsertKind,
} from "@/components/admin/InsertContentPicker";
import { NewsletterTiptapEditor } from "@/components/admin/NewsletterTiptapEditor";

export type { InsertItem } from "@/components/admin/InsertContentPicker";

type Props = {
  subscriberCount: number;
  onSent: (queued: number, sentNow: number, remainingToday: number) => void;
  onError: (text: string) => void;
  onStatus?: (text: string) => void;
  seed?: { subject: string; content: NewsletterContent } | null;
  insert?: {
    posts: InsertItem[];
    videos: InsertItem[];
    books: InsertItem[];
    read: InsertItem[];
    quotes: InsertItem[];
  };
};

const inputCls =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20 placeholder:text-muted-foreground/50";
const labelCls = "block text-xs font-medium text-muted-foreground mb-1";
const SECTION_EMPTY = { heading: "", body: "" };

export function NewsletterComposer({
  subscriberCount,
  onSent,
  onStatus,
  seed,
  insert,
}: Props) {
  const [subject, setSubject] = useState(seed?.subject ?? "");
  const [content, setContent] = useState<NewsletterContent>(
    seed?.content ?? { ...defaultNewsletter }
  );
  const [sending, setSending] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(
    null
  );
  const [view, setView] = useState<"edit" | "preview">("edit");
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [detailsOpen, setDetailsOpen] = useState(false);

  function update(patch: Partial<NewsletterContent>) {
    setContent((c) => ({ ...c, ...patch }));
  }

  function setSection(
    i: number,
    patch: Partial<{ heading: string; body: string }>
  ) {
    setContent((c) => ({
      ...c,
      sections: c.sections.map((s, idx) =>
        idx === i ? { ...s, ...patch } : s
      ),
    }));
  }

  function addSection() {
    setContent((c) => ({
      ...c,
      sections: [...c.sections, { ...SECTION_EMPTY }],
    }));
  }

  function removeSection(i: number) {
    setContent((c) => ({
      ...c,
      sections: c.sections.filter((_, idx) => idx !== i),
    }));
  }

  function addInserted(item: InsertItem, kind: InsertKind) {
    const section =
      kind === "quote"
        ? {
            heading: "Quote",
            body: `"${item.title}"\n\nBrowse all quotes: ${item.url}`,
          }
        : {
            heading: item.title,
            body: `${
              {
                post: "Read the blog",
                video: "Watch the video",
                book: "Get the book",
                read: "I read this",
              }[kind]
            }: ${item.title} — ${item.url}`,
          };
    setContent((c) => ({ ...c, sections: [...c.sections, section] }));
  }

  const editorContent = useMemo(() => {
    const parts: string[] = [];
    if (content.greeting)
      parts.push(`<p><strong>${content.greeting}</strong></p>`);
    if (content.intro)
      parts.push(
        content.intro
          .split("\n\n")
          .map((p) => `<p>${p.replace(/\n/g, "<br/>")}</p>`)
          .join("")
      );
    content.sections.forEach((s) => {
      if (s.heading) parts.push(`<h2>${s.heading}</h2>`);
      if (s.body)
        parts.push(
          s.body
            .split("\n\n")
            .map((p) => `<p>${p.replace(/\n/g, "<br/>")}</p>`)
            .join("")
        );
    });
    if (content.quote) {
      parts.push(
        `<blockquote><p>"${content.quote.text}"</p>${
          content.quote.author
            ? `<p>— ${content.quote.author}</p>`
            : ""
        }</blockquote>`
      );
    }
    if (content.cta) {
      parts.push(
        `<div data-type="cta-button" label="${content.cta.label}" url="${content.cta.url}"></div>`
      );
    }
    if (content.signoff)
      parts.push(
        content.signoff
          .split("\n\n")
          .map((p) => `<p>${p.replace(/\n/g, "<br/>")}</p>`)
          .join("")
      );
    return parts.join("");
  }, [content]);

  const handleEditorChange = (html: string) => {
    setContent((c) => ({ ...c, intro: html }));
  };

  const bodyHtml = useMemo(
    () => buildTemplateBody(content.template, content),
    [content]
  );
  const previewHtml = useMemo(
    () =>
      emailShell(
        SITE.name,
        bodyHtml,
        `/api/newsletter/unsubscribe?token=preview`
      ),
    [bodyHtml]
  );

  const ready = subject.trim().length >= 3 && content.intro.trim().length > 0;

  async function saveDraft() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/newsletter/drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: draftId ?? undefined, subject, content }),
      });
      const result = await res.json().catch(() => ({}));
      if (res.ok) {
        setDraftId(result.campaign.id);
        setStatus({ ok: true, text: "Draft saved." });
        onStatus?.("draft-saved");
      } else {
        setStatus({
          ok: false,
          text: result.error ?? "Could not save draft.",
        });
      }
    } finally {
      setSaving(false);
    }
  }

  async function sendTest() {
    setTesting(true);
    try {
      const res = await fetch("/api/admin/newsletter/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: subject.trim(),
          html: bodyHtml.trim(),
        }),
      });
      const result = await res.json().catch(() => ({}));
      if (res.ok) {
        setStatus({
          ok: true,
          text: `Test email sent to ${result.to}. Check your inbox.`,
        });
      } else {
        setStatus({
          ok: false,
          text: result.error ?? "Test send failed.",
        });
      }
    } finally {
      setTesting(false);
    }
  }

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!ready || !confirming) return;
    setSending(true);
    setConfirming(false);
    try {
      const res = await fetch("/api/admin/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: subject.trim(),
          html: bodyHtml.trim(),
          contentJson: content,
        }),
      });
      const result = await res.json().catch(() => ({}));
      if (res.ok) {
        setSubject("");
        setContent({ ...defaultNewsletter });
        setDraftId(null);
        setStatus(null);
        onSent(result.queued, result.sentNow, result.remainingToday);
      } else {
        setStatus({
          ok: false,
          text: result.error ?? "Failed to send.",
        });
      }
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Status banner */}
      {status && (
        <div
          role={status.ok ? "status" : "alert"}
          className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm ${
            status.ok
              ? "border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950 dark:text-green-400"
              : "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400"
          }`}
        >
          {status.text}
        </div>
      )}

      <form onSubmit={send} noValidate>
        {/* Subject */}
        <input
          id="nl-subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Subject line"
          maxLength={200}
          className="w-full border-0 border-b border-border bg-transparent px-0 py-3 text-lg font-semibold text-foreground outline-none placeholder:text-muted-foreground/40 focus:border-accent focus:ring-0"
        />

        {/* Template + Accent row */}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Style
            </span>
            <div className="flex rounded-lg border border-border bg-muted/30 p-0.5">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => update({ template: t.id as TemplateId })}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                    content.template === t.id
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          <div className="h-4 w-px bg-border" />

          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Colour
            </span>
            <div className="flex gap-1">
              {BRAND_ACCENTS.map((a) => (
                <button
                  key={a.value}
                  type="button"
                  onClick={() => update({ accent: a.value })}
                  aria-pressed={content.accent === a.value}
                  title={a.name}
                  className={`h-6 w-6 rounded-full border-2 transition-all ${
                    content.accent === a.value
                      ? "border-foreground scale-110"
                      : "border-border hover:border-muted-foreground/50"
                  }`}
                  style={{ background: a.value }}
                />
              ))}
            </div>
          </div>

          <div className="h-4 w-px bg-border" />

          {/* View toggle */}
          <div className="flex rounded-lg border border-border bg-muted/30 p-0.5">
            <button
              type="button"
              onClick={() => setView("edit")}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                view === "edit"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Pencil className="h-3 w-3" />
              Edit
            </button>
            <button
              type="button"
              onClick={() => setView("preview")}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                view === "preview"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Eye className="h-3 w-3" />
              Preview
            </button>
          </div>
        </div>

        {view === "edit" ? (
          <div className="mt-5 space-y-4">
            {/* Editor */}
            <NewsletterTiptapEditor
              content={editorContent}
              onChange={handleEditorChange}
              placeholder="Start writing your newsletter…"
            />

            {/* Quick actions */}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={addSection}
                className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:border-accent hover:text-accent"
              >
                <Plus className="h-3 w-3" /> Section
              </button>
              {insert && (
                <InsertContentPicker
                  items={insert}
                  label="Insert content"
                  onInsert={addInserted}
                />
              )}
            </div>

            {/* Collapsible details */}
            <div className="rounded-xl border border-border">
              <button
                type="button"
                onClick={() => setDetailsOpen((o) => !o)}
                className="flex w-full items-center gap-2 px-4 py-3 text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
              >
                {detailsOpen ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
                Details
                <span className="text-xs text-muted-foreground">
                  (preheader, greeting, sign-off, quote, CTA)
                </span>
              </button>

              {detailsOpen && (
                <div className="space-y-4 border-t border-border px-4 py-4">
                  {/* Preheader */}
                  <div>
                    <label className={labelCls}>Preheader</label>
                    <input
                      value={content.preheader}
                      onChange={(e) =>
                        update({ preheader: e.target.value })
                      }
                      placeholder="Inbox preview snippet — leave blank to use opening text"
                      maxLength={150}
                      className={inputCls}
                    />
                  </div>

                  {/* Greeting + Signoff */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Greeting</label>
                      <input
                        value={content.greeting}
                        onChange={(e) =>
                          update({ greeting: e.target.value })
                        }
                        placeholder="Hi there,"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Sign-off</label>
                      <input
                        value={content.signoff}
                        onChange={(e) =>
                          update({ signoff: e.target.value })
                        }
                        placeholder="Warm regards,"
                        className={inputCls}
                      />
                    </div>
                  </div>

                  {/* Quote */}
                  <div>
                    <div className="flex items-center justify-between">
                      <label className={labelCls}>Quote</label>
                      {content.quote && (
                        <button
                          type="button"
                          onClick={() => update({ quote: null })}
                          className="text-muted-foreground hover:text-red-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                    {content.quote ? (
                      <div className="space-y-2">
                        <input
                          value={content.quote.text}
                          onChange={(e) =>
                            update({
                              quote: {
                                ...content.quote!,
                                text: e.target.value,
                              },
                            })
                          }
                          placeholder="Quote text"
                          className={inputCls}
                        />
                        <input
                          value={content.quote.author}
                          onChange={(e) =>
                            update({
                              quote: {
                                ...content.quote!,
                                author: e.target.value,
                              },
                            })
                          }
                          placeholder="Author (optional)"
                          className={inputCls}
                        />
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          update({ quote: { text: "", author: "" } })
                        }
                        className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:border-accent hover:text-accent"
                      >
                        <Plus className="h-3 w-3" /> Add quote
                      </button>
                    )}
                  </div>

                  {/* CTA */}
                  <div>
                    <div className="flex items-center justify-between">
                      <label className={labelCls}>Call to action</label>
                      {content.cta && (
                        <button
                          type="button"
                          onClick={() => update({ cta: null })}
                          className="text-muted-foreground hover:text-red-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                    {content.cta ? (
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          value={content.cta.label}
                          onChange={(e) =>
                            update({
                              cta: {
                                ...content.cta!,
                                label: e.target.value,
                              },
                            })
                          }
                          placeholder="Button text"
                          className={inputCls}
                        />
                        <input
                          value={content.cta.url}
                          onChange={(e) =>
                            update({
                              cta: {
                                ...content.cta!,
                                url: e.target.value,
                              },
                            })
                          }
                          placeholder="https://…"
                          className={inputCls}
                        />
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          update({ cta: { label: "", url: "" } })
                        }
                        className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:border-accent hover:text-accent"
                      >
                        <Plus className="h-3 w-3" /> Add CTA button
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Preview mode */
          <div className="mt-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex rounded-lg border border-border bg-muted/30 p-0.5">
                {(
                  [
                    ["desktop", "Desktop"],
                    ["mobile", "Mobile"],
                  ] as const
                ).map(([d, label]) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDevice(d)}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                      device === d
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="overflow-hidden rounded-xl border border-border bg-muted/20 p-3">
              <div
                className={`mx-auto overflow-hidden rounded-lg border border-border bg-white shadow-sm transition-all duration-300 ${
                  device === "mobile" ? "max-w-[360px]" : "max-w-[620px]"
                }`}
              >
                <iframe
                  title="Newsletter preview"
                  srcDoc={previewHtml}
                  sandbox=""
                  className="block h-[560px] w-full"
                />
              </div>
            </div>
          </div>
        )}

        {/* Action bar */}
        <div className="mt-6 flex items-center gap-3 border-t border-border pt-5">
          {confirming ? (
            <div className="flex flex-1 items-center gap-3">
              <p className="text-sm text-foreground">
                Send to{" "}
                <span className="font-semibold">{subscriberCount}</span>{" "}
                subscriber{subscriberCount === 1 ? "" : "s"}?
              </p>
              <div className="ml-auto flex gap-2">
                <button
                  type="submit"
                  disabled={sending}
                  className="inline-flex items-center gap-2 rounded-full bg-accent text-accent-foreground px-5 py-2 text-sm font-semibold disabled:opacity-50 hover:opacity-90"
                >
                  {sending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  {sending ? "Sending…" : "Confirm send"}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirming(false)}
                  disabled={sending}
                  className="rounded-full border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <button
                type="button"
                disabled={!ready}
                onClick={() => setConfirming(true)}
                className="inline-flex items-center gap-2 rounded-full bg-accent text-accent-foreground px-5 py-2.5 text-sm font-semibold disabled:opacity-40 hover:opacity-90"
              >
                <Send className="h-4 w-4" />
                Send
              </button>
              <button
                type="button"
                onClick={sendTest}
                disabled={testing || !ready}
                className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-40"
              >
                {testing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <MailCheck className="h-4 w-4" />
                )}
                Test
              </button>
              <button
                type="button"
                onClick={saveDraft}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-40"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {draftId ? "Update draft" : "Draft"}
              </button>
              <span className="ml-auto text-xs text-muted-foreground">
                {subscriberCount} subscriber
                {subscriberCount === 1 ? "" : "s"}
              </span>
            </>
          )}
        </div>
      </form>
    </div>
  );
}
