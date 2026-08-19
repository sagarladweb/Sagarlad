"use client";

import { useMemo, useState } from "react";
import {
  Send,
  Loader2,
  Trash2,
  Plus,
  Save,
  MailCheck,
  Eye,
} from "lucide-react";
import {
  buildTemplateBody,
  emailShell,
  emptyNewsletter,
  TEMPLATES,
  type NewsletterContent,
  type TemplateId,
} from "@/lib/newsletterTemplates";
import { SITE } from "@/lib/site";

export type InsertItem = { title: string; url: string };

type Props = {
  subscriberCount: number;
  onSent: (queued: number, sentNow: number, remainingToday: number) => void;
  onError: (text: string) => void;
  onStatus?: (text: string) => void;
  seed?: { subject: string; content: NewsletterContent } | null;
  insert?: { posts: InsertItem[]; videos: InsertItem[]; books: InsertItem[] };
};

const inputCls =
  "rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-colors w-full";
const labelCls =
  "block text-[11px] font-semibold uppercase tracking-widest text-muted-foreground";

const SECTION_EMPTY = { heading: "", body: "" };

export function NewsletterComposer({
  subscriberCount,
  onSent,
  onError,
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

  function addInserted(item: InsertItem, kind: string) {
    setContent((c) => ({
      ...c,
      sections: [
        ...c.sections,
        {
          heading: item.title,
          body: `Read the ${kind}: ${item.title} — ${item.url}`,
        },
      ],
    }));
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
      {/* Inbox preview line */}
      <div className="mb-6 rounded-2xl border border-border bg-card px-5 py-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Inbox preview
        </p>
        <p className="mt-1.5 text-sm text-foreground truncate">
          <span className="font-bold">{subject.trim() || "Your subject line…"}</span>
          <span className="text-muted-foreground">
            {" "}
            —{" "}
            {(content.preheader.trim() ||
              content.intro.trim().replace(/\s+/g, " ").slice(0, 90) ||
              "Your opening line…")}
          </span>
        </p>
      </div>

      {status && (
        <p
          role={status.ok ? "status" : "alert"}
          className={`mb-4 text-sm ${status.ok ? "text-green-600" : "text-red-600"}`}
        >
          {status.text}
        </p>
      )}

      <form onSubmit={send} noValidate className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_minmax(0,1fr)]">
        {/* ------------------------------ Left: content ------------------------------ */}
        <div className="space-y-5">
          <div>
            <label className={labelCls}>Template</label>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => update({ template: t.id as TemplateId })}
                  title={t.tagline}
                  className={`rounded-xl border p-3 text-left transition-colors ${
                    content.template === t.id
                      ? "border-accent ring-2 ring-accent/20"
                      : "border-border hover:border-accent/50"
                  }`}
                >
                  <span
                    className="block h-1.5 w-8 rounded-full"
                    style={{ background: t.swatch }}
                  />
                  <span className="mt-2 block text-xs font-semibold">{t.name}</span>
                  <span className="mt-0.5 block text-[10px] text-muted-foreground leading-tight">
                    {t.tagline}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="nl-subject" className={labelCls}>
              Subject line <span className="text-red-500">*</span>
            </label>
            <input
              id="nl-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="The lesson nobody teaches about money"
              maxLength={200}
              className={`${inputCls} mt-2 font-display text-base`}
            />
            <p className="mt-1 text-right text-[11px] text-muted-foreground">{subject.length}/200</p>
          </div>

          <div>
            <label className={labelCls}>Preheader</label>
            <input
              value={content.preheader}
              onChange={(e) => update({ preheader: e.target.value })}
              placeholder="The snippet shown after the subject in the inbox"
              maxLength={150}
              className={`${inputCls} mt-2`}
            />
            <p className="mt-1 text-right text-[11px] text-muted-foreground">
              {content.preheader.length}/150
            </p>
          </div>

          <div>
            <label className={labelCls}>Greeting</label>
            <input
              value={content.greeting}
              onChange={(e) => update({ greeting: e.target.value })}
              placeholder="Hi there,"
              className={`${inputCls} mt-2`}
            />
          </div>

          <div>
            <label className={labelCls}>
              Opening <span className="text-red-500">*</span>
            </label>
            <textarea
              value={content.intro}
              onChange={(e) => update({ intro: e.target.value })}
              placeholder="Start with the one idea this letter is about. Blank line = new paragraph."
              rows={4}
              className={`${inputCls} mt-2 resize-y`}
            />
          </div>

          {content.sections.map((s, i) => (
            <div key={i} className="space-y-2">
              <div className="flex items-center justify-between">
                <p className={labelCls}>Section {i + 1}</p>
                <button
                  type="button"
                  onClick={() => removeSection(i)}
                  aria-label="Remove section"
                  className="p-1 rounded-md text-muted-foreground hover:text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
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

          <button
            type="button"
            onClick={addSection}
            className="inline-flex items-center gap-1.5 w-full justify-center rounded-xl border border-dashed border-border px-3 py-2.5 text-sm font-medium text-muted-foreground hover:border-accent hover:text-accent"
          >
            <Plus className="w-4 h-4" /> Add section
          </button>

          {insert && (insert.posts.length > 0 || insert.videos.length > 0 || insert.books.length > 0) && (
            <div className="rounded-2xl border border-border bg-card p-4">
              <p className={labelCls}>Insert recent content</p>
              <p className="mt-1 text-xs text-muted-foreground">
                One click adds a section linking current site content — keeps the
                letter fresh and on-brand.
              </p>
              {(["posts", "videos", "books"] as const).map((k) => (
                <div key={k} className="mt-3">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground capitalize">
                    {k === "posts" ? "Latest posts" : k === "videos" ? "Latest videos" : "Latest books"}
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {insert[k].map((item) => (
                      <button
                        key={item.url}
                        type="button"
                        onClick={() => addInserted(item, k === "posts" ? "post" : k === "videos" ? "video" : "book")}
                        className="rounded-full border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground hover:border-accent hover:text-accent"
                      >
                        + {item.title}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div>
            <label className={labelCls}>Sign-off</label>
            <textarea
              value={content.signoff}
              onChange={(e) => update({ signoff: e.target.value })}
              rows={2}
              className={`${inputCls} mt-2 resize-y`}
            />
          </div>
        </div>

        {/* ------------------------------ Right: live preview ------------------------------ */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          <div className="flex items-center justify-between gap-3 mb-3">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Live preview
            </p>
            <div className="flex gap-1 rounded-full border border-border bg-card p-1">
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

          <div className="overflow-hidden rounded-2xl border border-border bg-muted/40 p-4">
            <div
              className={`mx-auto overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition-all duration-300 ${
                device === "mobile" ? "max-w-[380px]" : "max-w-[640px]"
              }`}
            >
              <div className="flex items-center gap-2 border-b border-border bg-card px-4 py-2.5">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
                <span className="ml-2 truncate text-[11px] text-muted-foreground">
                  sagarlad.com/newsletter
                </span>
              </div>
              <iframe
                title="Newsletter preview"
                srcDoc={previewHtml}
                sandbox=""
                className="block h-[560px] w-full bg-[#ffffff]"
              />
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-border bg-card p-5">
            <p className="text-xs text-muted-foreground">
              Sends to <span className="font-semibold text-foreground">{subscriberCount}</span> active
              subscriber{subscriberCount === 1 ? "" : "s"} on the free Brevo plan (300/day). Bigger
              lists queue and deliver automatically over the following days.
            </p>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={saveDraft}
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:text-foreground hover:border-accent disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {draftId ? "Update draft" : "Save draft"}
              </button>
              <button
                type="button"
                onClick={sendTest}
                disabled={testing || !ready}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:text-foreground hover:border-accent disabled:opacity-50"
              >
                {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <MailCheck className="w-4 h-4" />}
                {testing ? "Sending test…" : "Send test to me"}
              </button>
            </div>

            {confirming ? (
              <div className="mt-4 rounded-xl border border-accent/40 bg-accent/10 p-4">
                <p className="text-sm font-semibold">
                  Send to all {subscriberCount} subscriber{subscriberCount === 1 ? "" : "s"}?
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  This broadcasts now and can&apos;t be undone. Queued sends respect
                  the 300/day Brevo limit.
                </p>
                <div className="mt-3 flex gap-2">
                  <button
                    type="submit"
                    disabled={sending}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-accent text-accent-foreground px-4 py-2.5 text-sm font-semibold disabled:opacity-50 hover:opacity-90 transition-opacity"
                  >
                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    {sending ? "Sending…" : "Yes, send it"}
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
              <button
                type="button"
                disabled={!ready}
                onClick={() => setConfirming(true)}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent text-accent-foreground px-6 py-3 text-sm font-semibold disabled:opacity-50 hover:opacity-90 transition-opacity"
              >
                <Eye className="w-4 h-4" />
                Review &amp; send
              </button>
            )}
            {!ready && (
              <p className="mt-2 text-center text-[11px] text-muted-foreground">
                Add a subject and opening to enable sending.
              </p>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}