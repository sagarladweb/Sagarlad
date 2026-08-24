"use client";

import { useMemo, useState } from "react";
import { Send, Loader2, Trash2, Plus, Save, MailCheck } from "lucide-react";
import {
  BRAND_ACCENTS,
  buildTemplateBody,
  emailShell,
  emptyNewsletter,
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

const labelCls = "block text-xs font-semibold text-foreground";
const inputCls =
  "mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20 placeholder:text-muted-foreground/60";

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
    seed?.content ?? { ...emptyNewsletter }
  );
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [sending, setSending] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);

  function update(patch: Partial<NewsletterContent>) {
    setContent((c) => ({ ...c, ...patch }));
  }

  function setSection(i: number, patch: Partial<{ heading: string; body: string }>) {
    setContent((c) => ({
      ...c,
      sections: c.sections.map((s, idx) => (idx === i ? { ...s, ...patch } : s)),
    }));
  }

  function addSection() {
    setContent((c) => ({ ...c, sections: [...c.sections, { ...SECTION_EMPTY }] }));
  }

  function removeSection(i: number) {
    setContent((c) => ({ ...c, sections: c.sections.filter((_, idx) => idx !== i) }));
  }

  function addInserted(item: InsertItem, kind: InsertKind) {
    const section =
      kind === "quote"
        ? { heading: "Quote", body: `"${item.title}"\n\nBrowse all quotes: ${item.url}` }
        : {
            heading: item.title,
            body: `${
              { post: "Read the blog", video: "Watch the video", book: "Get the book", read: "I read this" }[kind]
            }: ${item.title} — ${item.url}`,
          };
    setContent((c) => ({ ...c, sections: [...c.sections, section] }));
  }

  const bodyHtml = useMemo(
    () => buildTemplateBody(content.template, content),
    [content]
  );
  const previewHtml = useMemo(
    () => emailShell(SITE.name, bodyHtml, `/api/newsletter/unsubscribe?token=preview`),
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
        setStatus({ ok: false, text: result.error ?? "Could not save draft." });
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
        body: JSON.stringify({ subject: subject.trim(), html: bodyHtml.trim() }),
      });
      const result = await res.json().catch(() => ({}));
      if (res.ok) {
        setStatus({ ok: true, text: `Test email sent to ${result.to}. Check your inbox.` });
      } else {
        setStatus({ ok: false, text: result.error ?? "Test send failed." });
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
        setContent({ ...emptyNewsletter });
        setDraftId(null);
        setStatus(null);
        onSent(result.queued, result.sentNow, result.remainingToday);
      } else {
        setStatus({ ok: false, text: result.error ?? "Failed to send." });
      }
    } finally {
      setSending(false);
    }
  }

  return (
    <div>
      {status && (
        <p
          role={status.ok ? "status" : "alert"}
          className={`mb-4 text-sm ${status.ok ? "text-green-600" : "text-red-600"}`}
        >
          {status.text}
        </p>
      )}

      <form onSubmit={send} noValidate className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_minmax(0,1fr)]">
        {/* ------------------------------ Left: content ------------------------------ */}
        <div className="space-y-6">
          <div>
            <label htmlFor="nl-subject" className={labelCls}>
              Subject
            </label>
            <input
              id="nl-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="The lesson nobody teaches about money"
              maxLength={200}
              className={`${inputCls} font-display text-lg`}
            />
          </div>

          <div>
            <label className={labelCls}>Preheader</label>
            <input
              value={content.preheader}
              onChange={(e) => update({ preheader: e.target.value })}
              placeholder="The snippet shown after the subject in the inbox — leave blank to use your opening"
              maxLength={150}
              className={inputCls}
            />
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-border pb-6">
            <span className={labelCls}>Template</span>
            <div className="flex rounded-full border border-border bg-muted/40 p-1">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => update({ template: t.id as TemplateId })}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                    content.template === t.id
                      ? "bg-foreground text-background shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>
            <span className={`${labelCls} ml-1`}>Brand colour</span>
            <div className="flex items-center gap-1.5 rounded-full border border-border bg-muted/40 p-1">
              {BRAND_ACCENTS.map((a) => (
                <button
                  key={a.value}
                  type="button"
                  onClick={() => update({ accent: a.value })}
                  aria-pressed={content.accent === a.value}
                  title={a.name}
                  className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition-colors ${
                    content.accent === a.value
                      ? "bg-foreground text-background shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span
                    className="inline-block h-3 w-3 rounded-full border border-black/10"
                    style={{ background: a.value }}
                  />
                  {a.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={labelCls}>Greeting</label>
            <input
              value={content.greeting}
              onChange={(e) => update({ greeting: e.target.value })}
              placeholder="Hi there,"
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Opening</label>
            <textarea
              value={content.intro}
              onChange={(e) => update({ intro: e.target.value })}
              placeholder="Start with the one idea this letter is about. Blank line = new paragraph."
              rows={4}
              className={`${inputCls} resize-y`}
            />
          </div>

          {content.sections.map((s, i) => (
            <div key={i} className="space-y-2">
              <div className="flex items-center justify-between">
                <label className={labelCls}>Section {i + 1}</label>
                <button
                  type="button"
                  onClick={() => removeSection(i)}
                  aria-label="Remove section"
                  className="p-1 rounded-md text-muted-foreground hover:text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <input
                value={s.heading}
                onChange={(e) => setSection(i, { heading: e.target.value })}
                placeholder="Section heading"
                className={inputCls}
              />
              <textarea
                value={s.body}
                onChange={(e) => setSection(i, { body: e.target.value })}
                placeholder="Write the section body…"
                rows={3}
                className={`${inputCls} resize-y`}
              />
            </div>
          ))}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={addSection}
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-border px-3 py-2.5 text-sm font-medium text-muted-foreground hover:border-accent hover:text-accent"
            >
              <Plus className="w-4 h-4" /> Add section
            </button>
            {insert && (
              <InsertContentPicker
                items={insert}
                label="Insert content"
                onInsert={addInserted}
              />
            )}
          </div>

          <div>
            <label className={labelCls}>Sign-off</label>
            <textarea
              value={content.signoff}
              onChange={(e) => update({ signoff: e.target.value })}
              rows={2}
              className={`${inputCls} resize-y`}
            />
          </div>
        </div>

        {/* ------------------------------ Right: preview + actions ------------------------------ */}
        <div className="lg:sticky lg:top-6 lg:self-start space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Preview</p>
            <div className="flex rounded-full border border-border bg-muted/40 p-1">
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
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    device === d
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border bg-muted/40 p-3">
            <div
              className={`mx-auto overflow-hidden rounded-xl border border-border bg-white shadow-sm transition-all duration-300 ${
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

          <div className="rounded-2xl border border-border bg-card p-5">
            {confirming ? (
              <div>
                <p className="text-sm font-semibold">
                  Send to all {subscriberCount} subscriber{subscriberCount === 1 ? "" : "s"}?
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  This broadcasts now and can&apos;t be undone. Queued sends respect
                  the 300/day Brevo limit.
                </p>
                <div className="mt-4 flex gap-2">
                  <button
                    type="submit"
                    disabled={sending}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-accent text-accent-foreground px-4 py-2.5 text-sm font-semibold disabled:opacity-50 hover:opacity-90"
                  >
                    {sending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    {sending ? "Sending…" : "Send now"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirming(false)}
                    disabled={sending}
                    className="rounded-full border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground"
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
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent text-accent-foreground px-6 py-3 text-sm font-semibold disabled:opacity-40 hover:opacity-90"
                >
                  <Send className="w-4 h-4" />
                  Send newsletter
                </button>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={sendTest}
                    disabled={testing || !ready}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:border-accent disabled:opacity-40"
                  >
                    {testing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <MailCheck className="w-4 h-4" />
                    )}
                    {testing ? "Sending…" : "Test send"}
                  </button>
                  <button
                    type="button"
                    onClick={saveDraft}
                    disabled={saving}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:border-accent disabled:opacity-40"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {draftId ? "Update draft" : "Save draft"}
                  </button>
                </div>
                <p className="mt-3 text-center text-xs text-muted-foreground">
                  Sends to <span className="font-semibold text-foreground">{subscriberCount}</span> active
                  subscriber{subscriberCount === 1 ? "" : "s"} · Brevo 300/day, overflow queues automatically.
                </p>
                {!ready && (
                  <p className="mt-1 text-center text-xs text-muted-foreground">
                    Add a subject and opening to enable sending.
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}