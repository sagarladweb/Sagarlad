"use client";

import { useMemo, useState, useCallback, useRef, useEffect } from "react";
import {
  Send, Loader2, Trash2, Save, MailCheck, X, ArrowLeft,
  PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen,
  Plus, GripVertical,
  Type, Heading2, AlignLeft, List, ListOrdered, ImageIcon,
  Code, Minus, Columns2, MousePointerClick, Quote, Share2,
  ChevronUp, ChevronDown, Pencil, Table2,
} from "lucide-react";
import {
  BRAND_ACCENTS, buildTemplateBody, emailShell, defaultNewsletter,
  TEMPLATES, PREBUILT_LAYOUTS, type NewsletterContent, type TemplateId, type LayoutId,
} from "@/lib/newsletterTemplates";
import {
  getTemplates, saveTemplate, deleteTemplate, updateTemplate, type SavedTemplate,
} from "@/lib/newsletterTemplateStore";
import { SITE } from "@/lib/site";
import {
  InsertContentPicker, type InsertItem, type InsertKind,
} from "@/components/admin/InsertContentPicker";
import { CodeEditor } from "@/components/ui/CodeEditor";
import { showPrompt } from "@/components/admin/ConfirmDialog";

export type { InsertItem } from "@/components/admin/InsertContentPicker";

type Props = {
  subscriberCount: number;
  onSent: (queued: number, sentNow: number, remainingToday: number) => void;
  onBack?: () => void;
  onDirtyChange?: (dirty: boolean) => void;
  seed?: { subject: string; content: NewsletterContent; draftId?: string } | null;
  insert?: { posts: InsertItem[]; videos: InsertItem[]; books: InsertItem[]; read: InsertItem[]; ebooks: InsertItem[]; quotes: InsertItem[] };
  dbQuotes?: { id: string; text: string; tag: string | null }[];
  dbSocials?: { id: string; key: string; label: string; href: string; handle: string | null; color: string | null; logoUrl?: string | null }[];
};

const inputCls = "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/15 placeholder:text-muted-foreground/40";
const textareaCls = `${inputCls} resize-none`;
const labelCls = "block text-[11px] font-medium text-muted-foreground mb-1.5 tracking-wide";
const sectionHeaderCls = "text-[9px] font-semibold uppercase tracking-widest text-muted-foreground/40 px-1 mb-1.5";
const blockItemCls = "flex items-center gap-2 rounded-lg border border-border/40 px-2 py-2 cursor-grab active:cursor-grabbing hover:border-border hover:bg-muted/30 transition-all group select-none";
const smallBtnCls = "rounded-md border border-border/50 px-2 py-1 text-[10px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors";

/* ── Helpers ────────────────────────────────────────── */
function safeParse<T>(body: string, fallback: T): T { try { return JSON.parse(body); } catch { return fallback; } }
function resetContentValue() { return { ...defaultNewsletter, greeting: "", intro: "", sections: [], quote: null, cta: null, socials: [] as NewsletterContent["socials"] }; }

/* ── Block definitions ───────────────────────────────── */
const BLOCKS = [
  { id: "section",      label: "Section",       icon: Type,       hint: "Heading + text" },
  { id: "heading",      label: "Heading",       icon: Heading2,   hint: "Large title" },
  { id: "text",         label: "Text",          icon: AlignLeft,  hint: "Paragraph" },
  { id: "image",        label: "Image",         icon: ImageIcon,  hint: "URL or upload" },
  { id: "button",       label: "Button",        icon: MousePointerClick, hint: "CTA link" },
  { id: "quote",        label: "Quote",         icon: Quote,      hint: "Attributed text" },
  { id: "table",        label: "Table",         icon: Table2,     hint: "Rows & columns" },
  { id: "divider",      label: "Divider",       icon: Minus,      hint: "Horizontal line" },
  { id: "spacer",       label: "Spacer",        icon: Minus,      hint: "Empty space" },
  { id: "columns",      label: "2 Columns",     icon: Columns2,   hint: "Side by side" },
  { id: "list",         label: "List",          icon: List,       hint: "Bullet points" },
  { id: "ordered-list", label: "Ordered List",  icon: ListOrdered, hint: "Numbered items" },
  { id: "code",         label: "Code",          icon: Code,       hint: "HTML/CSS/JS block" },
  { id: "blog",         label: "Blog Post",     icon: AlignLeft,  hint: "Link a blog post" },
  { id: "video",        label: "Video",         icon: ImageIcon,  hint: "Embed a video" },
  { id: "book",         label: "Book",          icon: AlignLeft,  hint: "Recommend a book" },
  { id: "social",       label: "Social Links",  icon: Share2,     hint: "Social icons" },
] as const;

/* ── Section types ───────────────────────────────────── */
type SectionKind = "heading" | "text" | "image" | "button" | "quote" | "divider" | "spacer" | "columns" | "list" | "ordered-list" | "code" | "blog" | "video" | "book" | "social" | "table";

function sectionKind(s: { heading: string; body: string }): SectionKind {
  if (s.body === "---") return "divider";
  if (s.body === "\n\n") return "spacer";
  if (s.heading === "__CODE__") return "code";
  if (s.heading === "__SOCIAL__") return "social";
  if (s.heading === "__QUOTE__") return "quote";
  if (s.heading === "__BLOG__") return "blog";
  if (s.heading === "__VIDEO__") return "video";
  if (s.heading === "__BOOK__") return "book";
  if (s.heading === "__TABLE__") return "table";
  if (s.heading.startsWith("__COL_LEFT__")) return "columns";
  if (s.heading.startsWith("__COL_RIGHT__")) return "columns";
  if (s.body.includes("[Image") || s.body.startsWith("https://images.unsplash.com") || s.body.startsWith("http")) return "image";
  if (s.heading === "" && (s.body.startsWith("- ") || /^[•→✓]\s/.test(s.body))) return "list";
  if (s.heading === "" && s.body.startsWith("1. ")) return "ordered-list";
  if (s.heading === "" && s.body === "") return "heading";
  if (s.heading) return "heading";
  return "text";
}

/* ── Section type icon map ───────────────────────────── */
const SECTION_ICONS: Record<SectionKind, typeof Heading2> = {
  heading: Heading2, text: AlignLeft, image: ImageIcon,
  button: MousePointerClick, quote: Quote, divider: Minus,
  spacer: Minus, columns: Columns2, list: List,
  "ordered-list": ListOrdered, code: Code, blog: AlignLeft,
  video: ImageIcon, book: AlignLeft, social: Share2, table: Table2,
};
function SectionIcon({ kind, className }: { kind: SectionKind; className?: string }) {
  const Icon = SECTION_ICONS[kind];
  return <Icon className={className ?? "w-4 h-4"} />;
}

export function NewsletterComposer({ subscriberCount, onSent, onBack, onDirtyChange, seed, insert, dbQuotes = [], dbSocials = [] }: Props) {
  const [subject, setSubject] = useState(seed?.subject ?? "");
  const [content, setContent] = useState<NewsletterContent>(seed?.content ?? {
    ...defaultNewsletter,
    greeting: "",
    intro: "",
    preheader: "",
    signoff: "",
    quote: null,
    cta: null,
    socials: [],
    sections: [],
  });
  const [sending, setSending] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [draftId, setDraftId] = useState<string | null>(seed?.draftId ?? null);
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(false);
  const [savedTemplates, setSavedTemplates] = useState<SavedTemplate[]>(() => getTemplates());
  const [templateName, setTemplateName] = useState("");
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ title: string; message: string; onConfirm: () => void } | null>(null);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [dropActive, setDropActive] = useState(false);
  const [viewMode, setViewMode] = useState<"edit" | "preview">("edit");
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const dragIdxRef = useRef<number | null>(null);
  const [selectedLayout, setSelectedLayout] = useState<LayoutId | null>(null);
  const [leftTab, setLeftTab] = useState<"blocks" | "layouts">("blocks");

  const dirtyRef = useRef(false);
  const markClean = useCallback(() => { dirtyRef.current = false; onDirtyChange?.(false); }, [onDirtyChange]);
  const markDirty = useCallback(() => { if (!dirtyRef.current) { dirtyRef.current = true; onDirtyChange?.(true); } }, [onDirtyChange]);

  // Auto-dismiss status after 5 seconds
  const statusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (status) {
      if (statusTimerRef.current) clearTimeout(statusTimerRef.current);
      statusTimerRef.current = setTimeout(() => setStatus(null), 5000);
    }
    return () => { if (statusTimerRef.current) clearTimeout(statusTimerRef.current); };
  }, [status]);

  /* ── localStorage auto-save ────────────────────────── */
  const LS_KEY = "nl_composer_autosave";
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function persistToLocal() {
    try {
      const payload = { subject, content, selectedLayout, draftId, savedAt: Date.now() };
      localStorage.setItem(LS_KEY, JSON.stringify(payload));
    } catch { /* quota exceeded — ignore */ }
  }

  function clearLocalSave() {
    try { localStorage.removeItem(LS_KEY); } catch { /* ignore */ }
  }

  // Expose save & clear for parent
  useEffect(() => {
    (window as any).__nlComposerSave = persistToLocal;
    (window as any).__nlComposerClear = clearLocalSave;
    return () => {
      delete (window as any).__nlComposerSave;
      delete (window as any).__nlComposerClear;
    };
  });

  // Listen for recovery event from parent
  useEffect(() => {
    function onRecover(e: Event) {
      const detail = (e as CustomEvent).detail;
      if (!detail) return;
      if (detail.subject) setSubject(detail.subject);
      if (detail.content) setContent(detail.content);
      if (detail.selectedLayout) setSelectedLayout(detail.selectedLayout);
      if (detail.draftId) setDraftId(detail.draftId);
      markClean();
    }
    window.addEventListener("nl_recover", onRecover);
    return () => window.removeEventListener("nl_recover", onRecover);
  }, [markClean]);

  // Debounced auto-save on every content/subject change
  useEffect(() => {
    if (!dirtyRef.current) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => { persistToLocal(); }, 2000);
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, [subject, content, selectedLayout]);

  /* ── Content mutations ──────────────────────────────── */
  function update(patch: Partial<NewsletterContent>) { setContent((c) => ({ ...c, ...patch })); markDirty(); }

  function insertSection(at: number, section: { heading: string; body: string }) {
    setContent((c) => { const s = [...c.sections]; s.splice(at, 0, section); return { ...c, sections: s }; });
    markDirty();
  }

  function removeSection(i: number) {
    setContent((c) => ({ ...c, sections: c.sections.filter((_, idx) => idx !== i) }));
    setSelectedIdx(null);
    markDirty();
  }

  function setSection(i: number, patch: Partial<{ heading: string; body: string }>) {
    setContent((c) => ({ ...c, sections: c.sections.map((s, idx) => idx === i ? { ...s, ...patch } : s) }));
    markDirty();
  }

  function moveSection(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= content.sections.length) return;
    setContent((c) => { const s = [...c.sections]; [s[i], s[j]] = [s[j], s[i]]; return { ...c, sections: s }; });
    setSelectedIdx(j);
    markDirty();
  }

  function duplicateSection(i: number) {
    const s = content.sections[i];
    insertSection(i + 1, { ...s });
    setSelectedIdx(i + 1);
  }

  function addInserted(item: InsertItem, kind: InsertKind) {
    const at = selectedIdx !== null ? selectedIdx + 1 : content.sections.length;
    const section = (() => {
      switch (kind) {
        case "post":
          return { heading: "__BLOG__", body: JSON.stringify({ title: item.title, url: item.url, excerpt: "", image: item.image || "" }) };
        case "video":
          return { heading: "__VIDEO__", body: JSON.stringify({ title: item.title, url: item.url, thumbnail: item.image || "" }) };
        case "book":
        case "read":
        case "ebook":
          return { heading: "__BOOK__", body: JSON.stringify({ title: item.title, author: "", url: item.url, cover: item.image || "" }) };
        case "quote":
          return { heading: "__QUOTE__", body: JSON.stringify({ text: item.title, author: "" }) };
        default:
          return { heading: item.title, body: item.url };
      }
    })();
    insertSection(at, section);
  }

  /* ── Block insertion ─────────────────────────────────── */
  function insertBlock(type: string) {
    const at = selectedIdx !== null ? selectedIdx + 1 : content.sections.length;
    const newSection = (() => {
      switch (type) {
        case "section":      return { heading: "", body: "" };
        case "heading":      return { heading: "New Heading", body: "" };
        case "text":         return { heading: "", body: "Start writing here…" };
        case "image":        return { heading: "", body: "https://images.unsplash.com/photo-1500964757637-c85e8a162699?w=800&q=80" };
        case "divider":      return { heading: "", body: "---" };
        case "spacer":       return { heading: "", body: "\n\n" };
        case "columns":      { insertSection(at, { heading: "__COL_RIGHT__", body: JSON.stringify({ left: "", right: "", leftTitle: "", rightTitle: "", bulletStyle: "dot" }) }); return { heading: "__COL_LEFT__", body: JSON.stringify({ left: "", right: "", leftTitle: "", rightTitle: "", bulletStyle: "dot" }) }; }
        case "list":         return { heading: "", body: "- Item 1\n- Item 2\n- Item 3" };
        case "ordered-list": return { heading: "", body: "1. First\n2. Second\n3. Third" };
        case "code":         return { heading: "__CODE__", body: "<h2>Hello World</h2>\n<p style=\"color: #6366f1;\">This is a live preview</p>" };
        case "blog":         return { heading: "__BLOG__", body: JSON.stringify({ title: "", url: "", excerpt: "" }) };
        case "video":        return { heading: "__VIDEO__", body: JSON.stringify({ title: "", url: "", thumbnail: "" }) };
        case "book":         return { heading: "__BOOK__", body: JSON.stringify({ title: "", author: "", url: "", cover: "" }) };
        case "button":       update({ cta: content.cta ?? { label: "Click here", url: "https://example.com" } }); return null;
        case "quote":        return { heading: "__QUOTE__", body: JSON.stringify({ text: "Your quote here", author: "Author Name" }) };
        case "social":       return { heading: "__SOCIAL__", body: JSON.stringify({ selected: dbSocials.length > 0 ? dbSocials.slice(0, 3).map((s) => s.key) : ["twitter", "linkedin"] }) };
        case "table":        return { heading: "__TABLE__", body: JSON.stringify({ headerRow: true, rows: [["Header 1", "Header 2", "Header 3"], ["Cell 1", "Cell 2", "Cell 3"], ["Cell 4", "Cell 5", "Cell 6"]] }) };
        default: return null;
      }
    })();
    if (newSection) insertSection(at, newSection);
  }

  /* ── Drag & Drop ────────────────────────────────────── */
  function handleDragStart(e: React.DragEvent, type: string) { e.dataTransfer.setData("text/plain", type); e.dataTransfer.effectAllowed = "copy"; }
  function handleDropZoneDragOver(e: React.DragEvent) { e.preventDefault(); e.dataTransfer.dropEffect = "copy"; }
  function handleDropZoneDragEnter(e: React.DragEvent) { e.preventDefault(); e.stopPropagation(); setDropActive(true); }
  function handleDropZoneDragLeave(e: React.DragEvent) { e.stopPropagation(); setDropActive(false); }
  function handleDropZoneDrop(e: React.DragEvent) { e.preventDefault(); e.stopPropagation(); setDropActive(false); const type = e.dataTransfer.getData("text/plain"); if (type) insertBlock(type); }

/* ── Section reorder drag ───────────────────────────── */
function handleSectionDragStart(e: React.DragEvent, idx: number) {
  e.dataTransfer.setData("text/plain", String(idx));
  e.dataTransfer.effectAllowed = "move";
  dragIdxRef.current = idx;
  setDragIdx(idx);
  setHoveredIdx(null);
  document.body.classList.add("nl-dragging");
}
function handleSectionDragOver(e: React.DragEvent, idx: number) {
  e.preventDefault();
  e.dataTransfer.dropEffect = "move";
  const from = dragIdxRef.current;
  if (from === idx) return;
  if (dragOverIdx !== idx) setDragOverIdx(idx);
}
function handleSectionDragLeave(e: React.DragEvent, idx: number) {
  const related = e.relatedTarget as HTMLElement | null;
  const current = e.currentTarget as HTMLElement;
  if (related && current.contains(related)) return;
  if (dragOverIdx === idx) setDragOverIdx(null);
}
function handleSectionDragEnd() {
  dragIdxRef.current = null;
  setDragIdx(null);
  setDragOverIdx(null);
  document.body.classList.remove("nl-dragging");
}
function handleSectionDrop(e: React.DragEvent, toIdx: number) {
  e.preventDefault();
  e.stopPropagation();
  const fromIdx = dragIdxRef.current;
  dragIdxRef.current = null;
  setDragIdx(null);
  setDragOverIdx(null);
  setDropActive(false);
  document.body.classList.remove("nl-dragging");
  if (fromIdx === null || fromIdx === toIdx) return;
  setContent((c) => {
    const s = [...c.sections];
    const [moved] = s.splice(fromIdx, 1);
    const insertAt = toIdx > fromIdx ? toIdx - 1 : toIdx;
    s.splice(insertAt, 0, moved);
    return { ...c, sections: s };
  });
  markDirty();
}

  /* ── Selection ──────────────────────────────────────── */
  function selectSection(i: number) { setSelectedIdx(i); setRightOpen(true); }
  function clearSelection() { setSelectedIdx(null); }

  /* ── Preview ────────────────────────────────────────── */
  const bodyHtml = useMemo(() => buildTemplateBody(content.template, content), [content]);
  const previewHtml = useMemo(() => emailShell(SITE.name, bodyHtml, `/api/newsletter/unsubscribe?token=preview`), [bodyHtml]);
  const ready = subject.trim().length >= 3;

  /* ── Actions ────────────────────────────────────────── */
  async function saveDraft() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/newsletter/drafts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: draftId ?? undefined, subject, content }) });
      const r = await res.json().catch(() => ({}));
      if (res.ok) { setDraftId(r.campaign.id); setStatus({ ok: true, text: "Draft saved." }); markClean(); clearLocalSave(); } else setStatus({ ok: false, text: r.error ?? "Could not save draft." });
    } finally { setSaving(false); }
  }

  async function sendTest() {
    const to = localStorage.getItem("nl_test_email")?.trim();
    if (!to) { setStatus({ ok: false, text: "No test email saved. Set one in Newsletter → Settings first." }); return; }
    setTesting(true);
    try {
      const res = await fetch("/api/admin/newsletter/test", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ subject: subject.trim(), html: bodyHtml.trim(), to }) });
      const r = await res.json().catch(() => ({}));
      if (res.ok) setStatus({ ok: true, text: `Test email sent to ${r.to}.` }); else setStatus({ ok: false, text: r.error ?? "Test send failed." });
    } finally { setTesting(false); }
  }

  async function send() {
    if (!ready) return; setSending(true);
    try {
      const res = await fetch("/api/admin/newsletter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ subject: subject.trim(), html: bodyHtml.trim(), contentJson: content }) });
      const r = await res.json().catch(() => ({}));
      if (res.ok) { setSubject(""); setContent(resetContentValue()); setDraftId(null); setStatus(null); markClean(); onSent(r.queued, r.sentNow, r.remainingToday); } else setStatus({ ok: false, text: r.error ?? "Failed to send." });
    } finally { setSending(false); }
  }

  function refreshTemplates() { setSavedTemplates(getTemplates()); }
  function handleSaveAsTemplate() { const n = templateName.trim(); if (!n) return; saveTemplate(n, subject, content); refreshTemplates(); setShowSaveModal(false); setTemplateName(""); setStatus({ ok: true, text: `Template "${n}" saved.` }); }
  function handleLoadTemplate(t: SavedTemplate) { if (content.sections.length > 0) { setConfirmAction({ title: "Load template?", message: "This will replace your current draft.", onConfirm: () => { setSubject(t.subject); setContent({ ...t.content }); setConfirmAction(null); clearSelection(); } }); } else { setSubject(t.subject); setContent({ ...t.content }); } }
  function handleDeleteTemplate(t: SavedTemplate) { setConfirmAction({ title: "Delete template?", message: `Delete "${t.name}"?`, onConfirm: () => { deleteTemplate(t.id); refreshTemplates(); setConfirmAction(null); } }); }

  async function handleRenameTemplate(t: SavedTemplate) {
    const name = await showPrompt({ title: "Rename template", defaultValue: t.name, placeholder: "Template name", confirmLabel: "Rename" });
    if (name && name.trim()) {
      updateTemplate(t.id, name.trim(), t.subject, t.content);
      refreshTemplates();
    }
  }
  function handleClear() { setConfirmAction({ title: "Clear canvas?", message: "This will reset everything.", onConfirm: () => { setSubject(""); setContent(resetContentValue()); setDraftId(null); markClean(); clearLocalSave(); setConfirmAction(null); clearSelection(); } }); }

  function handleLoadLayout(id: LayoutId) {
    const layout = PREBUILT_LAYOUTS.find((l) => l.id === id);
    if (!layout) return;
    const apply = () => {
      setSubject(id === "blank" ? "" : `Newsletter — ${layout.name}`);
      setContent({ ...layout.content });
      setSelectedLayout(id);
      setDraftId(null);
      markClean();
      clearSelection();
    };
    if (content.sections.length > 0 || content.greeting || content.intro) {
      setConfirmAction({ title: `Load "${layout.name}"?`, message: "This will replace your current content.", onConfirm: () => { setConfirmAction(null); apply(); } });
    } else {
      apply();
    }
  }

  function handleResetLayout() {
    if (!selectedLayout) return;
    const layout = PREBUILT_LAYOUTS.find((l) => l.id === selectedLayout);
    if (!layout) return;
    setConfirmAction({ title: "Reset to layout?", message: "This will undo all edits and restore the original layout.", onConfirm: () => {
      setContent({ ...layout.content });
      markClean();
      setConfirmAction(null);
      clearSelection();
    } });
  }

  return (
    <div className="flex flex-col h-full min-h-0 bg-background">
      {/* Disable pointer events on inputs/textareas during section drag */}
      <style>{`.nl-dragging input, .nl-dragging textarea { pointer-events: none !important; }`}</style>
      {/* ════════════════════════════════════════════════════ TOP BAR */}
      <div className="flex items-center gap-1.5 border-b border-border/50 px-3 py-1.5 bg-card/30 backdrop-blur-sm shrink-0">
        {onBack && (
          <button type="button" onClick={onBack} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors" title="Back to campaigns">
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}

        <div className="flex items-center gap-0.5 rounded-lg border border-border/50 bg-muted/20 p-0.5">
          <button type="button" onClick={() => setLeftOpen((o) => !o)} className={`p-1.5 rounded-md transition-all ${leftOpen ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`} title="Toggle blocks">
            {leftOpen ? <PanelLeftClose className="w-3.5 h-3.5" /> : <PanelLeftOpen className="w-3.5 h-3.5" />}
          </button>
        </div>

        <div className="flex-1 min-w-0 relative">
          <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject line" maxLength={200}
            className="w-full rounded-lg border border-transparent bg-transparent px-3 py-1.5 text-sm font-medium outline-none transition-all focus:border-accent/30 focus:bg-background focus:ring-2 focus:ring-accent/10 placeholder:text-muted-foreground/30 placeholder:font-normal" />
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-0.5 rounded-lg border border-border/50 bg-muted/20 p-0.5">
          <button type="button" onClick={() => setViewMode("edit")}
            className={`px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider transition-all ${viewMode === "edit" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
            Edit
          </button>
          <button type="button" onClick={() => setViewMode("preview")}
            className={`px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider transition-all ${viewMode === "preview" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
            Preview
          </button>
        </div>

        {selectedLayout && (
          <div className="flex items-center gap-1.5 rounded-full border border-border/40 bg-muted/20 px-2.5 py-1">
            <div className="w-2 h-2 rounded-full" style={{ background: PREBUILT_LAYOUTS.find((l) => l.id === selectedLayout)?.accent ?? "#999" }} />
            <span className="text-[10px] font-semibold text-muted-foreground">{PREBUILT_LAYOUTS.find((l) => l.id === selectedLayout)?.name}</span>
          </div>
        )}

        <button type="button" onClick={handleClear} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors" title="Clear"><Trash2 className="w-3.5 h-3.5" /></button>

        <div className="flex items-center gap-0.5 rounded-lg border border-border/50 bg-muted/20 p-0.5">
          <button type="button" onClick={() => setRightOpen((o) => !o)} className={`p-1.5 rounded-md transition-all ${rightOpen ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`} title="Toggle settings">
            {rightOpen ? <PanelRightClose className="w-3.5 h-3.5" /> : <PanelRightOpen className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════ 3-PANE */}
      <div className="flex flex-1 min-h-0">

        {/* ── LEFT: Blocks / Layouts / Templates ────────────── */}
        {leftOpen && (
          <div className="w-56 shrink-0 border-r border-border/50 bg-card/20 flex flex-col overflow-hidden">
            {/* Tab bar */}
            <div className="flex items-center gap-0.5 px-2 pt-2 pb-1">
              {([["blocks", "Blocks"], ["layouts", "Layouts"]] as const).map(([key, label]) => (
                <button key={key} type="button" onClick={() => setLeftTab(key)}
                  className={`flex-1 rounded-md px-2 py-1.5 text-[9px] font-bold uppercase tracking-widest transition-all ${leftTab === key ? "bg-accent/10 text-accent border border-accent/20" : "text-muted-foreground/50 hover:text-muted-foreground border border-transparent"}`}>
                  {label}
                </button>
              ))}
            </div>

            {/* ── Blocks tab ──────────────────────────── */}
            {leftTab === "blocks" && (
              <div className="flex-1 overflow-y-auto px-2.5 pb-3 space-y-3 pt-1">
                <BlockGroup title="Content" ids={["section", "heading", "text", "list", "ordered-list"]} onInsert={insertBlock} onDragStart={handleDragStart} />
                <BlockGroup title="Media" ids={["image", "code"]} onInsert={insertBlock} onDragStart={handleDragStart} />
                <BlockGroup title="Layout" ids={["divider", "spacer", "columns", "table"]} onInsert={insertBlock} onDragStart={handleDragStart} />
                <BlockGroup title="Actions" ids={["button", "quote", "social"]} onInsert={insertBlock} onDragStart={handleDragStart} />
                {insert && (
                  <div className="pt-2 border-t border-border/30">
                    <p className={sectionHeaderCls}>Link Content</p>
                    <InsertContentPicker items={insert} onInsert={addInserted} />
                  </div>
                )}
              </div>
            )}

            {/* ── Layouts tab (pre-built + saved) ──────── */}
            {leftTab === "layouts" && (
              <div className="flex-1 overflow-y-auto px-2.5 pb-3 space-y-3 pt-1">
                {/* Pre-built layouts */}
                <div>
                  <p className={sectionHeaderCls}>Pre-built</p>
                  <div className="space-y-1.5">
                    {PREBUILT_LAYOUTS.map((l) => (
                      <div key={l.id}
                        className={`rounded-lg border transition-all cursor-pointer ${selectedLayout === l.id ? "border-accent bg-accent/10 shadow-sm" : "border-border/40 hover:border-border hover:bg-muted/30"}`}
                        onClick={() => handleLoadLayout(l.id)}>
                        {/* Thumbnail */}
                        <div className="mx-2 mt-2 rounded-md overflow-hidden border border-border/30 bg-white" style={{ aspectRatio: "3/4" }}>
                          <LayoutThumbnail sections={[]} accent={l.accent} layoutId={l.id} />
                        </div>
                        {/* Info */}
                        <div className="px-2.5 py-2 flex items-center justify-between">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <div className="w-2 h-2 rounded-full shrink-0" style={{ background: l.accent }} />
                            <span className="text-[10px] font-semibold text-foreground truncate">{l.name}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Saved templates */}
                <div className="pt-2 border-t border-border/30">
                  <p className={sectionHeaderCls}>Saved templates</p>
                  {savedTemplates.length === 0 ? (
                    <p className="text-[10px] text-muted-foreground/50 px-1">No saved templates yet.</p>
                  ) : (
                    <div className="space-y-1.5">
                      {savedTemplates.map((t) => (
                        <div key={t.id}
                          className="rounded-lg border border-border/40 hover:border-border hover:bg-muted/20 transition-all group">
                          {/* Thumbnail */}
                          <div className="mx-2 mt-2 rounded-md overflow-hidden border border-border/30 bg-white relative" style={{ aspectRatio: "3/4" }}>
                            <LayoutThumbnail sections={t.content.sections} accent={t.content.accent} layoutId={null} />
                            {/* Overlay actions */}
                            <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                              <button type="button" onClick={(e) => { e.stopPropagation(); handleRenameTemplate(t); }}
                                className="p-1.5 rounded-full bg-background/80 border border-border/50 text-muted-foreground hover:text-foreground hover:bg-background transition-all">
                                <Pencil className="w-3 h-3" />
                              </button>
                              <button type="button" onClick={(e) => { e.stopPropagation(); handleDeleteTemplate(t); }}
                                className="p-1.5 rounded-full bg-background/80 border border-border/50 text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-all">
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          {/* Name */}
                          <div className="px-2.5 py-2 flex items-center justify-between">
                            <span className="text-[10px] font-semibold text-foreground truncate">{t.name}</span>
                            <span className="text-[8px] text-muted-foreground/40">{new Date(t.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── CENTER: Preview / Canvas ────────────────────── */}
        <div className="flex-1 min-w-0 flex flex-col overflow-hidden bg-muted/5">
          {/* Section navigator (edit mode) */}
          {viewMode === "edit" && content.sections.length > 0 && (
            <div className="shrink-0 border-b border-border/30 bg-card/20 px-3 py-1.5 flex items-center gap-1 overflow-x-auto">
              <button type="button" onClick={clearSelection}
                className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold transition-all ${selectedIdx === null ? "bg-accent text-accent-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}>
                General
              </button>
              {content.sections.map((s, i) => (
                <button key={i} type="button" onClick={() => selectSection(i)}
                  className={`shrink-0 flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold transition-all ${selectedIdx === i ? "bg-accent text-accent-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}>
                  <SectionIcon kind={sectionKind(s)} className="w-3 h-3" />
                  {s.heading || `#${i + 1}`}
                </button>
              ))}
            </div>
          )}

          {/* Device toggle (preview mode) */}
          {viewMode === "preview" && (
            <div className="shrink-0 border-b border-border/30 bg-card/20 px-3 py-1.5 flex items-center justify-center gap-0.5">
              <button type="button" onClick={() => setPreviewDevice("desktop")}
                className={`p-1.5 rounded-md transition-all ${previewDevice === "desktop" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`} title="Desktop">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
              </button>
              <button type="button" onClick={() => setPreviewDevice("mobile")}
                className={`p-1.5 rounded-md transition-all ${previewDevice === "mobile" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`} title="Mobile">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
              </button>
            </div>
          )}

          {/* Drop zone + interactive preview */}
          <div className="flex-1 overflow-auto p-4 sm:p-6 flex justify-center min-w-0"
            onDragOver={handleDropZoneDragOver}
            onDragEnter={handleDropZoneDragEnter}
            onDragLeave={handleDropZoneDragLeave}
            onDrop={handleDropZoneDrop}>
            <div className={`transition-all duration-300 min-w-0 ${previewDevice === "mobile" ? "w-[375px]" : "w-full max-w-2xl"}`}>

              {viewMode === "edit" ? (
                /* ── Interactive Edit Canvas ─────────────────── */
                <div className={`rounded-xl shadow-lg overflow-hidden transition-all ${dropActive ? "ring-4 ring-accent/10" : ""}`}
                  style={{ background: "#faf9f6", border: "1px solid #e5e3dd" }}>
                  {dropActive && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
                      <div className="rounded-xl border border-dashed border-accent/30 bg-accent/5 px-6 py-4">
                        <p className="text-xs font-medium text-accent/50">Drop to add block</p>
                      </div>
                    </div>
                  )}

                  {/* Email card */}
                  <div className="mx-auto max-w-[600px] my-6" style={{ background: "#ffffff", border: "1px solid #ecebe6", borderRadius: "14px" }}>

                    {/* Greeting — matches email: padding:34px 40px 10px 40px */}
                    <div style={{ padding: "34px 40px 10px 40px" }}>
                      <input value={content.greeting} onChange={(e) => update({ greeting: e.target.value })} placeholder="Hi there,"
                        style={{ width: "100%", fontSize: "15px", fontWeight: 700, color: "#111110", background: "transparent", border: "none", outline: "none", padding: "0 0 6px 0", borderBottom: "1px solid #ecebe6", fontFamily: "-apple-system,'Segoe UI',Roboto,Arial,Helvetica,sans-serif" }} />
                    </div>

                    {/* Intro — matches email: inside same greeting td, bottom spacing 0 */}
                    <div style={{ padding: "0 40px 4px 40px" }}>
                      <textarea value={content.intro} onChange={(e) => { update({ intro: e.target.value }); markDirty(); }} placeholder="What's new this week…"
                        rows={3}
                        style={{ width: "100%", fontSize: "15px", lineHeight: "1.65", color: "#2a2926", background: "transparent", border: "none", outline: "none", resize: "none", padding: "0 0 8px 0", borderBottom: "1px solid #ecebe6", fontFamily: "-apple-system,'Segoe UI',Roboto,Arial,Helvetica,sans-serif" }} />
                    </div>

                  {/* Sections */}
                  {content.sections.map((s, i) => {
                    const kind = sectionKind(s);
                    const isSelected = selectedIdx === i;
                    const isHovered = hoveredIdx === i;
                    const isDragOver = dragOverIdx === i;

                    return (
                      <div key={i} className={`relative group ${dragIdx === i ? "opacity-50" : ""}`}
                        onMouseEnter={() => setHoveredIdx(i)} onMouseLeave={() => setHoveredIdx(null)}
                        onDragOver={(e) => handleSectionDragOver(e, i)}
                        onDragLeave={(e) => handleSectionDragLeave(e, i)}
                        onDrop={(e) => handleSectionDrop(e, i)}>
                        {/* Drop indicator line */}
                        {isDragOver && dragIdx !== null && dragIdx !== i && (
                          <div className="absolute -top-1 left-0 right-0 z-30 flex items-center pointer-events-none">
                            <div className="flex-1 h-0.5 bg-accent rounded-full mx-8" />
                            <div className="w-2 h-2 rounded-full bg-accent -ml-1 shadow-sm" />
                          </div>
                        )}

                        {/* Hover outline */}
                        <div className={`absolute inset-0 transition-all pointer-events-none z-10 ${isSelected ? "border-l-2 border-accent" : isHovered ? "border-l-2 border-accent/20" : "border-l-2 border-transparent"}`} />

                        {/* Grip handle — always visible on left */}
                        <div draggable onDragStart={(e) => handleSectionDragStart(e, i)} onDragEnd={handleSectionDragEnd}
                          className={`absolute top-1/2 -translate-y-1/2 left-1 z-30 p-1.5 rounded-md cursor-grab active:cursor-grabbing transition-opacity hover:bg-muted/80 text-muted-foreground/40 hover:text-foreground ${dragIdx !== null || isHovered ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                          title="Drag to reorder">
                          <GripVertical className="w-4 h-4" />
                        </div>

                        {/* Action bar on hover */}
                        {(isHovered || isSelected) && (
                          <div className="absolute top-2 right-2 z-20 flex items-center gap-0.5 rounded-lg bg-background/95 backdrop-blur border border-border/50 shadow-lg p-0.5">
                            <button type="button" onClick={() => selectSection(i)} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Edit">
                              <Pencil className="w-3 h-3" />
                            </button>
                            <button type="button" onClick={() => moveSection(i, -1)} disabled={i === 0} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors disabled:opacity-20" title="Move up">
                              <ChevronUp className="w-3 h-3" />
                            </button>
                            <button type="button" onClick={() => moveSection(i, 1)} disabled={i === content.sections.length - 1} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors disabled:opacity-20" title="Move down">
                              <ChevronDown className="w-3 h-3" />
                            </button>
                            <button type="button" onClick={() => duplicateSection(i)} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Duplicate">
                              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                            </button>
                            <div className="w-px h-4 bg-border/50" />
                            <button type="button" onClick={() => removeSection(i)} className="p-1.5 rounded-md hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors" title="Delete">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}

                        {/* ── Section rendering ─────────────── */}
                        <div className="cursor-pointer overflow-hidden" style={{ padding: "8px 40px" }} onClick={() => selectSection(i)}>
                          {kind === "heading" && (
                            <input value={s.heading} onChange={(e) => setSection(i, { heading: e.target.value })}
                              placeholder="Section heading"
                              style={{ width: "100%", fontSize: "21px", fontWeight: 700, color: "#111110", background: "transparent", border: "none", outline: "none", padding: "0 0 10px 0", borderBottom: "1px solid #ecebe6", fontFamily: "Georgia,'Times New Roman',serif" }} />
                          )}
                          {kind === "text" && (
                            <div style={{ fontSize: "15px", color: "#2a2926", lineHeight: "1.65" }}>
                              <TextBlockWithFormat value={s.body} onChange={(val) => setSection(i, { body: val })} />
                            </div>
                          )}
                          {kind === "image" && (
                            <div>
                              {s.body && s.body !== "https://images.unsplash.com/photo-1500964757637-c85e8a162699?w=800&q=80" ? (
                                <img src={s.body} alt="" style={{ width: "100%", borderRadius: "8px", display: "block" }} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                              ) : (
                                <div style={{ width: "100%", borderRadius: "8px", border: "1px dashed #e8e6e1", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8px", padding: "40px 0", background: "#faf9f6" }}>
                                  <ImageIcon style={{ width: "32px", height: "32px", color: "#6b6a66", opacity: 0.4 }} />
                                  <p style={{ fontSize: "12px", color: "#6b6a66", opacity: 0.6 }}>Paste image URL below</p>
                                </div>
                              )}
                              <input value={s.body} onChange={(e) => setSection(i, { body: e.target.value })}
                                placeholder="https://example.com/image.jpg"
                                style={{ width: "100%", fontSize: "12px", color: "#6b6a66", background: "transparent", border: "none", outline: "none", padding: "8px 0", borderBottom: "1px solid #ecebe6" }} />
                            </div>
                          )}
                          {kind === "button" && (
                            <div style={{ textAlign: "center", padding: "8px 0" }}>
                              <a href={content.cta?.url || "#"} style={{ background: content.accent, color: "#111110", textDecoration: "none", fontWeight: 700, fontSize: "15px", padding: "13px 34px", borderRadius: "999px", display: "inline-block" }}>
                                {content.cta?.label || "Button"} →
                              </a>
                            </div>
                          )}
                          {kind === "quote" && (() => {
                            let qData: { text: string; author: string } = { text: "", author: "" };
                            try { qData = JSON.parse(s.body); } catch { qData = { text: s.body, author: "" }; }
                            return (
                              <div style={{ borderLeft: `4px solid ${content.accent}`, padding: "6px 22px", fontStyle: "italic", fontFamily: "Georgia,'Times New Roman',serif", fontSize: "16px", color: "#3c3a35" }}>
                                <p style={{ margin: 0 }}>{qData.text || "Quote text"}</p>
                                {qData.author && <p style={{ fontStyle: "normal", fontSize: "13px", fontWeight: 700, color: "#6b6a66", marginTop: "8px" }}>— {qData.author}</p>}
                              </div>
                            );
                          })()}
                          {kind === "divider" && <hr style={{ border: "none", borderTop: "1px solid #e2e0db", margin: "8px 0" }} />}
                          {kind === "spacer" && <div style={{ height: "20px" }} />}
                          {kind === "columns" && (() => {
                            let colData: { left: string; right: string; leftTitle: string; rightTitle: string; bulletStyle: string } = { left: "", right: "", leftTitle: "", rightTitle: "", bulletStyle: "dot" };
                            try { colData = { ...colData, ...JSON.parse(s.body) }; } catch { colData = { ...colData, left: s.body }; }
                            const bulletPrefix = { dot: "•", square: "■", number: "", roman: "" }[colData.bulletStyle] ?? "•";
                            const isNumbered = colData.bulletStyle === "number" || colData.bulletStyle === "roman";
                            function renderList(text: string) {
                              if (!text.trim()) return <p style={{ fontSize: "14px", color: "#6b6a66", opacity: 0.4, fontStyle: "italic" }}>Empty</p>;
                              const lines = text.split("\n").filter((l) => l.trim());
                              if (isNumbered) {
                                return (
                                   <ol style={{ margin: 0, paddingLeft: "20px", listStyleType: colData.bulletStyle === "roman" ? "lower-roman" : "decimal" }}>
                                    {lines.map((l, j) => <li key={j} style={{ margin: "0 0 6px 0", lineHeight: 1.6, fontSize: "15px", color: "#2a2926" }}>{l.replace(/^[-*•→✓\d.]+\s*/, "")}</li>)}
                                  </ol>
                                );
                              }
                              return (
                                 <ul style={{ margin: 0, paddingLeft: "20px", listStyleType: colData.bulletStyle === "square" ? "square" : "disc" }}>
                                  {lines.map((l, j) => <li key={j} style={{ margin: "0 0 6px 0", lineHeight: 1.6, fontSize: "15px", color: "#2a2926" }}>{l.replace(/^[-*•→✓\d.]+\s*/, "")}</li>)}
                                </ul>
                              );
                            }
                            return (
                              <div style={{ display: "table", width: "100%", borderSpacing: 0 }}>
                                <div style={{ display: "table-row" }}>
                                  <div style={{ display: "table-cell", width: "48%", verticalAlign: "top", fontSize: "15px", color: "#2a2926", lineHeight: 1.65, padding: "0 8px 0 0" }}>
                                    {colData.leftTitle && <p style={{ margin: "0 0 10px 0", fontSize: "12px", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: "#6b6a66" }}>{colData.leftTitle}</p>}
                                    {renderList(colData.left)}
                                  </div>
                                  <div style={{ display: "table-cell", width: "4%" }}></div>
                                  <div style={{ display: "table-cell", width: "48%", verticalAlign: "top", fontSize: "15px", color: "#2a2926", lineHeight: 1.65, padding: "0 0 0 8px" }}>
                                    {colData.rightTitle && <p style={{ margin: "0 0 10px 0", fontSize: "12px", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: "#6b6a66" }}>{colData.rightTitle}</p>}
                                    {renderList(colData.right)}
                                  </div>
                                </div>
                              </div>
                            );
                          })()}
                          {kind === "list" && (
                            <ul style={{ margin: 0, paddingLeft: "24px", fontSize: "15px", color: "#2a2926" }}>
                              {s.body.split("\n").filter((l) => l.startsWith("- ") || /^[•→✓]\s/.test(l)).map((l, j) => <li key={j} style={{ margin: "0 0 6px 0", lineHeight: 1.6 }}>{l.replace(/^[-•→✓]\s*/, "")}</li>)}
                            </ul>
                          )}
                          {kind === "ordered-list" && (
                            <ol style={{ margin: 0, paddingLeft: "24px", fontSize: "15px", color: "#2a2926" }}>
                              {s.body.split("\n").filter((l) => /^\d+\./.test(l)).map((l, j) => <li key={j} style={{ margin: "0 0 6px 0", lineHeight: 1.6 }}>{l.replace(/^\d+\.\s*/, "")}</li>)}
                            </ol>
                          )}
                          {kind === "code" && (
                            <div style={{ background: "#f8f7f4", border: "1px solid #e8e6e1", borderRadius: "8px", padding: "20px", fontSize: "14px", color: "#2a2926", overflow: "hidden", maxWidth: "100%", boxSizing: "border-box", wordBreak: "break-word" }}>
                              <CodePreview body={s.body} />
                            </div>
                          )}
                          {kind === "social" && (() => {
                            let selKeys: string[] = [];
                            try { selKeys = JSON.parse(s.body).selected ?? []; } catch { selKeys = []; }
                            const activeSocials = dbSocials.filter((ds) => selKeys.includes(ds.key));
                            return (
                              <div>
                                <p style={{ margin: "0 0 8px 0", fontSize: "11px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "#6b6a66" }}>Follow me</p>
                                <div style={{ display: "flex", gap: "12px" }}>
                                  {activeSocials.length > 0 ? activeSocials.map((s) => (
                                    <a key={s.key} href={s.href} target="_blank" rel="noopener noreferrer" style={{ color: s.color ?? "#6366f1", textDecoration: "none", fontSize: "13px", fontWeight: 600, whiteSpace: "nowrap" }}>
                                      {s.label}
                                    </a>
                                  )) : <p style={{ fontSize: "12px", color: "#6b6a66", opacity: 0.6 }}>No social links selected</p>}
                                </div>
                              </div>
                            );
                          })()}
                          {kind === "blog" && (() => {
                            let d: { title: string; url: string; excerpt: string; image: string } = { title: "", url: "", excerpt: "", image: "" };
                            try { d = JSON.parse(s.body); } catch { d = { title: s.heading, url: s.body, excerpt: "", image: "" }; }
                            return (
                              <div>
                                {d.image ? <img src={d.image} alt="" style={{ width: "100%", borderRadius: "8px", display: "block", marginBottom: "12px" }} /> : null}
                                <p style={{ margin: "0 0 4px 0", fontSize: "11px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "#6b6a66" }}>Blog Post</p>
                                <p style={{ margin: "0 0 4px 0", fontSize: "18px", fontWeight: 700, fontFamily: "Georgia,'Times New Roman',serif", color: "#111110" }}>{d.title || "Untitled"}</p>
                                {d.excerpt && <p style={{ margin: "0 0 8px 0", fontSize: "14px", color: "#6b6a66", lineHeight: 1.5 }}>{d.excerpt}</p>}
                                {d.url && <a href={d.url} style={{ color: "#6b6a66", textDecoration: "underline", fontSize: "13px" }}>Read more →</a>}
                              </div>
                            );
                          })()}
                          {kind === "video" && (() => {
                            let d: { title: string; url: string; thumbnail: string } = { title: "", url: "", thumbnail: "" };
                            try { d = JSON.parse(s.body); } catch { d = { title: s.heading, url: s.body, thumbnail: "" }; }
                            return (
                              <div>
                                <p style={{ margin: "0 0 4px 0", fontSize: "11px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "#6b6a66" }}>Video</p>
                                {d.thumbnail ? <img src={d.thumbnail} alt="" style={{ width: "100%", borderRadius: "8px", display: "block" }} /> : null}
                                <p style={{ margin: "8px 0 4px 0", fontSize: "18px", fontWeight: 700, fontFamily: "Georgia,'Times New Roman',serif", color: "#111110" }}>{d.title || "Untitled"}</p>
                                {d.url && <a href={d.url} style={{ color: "#6b6a66", textDecoration: "underline", fontSize: "13px" }}>Watch →</a>}
                              </div>
                            );
                          })()}
                          {kind === "book" && (() => {
                            let d: { title: string; author: string; url: string; cover: string } = { title: "", author: "", url: "", cover: "" };
                            try { d = JSON.parse(s.body); } catch { d = { title: s.heading, author: "", url: s.body, cover: "" }; }
                            return (
                              <div>
                                <p style={{ margin: "0 0 4px 0", fontSize: "11px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "#6b6a66" }}>Book</p>
                                <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                                  {d.cover && <img src={d.cover} alt="" style={{ width: "100px", borderRadius: "6px", flexShrink: 0 }} />}
                                  <div>
                                    <p style={{ margin: "0 0 4px 0", fontSize: "18px", fontWeight: 700, fontFamily: "Georgia,'Times New Roman',serif", color: "#111110" }}>{d.title || "Untitled"}</p>
                                    {d.author && <p style={{ margin: "0 0 8px 0", fontSize: "13px", color: "#6b6a66" }}>by {d.author}</p>}
                                    {d.url && <a href={d.url} style={{ color: "#6b6a66", textDecoration: "underline", fontSize: "13px" }}>Get it →</a>}
                                  </div>
                                </div>
                              </div>
                            );
                          })()}
                          {kind === "table" && (() => {
                            let tableData: { headerRow: boolean; rows: string[][] } = { headerRow: true, rows: [] };
                            try { tableData = JSON.parse(s.body); } catch { tableData = { headerRow: true, rows: [["", ""], ["", ""]] }; }
                            return (
                              <div style={{ overflowX: "auto" }}>
                                <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #e8e6e1", borderRadius: "8px", overflow: "hidden" }}>
                                  <tbody>
                                    {tableData.rows.map((row, ri) => (
                                      <tr key={ri}>
                                        {row.map((cell, ci) => (
                                          <td key={ci} style={{
                                            padding: "10px 14px",
                                            fontSize: ri === 0 && tableData.headerRow ? "13px" : "14px",
                                            fontWeight: ri === 0 && tableData.headerRow ? 700 : 400,
                                            textTransform: ri === 0 && tableData.headerRow ? "uppercase" : "none",
                                            letterSpacing: ri === 0 && tableData.headerRow ? "1px" : "normal",
                                            color: ri === 0 && tableData.headerRow ? "#111110" : "#2a2926",
                                            background: ri === 0 && tableData.headerRow ? `${content.accent}15` : "transparent",
                                            borderBottom: ri === 0 && tableData.headerRow ? `2px solid ${content.accent}` : "1px solid #e8e6e1"
                                          }}>
                                            {cell || "—"}
                                          </td>
                                        ))}
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    );
                  })}

                  {/* Empty state */}
                  {content.sections.length === 0 && (
                    <div style={{ padding: "0 40px 40px 40px" }}>
                      <div style={{ border: "2px dashed #e8e6e1", borderRadius: "12px", padding: "64px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                        <Plus style={{ width: "32px", height: "32px", color: "#6b6a66", opacity: 0.4 }} />
                        <p style={{ fontSize: "14px", color: "#6b6a66", opacity: 0.6 }}>Drop blocks here or click one from the left panel</p>
                        <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                          <button type="button" onClick={() => insertBlock("text")} style={{ borderRadius: "999px", border: "1px solid #e8e6e1", padding: "6px 16px", fontSize: "12px", color: "#6b6a66", background: "transparent", cursor: "pointer" }}>+ Text</button>
                          <button type="button" onClick={() => insertBlock("image")} style={{ borderRadius: "999px", border: "1px solid #e8e6e1", padding: "6px 16px", fontSize: "12px", color: "#6b6a66", background: "transparent", cursor: "pointer" }}>+ Image</button>
                          <button type="button" onClick={() => insertBlock("button")} style={{ borderRadius: "999px", border: "1px solid #e8e6e1", padding: "6px 16px", fontSize: "12px", color: "#6b6a66", background: "transparent", cursor: "pointer" }}>+ Button</button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* CTA — matches email: padding:26px 40px 0 40px, separate row */}
                  {content.cta && (
                    <div style={{ padding: "26px 40px 0 40px", textAlign: "center" }}>
                      <a href={content.cta.url} style={{ background: content.accent, color: "#111110", textDecoration: "none", fontWeight: 700, fontSize: "15px", padding: "13px 34px", borderRadius: "999px", display: "inline-block" }}>{content.cta.label}</a>
                    </div>
                  )}

                  {/* Signoff — matches email: padding:14px 40px 30px 40px */}
                  {content.signoff && (
                    <div style={{ padding: "14px 40px 30px 40px", color: "#6b6a66", fontSize: "14px", fontFamily: "-apple-system,'Segoe UI',Roboto,Arial,Helvetica,sans-serif" }}>
                      {content.signoff.split("\n").map((line, j) => (
                        <p key={j} style={{ margin: j > 0 ? "2px 0 0 0" : 0 }}>{line}</p>
                      ))}
                    </div>
                  )}

                  {/* Footer — matches email: site name + unsubscribe */}
                  <div style={{ padding: "26px 40px 34px 40px", color: "#6b6a66", textAlign: "center", fontSize: "12px", fontFamily: "-apple-system,'Segoe UI',Roboto,Arial,Helvetica,sans-serif" }}>
                    <p style={{ margin: 0 }}>Unsubscribe</p>
                  </div>
                  </div>
                </div>
              ) : (
                /* ── Email Preview (iframe) ──────────────── */
                <div className={`rounded-xl shadow-lg overflow-hidden transition-all ${dropActive ? "ring-4 ring-accent/10" : ""}`}
                  style={{ border: "1px solid #e5e3dd" }}>
                  <div className="overflow-hidden w-full" style={{ background: "#fafafa" }}>
                    <iframe title="Email preview" srcDoc={previewHtml} sandbox="allow-same-origin" loading="lazy" className="block border-0" style={{ width: "100%", height: "900px", maxWidth: "100%", border: "none" }} />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Bottom Bar ────────────────────────────────── */}
          <div className="shrink-0 border-t border-border/50 px-4 py-2 bg-card/30 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <button type="button" disabled={!ready} onClick={() => setConfirmAction({ title: `Send to ${subscriberCount} subscribers?`, message: "This will send the newsletter immediately.", onConfirm: () => { setConfirmAction(null); send(); } })}
                className="inline-flex items-center gap-2 rounded-full bg-accent text-accent-foreground px-5 py-2 text-sm font-semibold disabled:opacity-30 hover:opacity-90 transition-opacity">
                <Send className="w-4 h-4" /> Send
              </button>
                <button type="button" onClick={sendTest} disabled={!ready || testing} className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors">
                  {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <MailCheck className="w-4 h-4" />} Test
                </button>
                <button type="button" onClick={saveDraft} disabled={saving}
                  className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-40 transition-colors">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}{draftId ? "Update" : "Draft"}
                </button>
                <div className="flex-1" />
                <button type="button" onClick={() => setShowSaveModal(true)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
                  <Plus className="w-3 h-3" /> Template
                </button>
                <span className="text-xs text-muted-foreground tabular-nums">{subscriberCount} subs</span>
              </div>
            </div>
          </div>

        {/* ── RIGHT: Settings ─────────────────────────────── */}
        {rightOpen && (
          <div className="w-80 shrink-0 border-l border-border/50 bg-card/20 flex flex-col overflow-hidden">
            <div className="px-3 pt-3 pb-2 border-b border-border/30">
              <div className="flex items-center gap-1">
                <button type="button" onClick={clearSelection}
                  className={`rounded-lg px-2.5 py-1 text-[10px] font-semibold transition-all ${selectedIdx === null ? "bg-accent/10 text-accent" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}>
                  General
                </button>
                {selectedIdx !== null && content.sections[selectedIdx] && (
                  <>
                    <span className="text-muted-foreground/20 text-[10px]">/</span>
                    <button type="button" disabled className="rounded-lg bg-accent/10 text-accent px-2.5 py-1 text-[10px] font-semibold truncate max-w-[140px]">
                      {content.sections[selectedIdx].heading || sectionKind(content.sections[selectedIdx])}
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
              {/* ── Section editor (when selected) ────────── */}
              {selectedIdx !== null && content.sections[selectedIdx] && (
                <SectionEditor
                  index={selectedIdx}
                  section={content.sections[selectedIdx]}
                  kind={sectionKind(content.sections[selectedIdx])}
                  total={content.sections.length}
                  onChange={(patch) => setSection(selectedIdx, patch)}
                  onRemove={() => removeSection(selectedIdx)}
                  onMove={(dir) => moveSection(selectedIdx, dir)}
                  onDuplicate={() => duplicateSection(selectedIdx)}
                  dbQuotes={dbQuotes}
                  dbSocials={dbSocials}
                />
              )}

              {/* ── General settings (nothing selected) ──── */}
              {selectedIdx === null && (
                <>
                  <SettingGroup title="Email">
                    <div>
                      <label className={labelCls}>Preheader</label>
                      <input value={content.preheader} onChange={(e) => update({ preheader: e.target.value })} placeholder="Inbox preview text" maxLength={150} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Sign-off</label>
                      <input value={content.signoff} onChange={(e) => update({ signoff: e.target.value })} placeholder="Thanks for reading!" className={inputCls} />
                    </div>
                  </SettingGroup>

                  <SettingGroup title="Template">
                    <div className="space-y-1">
                      {TEMPLATES.map((t) => (
                        <button key={t.id} type="button" onClick={() => update({ template: t.id as TemplateId })}
                          className={`w-full text-left rounded-lg px-3 py-2 text-xs font-medium transition-all ${content.template === t.id ? "bg-accent text-accent-foreground shadow-sm" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"}`}>
                          {t.name}
                        </button>
                      ))}
                    </div>
                  </SettingGroup>

                  <SettingGroup title="Accent Color">
                    <div className="flex items-center gap-1.5">
                      {BRAND_ACCENTS.map((a) => (
                        <button key={a.value} type="button" onClick={() => update({ accent: a.value })} title={a.name}
                          className={`h-7 w-7 rounded-full border-2 transition-all ${content.accent === a.value ? "border-foreground scale-110 shadow-md" : "border-border/50 hover:border-muted-foreground/30 hover:scale-105"}`}
                          style={{ background: a.value }} />
                      ))}
                    </div>
                  </SettingGroup>

                  <SettingGroup title="CTA Button">
                    {content.cta ? (
                      <div className="space-y-2">
                        <input value={content.cta.label} onChange={(e) => update({ cta: { ...content.cta!, label: e.target.value } })} placeholder="Button text" className={inputCls} />
                        <input value={content.cta.url} onChange={(e) => update({ cta: { ...content.cta!, url: e.target.value } })} placeholder="https://..." className={inputCls} />
                        <button type="button" onClick={() => update({ cta: null })} className="text-[10px] text-red-500 hover:underline">Remove CTA</button>
                      </div>
                    ) : (
                      <button type="button" onClick={() => update({ cta: { label: "Click here", url: "https://example.com" } })} className="text-xs text-accent hover:underline">+ Add CTA button</button>
                    )}
                  </SettingGroup>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════════════ MODALS */}
      {confirmAction && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" onClick={() => setConfirmAction(null)} />
          <div className="relative w-full max-w-sm rounded-2xl border border-border bg-card shadow-2xl p-6 space-y-4">
            <h3 className="font-display text-base font-bold">{confirmAction.title}</h3>
            <p className="text-sm text-muted-foreground">{confirmAction.message}</p>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setConfirmAction(null)} className="rounded-full border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
              <button type="button" onClick={confirmAction.onConfirm} className="rounded-full bg-accent text-accent-foreground px-4 py-2 text-sm font-semibold hover:opacity-90 transition-opacity">Confirm</button>
            </div>
          </div>
        </div>
      )}

      {showSaveModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" onClick={() => setShowSaveModal(false)} />
          <div className="relative w-full max-w-sm rounded-2xl border border-border bg-card shadow-2xl p-6 space-y-4">
            <h3 className="font-display text-base font-bold">Save as template</h3>
            <input value={templateName} onChange={(e) => setTemplateName(e.target.value)} placeholder="Template name" className={inputCls} autoFocus onKeyDown={(e) => e.key === "Enter" && handleSaveAsTemplate()} />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowSaveModal(false)} className="rounded-full border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">Cancel</button>
              <button type="button" onClick={handleSaveAsTemplate} disabled={!templateName.trim()} className="rounded-full bg-accent text-accent-foreground px-4 py-2 text-sm font-semibold hover:opacity-90 disabled:opacity-40">Save</button>
            </div>
          </div>
        </div>
      )}

      {status && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[10000]">
          <div role={status.ok ? "status" : "alert"} className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm shadow-xl backdrop-blur ${status.ok ? "border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-400" : "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400"}`}>
            {status.text}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Text Block with Formatting ─────────────────────── */
function TextBlockWithFormat({ value, onChange }: { value: string; onChange: (val: string) => void }) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleFormat(before: string, after: string) {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = value.substring(start, end);
    const replacement = `${before}${selected || "text"}${after}`;
    const newValue = value.substring(0, start) + replacement + value.substring(end);
    onChange(newValue);
    // Restore cursor position after the formatting
    requestAnimationFrame(() => {
      ta.focus();
      const cursorPos = start + before.length + (selected ? selected.length : 4);
      ta.setSelectionRange(cursorPos, cursorPos);
    });
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="flex items-center gap-0.5 px-2 py-1.5 bg-muted/50 border-b border-border/50">
        <FormatToolbar onFormat={handleFormat} />
      </div>
      <textarea ref={textareaRef} value={value} onChange={(e) => onChange(e.target.value)}
        placeholder="Write content…"
        rows={1}
        onInput={(e) => { const ta = e.currentTarget; ta.style.height = "auto"; ta.style.height = ta.scrollHeight + "px"; }}
        className="w-full text-[16px] leading-relaxed text-foreground outline-none resize-none placeholder:text-muted-foreground/40 bg-transparent px-3 py-2.5 overflow-hidden" />
    </div>
  );
}

/* ── Text Formatting Toolbar ─────────────────────────── */
function FormatToolbar({ onFormat }: { onFormat: (before: string, after: string) => void }) {
  return (
    <div className="flex items-center gap-1">
      <button type="button" title="Bold (**text**)" onClick={() => onFormat("**", "**")}
        className="px-2 py-1 text-[11px] font-bold text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors">B</button>
      <button type="button" title="Italic (*text*)" onClick={() => onFormat("*", "*")}
        className="px-2 py-1 text-[11px] italic text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors">I</button>
      <button type="button" title="Highlight (==text==)" onClick={() => onFormat("==", "==")}
        className="px-2 py-1 text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors">
        <span className="bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 px-1 rounded">H</span>
      </button>
      <div className="w-px h-3.5 bg-border mx-0.5" />
      <button type="button" title="Red text" onClick={() => onFormat("[color:red]", "[/color]")}
        className="px-2 py-1 text-[11px] font-bold text-red-500 hover:text-red-600 hover:bg-red-500/10 rounded transition-colors">A</button>
      <button type="button" title="Blue text" onClick={() => onFormat("[color:blue]", "[/color]")}
        className="px-2 py-1 text-[11px] font-bold text-blue-500 hover:text-blue-600 hover:bg-blue-500/10 rounded transition-colors">A</button>
      <button type="button" title="Green text" onClick={() => onFormat("[color:green]", "[/color]")}
        className="px-2 py-1 text-[11px] font-bold text-green-500 hover:text-green-600 hover:bg-green-500/10 rounded transition-colors">A</button>
    </div>
  );
}

/* ── Table Editor (Right Panel) ──────────────────────── */
function TableEditor({ section, onChange }: { section: { heading: string; body: string }; onChange: (patch: Partial<{ heading: string; body: string }>) => void }) {
  let data: { headerRow: boolean; rows: string[][] } = { headerRow: true, rows: [["", ""], ["", ""]] };
  try { data = JSON.parse(section.body); } catch { /* keep default */ }

  const updateCell = (r: number, c: number, val: string) => {
    const rows = data.rows.map((row, ri) => row.map((cell, ci) => ri === r && ci === c ? val : cell));
    onChange({ body: JSON.stringify({ ...data, rows }) });
  };
  const addRow = () => {
    const cols = data.rows[0]?.length ?? 2;
    onChange({ body: JSON.stringify({ ...data, rows: [...data.rows, Array(cols).fill("")] }) });
  };
  const addCol = () => {
    onChange({ body: JSON.stringify({ ...data, rows: data.rows.map((r) => [...r, ""]) }) });
  };
  const removeRow = (ri: number) => {
    if (data.rows.length <= 1) return;
    onChange({ body: JSON.stringify({ ...data, rows: data.rows.filter((_, i) => i !== ri) }) });
  };
  const removeCol = (ci: number) => {
    if ((data.rows[0]?.length ?? 0) <= 1) return;
    onChange({ body: JSON.stringify({ ...data, rows: data.rows.map((r) => r.filter((_, i) => i !== ci)) }) });
  };
  const toggleHeader = () => onChange({ body: JSON.stringify({ ...data, headerRow: !data.headerRow }) });

  return (
    <div className="space-y-3">
      <label className={labelCls}>Table</label>
      <div className="overflow-x-auto">
        <table className="w-full text-xs border border-border">
          <tbody>
            {data.rows.map((row, ri) => (
              <tr key={ri}>
                {row.map((cell, ci) => (
                  <td key={ci} className="border border-border p-0">
                    <input
                      value={cell}
                      onChange={(e) => updateCell(ri, ci, e.target.value)}
                      placeholder={ri === 0 && data.headerRow ? `Header ${ci + 1}` : `Cell`}
                      className={`w-full px-2 py-1.5 text-xs outline-none ${ri === 0 && data.headerRow ? "font-bold bg-muted/50" : "bg-background"}`}
                    />
                  </td>
                ))}
                <td className="border border-border w-6">
                  <button type="button" onClick={() => removeRow(ri)} className="w-full h-full text-muted-foreground hover:text-red-500 hover:bg-red-500/10 text-xs">×</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <button type="button" onClick={addRow} className="rounded-md border border-border/50 px-2 py-1 text-[10px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">+ Row</button>
        <button type="button" onClick={addCol} className="rounded-md border border-border/50 px-2 py-1 text-[10px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">+ Column</button>
        <button type="button" onClick={() => removeCol(0)} className="rounded-md border border-border/50 px-2 py-1 text-[10px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">− Column</button>
        <div className="flex-1" />
        <label className="flex items-center gap-1.5 text-[10px] text-muted-foreground cursor-pointer">
          <input type="checkbox" checked={data.headerRow} onChange={toggleHeader} className="rounded border-border" />
          Header row
        </label>
      </div>
    </div>
  );
}

/* ── Section Editor (Right Panel) ────────────────────── */
function SectionEditor({ index, section, kind, total, onChange, onRemove, onMove, onDuplicate, dbQuotes, dbSocials }: {
  index: number;
  section: { heading: string; body: string };
  kind: SectionKind;
  total: number;
  onChange: (patch: Partial<{ heading: string; body: string }>) => void;
  onRemove: () => void;
  onMove: (dir: -1 | 1) => void;
  onDuplicate: () => void;
  dbQuotes: { id: string; text: string; tag: string | null }[];
  dbSocials: { id: string; key: string; label: string; href: string; handle: string | null; color: string | null; logoUrl?: string | null }[];
}) {
  return (
    <div className="space-y-3">
      {/* Section type badge */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/50">
          <SectionIcon kind={kind} className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-[10px] font-semibold text-muted-foreground uppercase">{kind}</span>
        </div>
        <span className="text-[10px] text-muted-foreground/40">Section {index + 1} of {total}</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-wrap">
        <button type="button" onClick={onDuplicate} className={smallBtnCls}>Duplicate</button>
        <button type="button" onClick={() => onMove(-1)} disabled={index === 0} className={`${smallBtnCls} disabled:opacity-20`}>↑</button>
        <button type="button" onClick={() => onMove(1)} disabled={index === total - 1} className={`${smallBtnCls} disabled:opacity-20`}>↓</button>
        <div className="flex-1" />
        <button type="button" onClick={onRemove} className="rounded-md border border-red-500/30 px-2 py-1 text-[10px] font-medium text-red-500 hover:bg-red-500/10 transition-colors">Delete</button>
      </div>

      {/* Heading */}
      {(kind === "heading" || kind === "text") && (
        <div>
          <label className={labelCls}>Heading</label>
          <input value={section.heading} onChange={(e) => onChange({ heading: e.target.value })} placeholder="Section heading" className={inputCls} />
        </div>
      )}

      {/* Body */}
      {(kind === "heading" || kind === "text" || kind === "list" || kind === "ordered-list") && (
        <div>
          <label className={labelCls}>Body</label>
          {kind === "text" && (
            <div className="mb-1.5 p-1.5 rounded-md bg-muted/30 border border-border/30">
              <FormatToolbar onFormat={(before, after) => {
                const ta = document.querySelector(`textarea[data-section-body="${section.heading}"]`) as HTMLTextAreaElement | null;
                if (ta) {
                  const start = ta.selectionStart;
                  const end = ta.selectionEnd;
                  const selected = section.body.substring(start, end);
                  const replacement = `${before}${selected || "text"}${after}`;
                  onChange({ body: section.body.substring(0, start) + replacement + section.body.substring(end) });
                } else {
                  onChange({ body: `${before}${section.body}${after}` });
                }
              }} />
            </div>
          )}
          <textarea data-section-body={section.heading} value={section.body} onChange={(e) => onChange({ body: e.target.value })} rows={8} placeholder={kind === "list" ? "• Item 1\n→ Item 2\n✓ Item 3\n\nOr use: - Item 1" : "Write content…\n\nBlank lines = new paragraph."} className={`${inputCls} resize-none font-mono text-xs leading-relaxed`} />
        </div>
      )}

      {/* Bullet style picker — only for list kind */}
      {kind === "list" && (
        <div>
          <label className={labelCls}>Bullet Style</label>
          <div className="flex gap-1.5">
            {[
              { label: "• Dot", marker: "•" },
              { label: "→ Arrow", marker: "→" },
              { label: "✓ Check", marker: "✓" },
              { label: "- Dash", marker: "-" },
            ].map(({ label, marker }) => {
              const current = section.body.split("\n")[0]?.charAt(0);
              const isActive = current === marker || (marker === "-" && (current === "-" || current === "•" || current === "→" || current === "✓"));
              return (
                <button key={marker} type="button" onClick={() => {
                  const lines = section.body.split("\n").filter((l) => l.trim());
                  const newBody = lines.map((l) => {
                    const text = l.replace(/^[-•→✓]\s*/, "");
                    return `${marker} ${text}`;
                  }).join("\n");
                  onChange({ body: newBody });
                }} className={`rounded-md border px-2.5 py-1.5 text-[11px] font-medium transition-colors ${isActive ? "border-accent bg-accent/10 text-accent" : "border-border/50 text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}>
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Image */}
      {kind === "image" && (
        <div className="space-y-3">
          <div>
            <label className={labelCls}>Image URL</label>
            <input value={section.body} onChange={(e) => onChange({ body: e.target.value })} placeholder="https://example.com/image.jpg" className={inputCls} />
          </div>
          <div className="rounded-lg border border-border/50 bg-muted/20 p-3 text-center">
            {section.body && section.body !== "https://images.unsplash.com/photo-1500964757637-c85e8a162699?w=800&q=80" ? (
              <img src={section.body} alt="" className="max-h-40 mx-auto rounded-lg" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
            ) : (
              <div className="py-8 flex flex-col items-center gap-2">
                <ImageIcon className="w-6 h-6 text-muted-foreground/30" />
                <p className="text-[10px] text-muted-foreground/50">Paste an image URL above</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Code */}
      {kind === "code" && (
        <div>
          <label className={labelCls}>HTML / CSS / JS</label>
          <CodeEditor value={section.body} onChange={(v) => onChange({ body: v })} placeholder="<h1>Hello</h1>" rows={12} />
          <p className="text-[9px] text-muted-foreground/50 mt-1">Live preview shown in the canvas. Tab to indent.</p>
        </div>
      )}

      {/* Quote picker */}
      {kind === "quote" && (
        <QuotePicker dbQuotes={dbQuotes} section={section} onChange={onChange} />
      )}

      {/* Social picker */}
      {kind === "social" && (
        <SocialPicker dbSocials={dbSocials} section={section} onChange={onChange} />
      )}

      {/* Columns editor */}
      {kind === "columns" && (
        <ColumnsEditor section={section} onChange={onChange} />
      )}

      {/* Blog editor */}
      {kind === "blog" && (
        <BlogEditor section={section} onChange={onChange} />
      )}

      {/* Video editor */}
      {kind === "video" && (
        <VideoEditor section={section} onChange={onChange} />
      )}

      {/* Book editor */}
      {kind === "book" && (
        <BookEditor section={section} onChange={onChange} />
      )}

      {/* Table editor */}
      {kind === "table" && (
        <TableEditor section={section} onChange={onChange} />
      )}
    </div>
  );
}

/* ── Quote Picker ────────────────────────────────────── */
function QuotePicker({ dbQuotes, section, onChange }: {
  dbQuotes: { id: string; text: string; tag: string | null }[];
  section: { heading: string; body: string };
  onChange: (patch: Partial<{ heading: string; body: string }>) => void;
}) {
  let current: { text: string; author: string } = { text: "", author: "" };
  try { current = JSON.parse(section.body); } catch { current = { text: section.body, author: "" }; }
  const [mode, setMode] = useState<"pick" | "write">(current.text && !dbQuotes.some((q) => q.text === current.text) ? "write" : "pick");

  function selectQuote(q: { text: string; tag: string | null }) {
    onChange({ body: JSON.stringify({ text: q.text, author: q.tag ?? "" }) });
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-1 rounded-lg border border-border p-0.5">
        <button type="button" onClick={() => setMode("pick")} className={`flex-1 rounded-md px-2 py-1 text-[10px] font-semibold transition-all ${mode === "pick" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"}`}>Pick from library</button>
        <button type="button" onClick={() => setMode("write")} className={`flex-1 rounded-md px-2 py-1 text-[10px] font-semibold transition-all ${mode === "write" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"}`}>Write custom</button>
      </div>
      {mode === "pick" ? (
        <div className="space-y-1 max-h-60 overflow-y-auto">
          {dbQuotes.length === 0 ? (
            <p className="text-[11px] text-muted-foreground py-2">No quotes in library yet.</p>
          ) : dbQuotes.map((q) => (
            <button key={q.id} type="button" onClick={() => selectQuote(q)}
              className={`w-full text-left rounded-lg border px-3 py-2 text-xs transition-all ${current.text === q.text ? "border-accent bg-accent/5" : "border-border hover:border-border/80 hover:bg-muted/50"}`}>
              <p className="text-foreground line-clamp-2 italic">&ldquo;{q.text}&rdquo;</p>
              {q.tag && <p className="text-[10px] text-muted-foreground mt-1">— {q.tag}</p>}
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          <textarea value={current.text} onChange={(e) => onChange({ body: JSON.stringify({ text: e.target.value, author: current.author }) })} rows={4} placeholder="Write your quote…" className={`${inputCls} resize-none`} />
          <input value={current.author} onChange={(e) => onChange({ body: JSON.stringify({ text: current.text, author: e.target.value }) })} placeholder="Author name" className={inputCls} />
        </div>
      )}
    </div>
  );
}

/* ── Social Picker ───────────────────────────────────── */
function SocialPicker({ dbSocials, section, onChange }: {
  dbSocials: { id: string; key: string; label: string; href: string; handle: string | null; color: string | null; logoUrl?: string | null }[];
  section: { heading: string; body: string };
  onChange: (patch: Partial<{ heading: string; body: string }>) => void;
}) {
  let selectedKeys: string[] = [];
  try { selectedKeys = JSON.parse(section.body).selected ?? []; } catch { selectedKeys = []; }

  // Get selected socials in order
  const selectedSocials = selectedKeys
    .map((key) => dbSocials.find((s) => s.key === key || s.label.toLowerCase() === key))
    .filter(Boolean) as typeof dbSocials;

  function toggle(key: string) {
    const next = selectedKeys.includes(key) ? selectedKeys.filter((k) => k !== key) : [...selectedKeys, key];
    onChange({ body: JSON.stringify({ selected: next }) });
  }

  function moveUp(idx: number) {
    if (idx === 0) return;
    const next = [...selectedKeys];
    [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
    onChange({ body: JSON.stringify({ selected: next }) });
  }

  function moveDown(idx: number) {
    if (idx >= selectedKeys.length - 1) return;
    const next = [...selectedKeys];
    [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
    onChange({ body: JSON.stringify({ selected: next }) });
  }

  return (
    <div className="space-y-3">
      {/* Available socials */}
      <div>
        <p className="text-[10px] text-muted-foreground mb-1.5">Available — click to add:</p>
        {dbSocials.length === 0 ? (
          <p className="text-[11px] text-muted-foreground">No social links configured.</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {dbSocials.map((s) => {
              const isSelected = selectedKeys.includes(s.key);
              return (
                <button key={s.key} type="button" onClick={() => toggle(s.key)}
                  className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-all ${isSelected ? "border-accent bg-accent/10 text-accent" : "border-border text-muted-foreground hover:border-border/80 hover:text-foreground"}`}>
                  {s.logoUrl ? <img src={s.logoUrl} alt="" className="w-3.5 h-3.5 rounded-sm" /> : <div className="w-3.5 h-3.5 rounded-sm" style={{ background: s.color ?? "#999" }} />}
                  {s.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected order */}
      {selectedSocials.length > 0 && (
        <div>
          <p className="text-[10px] text-muted-foreground mb-1.5">Selected — drag to reorder:</p>
          <div className="space-y-1">
            {selectedSocials.map((s, idx) => (
              <div key={s.key} className="flex items-center gap-2 rounded-lg border border-border px-2.5 py-1.5 bg-background">
                {s.logoUrl ? <img src={s.logoUrl} alt="" className="w-4 h-4 rounded-sm shrink-0" /> : <div className="w-4 h-4 rounded-sm shrink-0" style={{ background: s.color ?? "#999" }} />}
                <span className="flex-1 text-[11px] font-medium text-foreground">{s.label}</span>
                <div className="flex items-center gap-0.5">
                  <button type="button" onClick={() => moveUp(idx)} disabled={idx === 0} className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-20"><ChevronUp className="w-3 h-3" /></button>
                  <button type="button" onClick={() => moveDown(idx)} disabled={idx === selectedSocials.length - 1} className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-20"><ChevronDown className="w-3 h-3" /></button>
                  <button type="button" onClick={() => toggle(s.key)} className="p-0.5 text-muted-foreground hover:text-red-500"><X className="w-3 h-3" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Columns Editor ──────────────────────────────────── */
function ColumnsEditor({ section, onChange }: {
  section: { heading: string; body: string };
  onChange: (patch: Partial<{ heading: string; body: string }>) => void;
}) {
  let colData: { left: string; right: string; leftTitle: string; rightTitle: string; bulletStyle: string } = { left: "", right: "", leftTitle: "", rightTitle: "", bulletStyle: "dot" };
  try { colData = { ...colData, ...JSON.parse(section.body) }; } catch { colData = { ...colData, left: section.body }; }

  function updateCol(patch: Partial<typeof colData>) {
    onChange({ body: JSON.stringify({ ...colData, ...patch }) });
  }

  const bulletStyles = [
    { id: "dot", label: "• Dot", prefix: "•" },
    { id: "square", label: "■ Square", prefix: "■" },
    { id: "number", label: "1. Number", prefix: "" },
    { id: "roman", label: "i. Roman", prefix: "" },
  ];

  const activeBullet = bulletStyles.find((b) => b.id === colData.bulletStyle) ?? bulletStyles[0];

  return (
    <div className="space-y-3">
      <div>
        <label className={labelCls}>Bullet Style</label>
        <div className="flex gap-1 flex-wrap">
          {bulletStyles.map((b) => (
            <button key={b.id} type="button" onClick={() => updateCol({ bulletStyle: b.id })}
              className={`rounded-md border px-2 py-1 text-[10px] font-medium transition-colors ${colData.bulletStyle === b.id ? "border-accent bg-accent/10 text-accent" : "border-border/50 text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}>
              {b.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className={labelCls}>Left Column Title</label>
        <input value={colData.leftTitle} onChange={(e) => updateCol({ leftTitle: e.target.value })} placeholder="e.g. Principles" className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>Left Column</label>
        <textarea value={colData.left} onChange={(e) => updateCol({ left: e.target.value })} rows={5} placeholder={"• Item 1\n• Item 2\n• Item 3"} className={`${inputCls} resize-none text-xs font-mono`} />
      </div>
      <div>
        <label className={labelCls}>Right Column Title</label>
        <input value={colData.rightTitle} onChange={(e) => updateCol({ rightTitle: e.target.value })} placeholder="e.g. Resources" className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>Right Column</label>
        <textarea value={colData.right} onChange={(e) => updateCol({ right: e.target.value })} rows={5} placeholder={"• Item 1\n• Item 2\n• Item 3"} className={`${inputCls} resize-none text-xs font-mono`} />
      </div>
    </div>
  );
}

/* ── Blog Editor ──────────────────────────────────── */
function BlogEditor({ section, onChange }: {
  section: { heading: string; body: string };
  onChange: (patch: Partial<{ heading: string; body: string }>) => void;
}) {
  let d: { title: string; url: string; excerpt: string; image: string } = { title: "", url: "", excerpt: "", image: "" };
  try { d = JSON.parse(section.body); } catch { d = { title: section.heading, url: section.body, excerpt: "", image: "" }; }
  function update(p: Partial<typeof d>) { onChange({ body: JSON.stringify({ ...d, ...p }) }); }

  return (
    <div className="space-y-3">
      <div>
        <label className={labelCls}>Title</label>
        <input value={d.title} onChange={(e) => update({ title: e.target.value })} placeholder="Blog post title" className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>URL</label>
        <input value={d.url} onChange={(e) => update({ url: e.target.value })} placeholder="https://sagarlad.com/blog/..." className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>Hero Image URL</label>
        <input value={d.image} onChange={(e) => update({ image: e.target.value })} placeholder="https://..." className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>Excerpt</label>
        <textarea value={d.excerpt} onChange={(e) => update({ excerpt: e.target.value })} rows={3} placeholder="Short description…" className={`${inputCls} resize-none`} />
      </div>
    </div>
  );
}

/* ── Video Editor ─────────────────────────────────── */
function VideoEditor({ section, onChange }: {
  section: { heading: string; body: string };
  onChange: (patch: Partial<{ heading: string; body: string }>) => void;
}) {
  let d: { title: string; url: string; thumbnail: string } = { title: "", url: "", thumbnail: "" };
  try { d = JSON.parse(section.body); } catch { d = { title: section.heading, url: section.body, thumbnail: "" }; }
  function update(p: Partial<typeof d>) { onChange({ body: JSON.stringify({ ...d, ...p }) }); }

  return (
    <div className="space-y-3">
      <div>
        <label className={labelCls}>Title</label>
        <input value={d.title} onChange={(e) => update({ title: e.target.value })} placeholder="Video title" className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>Embed URL</label>
        <input value={d.url} onChange={(e) => update({ url: e.target.value })} placeholder="https://youtube.com/watch?v=..." className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>Thumbnail URL</label>
        <input value={d.thumbnail} onChange={(e) => update({ thumbnail: e.target.value })} placeholder="https://..." className={inputCls} />
      </div>
    </div>
  );
}

/* ── Book Editor ──────────────────────────────────── */
function BookEditor({ section, onChange }: {
  section: { heading: string; body: string };
  onChange: (patch: Partial<{ heading: string; body: string }>) => void;
}) {
  let d: { title: string; author: string; url: string; cover: string } = { title: "", author: "", url: "", cover: "" };
  try { d = JSON.parse(section.body); } catch { d = { title: section.heading, author: "", url: section.body, cover: "" }; }
  function update(p: Partial<typeof d>) { onChange({ body: JSON.stringify({ ...d, ...p }) }); }

  return (
    <div className="space-y-3">
      <div>
        <label className={labelCls}>Title</label>
        <input value={d.title} onChange={(e) => update({ title: e.target.value })} placeholder="Book title" className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>Author</label>
        <input value={d.author} onChange={(e) => update({ author: e.target.value })} placeholder="Author name" className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>URL</label>
        <input value={d.url} onChange={(e) => update({ url: e.target.value })} placeholder="https://..." className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>Cover Image URL</label>
        <input value={d.cover} onChange={(e) => update({ cover: e.target.value })} placeholder="https://..." className={inputCls} />
      </div>
    </div>
  );
}

/* ── Code Preview (debounced iframe) ─────────────────── */
const CODE_RESET = `<style>html,body{margin:0;padding:0;overflow-x:hidden;width:100%;max-width:100%}*{box-sizing:border-box;max-width:100%!important;overflow-wrap:break-word;word-wrap:break-word}pre,code{white-space:pre-wrap;word-break:break-word}</style>`;

function CodePreview({ body }: { body: string }) {
  const [srcDoc, setSrcDoc] = useState(CODE_RESET + body);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setSrcDoc(CODE_RESET + body), 300);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [body]);

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <div className="bg-muted/50 px-3 py-1 border-b border-border/50 flex items-center gap-2">
        <div className="flex gap-1"><div className="w-1.5 h-1.5 rounded-full bg-red-400" /><div className="w-1.5 h-1.5 rounded-full bg-yellow-400" /><div className="w-1.5 h-1.5 rounded-full bg-green-400" /></div>
        <span className="text-[9px] text-muted-foreground font-medium">Preview</span>
      </div>
      <iframe title="Code preview" srcDoc={srcDoc} sandbox="allow-same-origin" className="block w-full border-0 bg-white" style={{ height: "auto", minHeight: "80px", maxHeight: "400px" }} />
    </div>
  );
}

/* ── Block Group (sidebar) ───────────────────────────── */
function BlockGroup({ title, ids, onInsert, onDragStart }: { title: string; ids: string[]; onInsert: (id: string) => void; onDragStart: (e: React.DragEvent, id: string) => void }) {
  const blocks = BLOCKS.filter((b) => ids.includes(b.id));
  return (
    <div>
      <p className={sectionHeaderCls}>{title}</p>
      <div className="grid grid-cols-2 gap-1">
        {blocks.map((b) => (
          <div key={b.id} draggable onDragStart={(e) => onDragStart(e, b.id)} onClick={() => onInsert(b.id)} className={blockItemCls}>
            <b.icon className="w-3.5 h-3.5 text-muted-foreground/60 group-hover:text-foreground transition-colors shrink-0" />
            <span className="text-[10px] text-muted-foreground group-hover:text-foreground leading-tight truncate">{b.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Layout Thumbnail (mini preview) ──────────────── */
function LayoutThumbnail({ sections, accent, layoutId }: { sections: { heading: string; body: string }[]; accent: string; layoutId: string | null }) {
  // Generate mini section blocks based on layout type or actual sections
  const blocks = useMemo(() => {
    if (sections.length > 0) {
      // Show actual sections as colored bars
      return sections.slice(0, 8).map((s) => {
        const kind = sectionKind(s);
        const h = kind === "columns" ? "h-3" : kind === "image" || kind === "blog" || kind === "video" || kind === "book" ? "h-5" : kind === "divider" ? "h-0.5" : kind === "spacer" ? "h-2" : "h-1.5";
        return { kind, h };
      });
    }
    // Pre-built layout defaults
    if (layoutId === "weekly-digest") {
      return [
        { kind: "heading", h: "h-2" },
        { kind: "text", h: "h-1" },
        { kind: "blog", h: "h-5" },
        { kind: "blog", h: "h-5" },
        { kind: "blog", h: "h-5" },
        { kind: "divider", h: "h-0.5" },
        { kind: "social", h: "h-2" },
      ];
    }
    if (layoutId === "deep-dive") {
      return [
        { kind: "heading", h: "h-2" },
        { kind: "text", h: "h-1" },
        { kind: "columns", h: "h-4" },
        { kind: "text", h: "h-1" },
        { kind: "code", h: "h-5" },
        { kind: "divider", h: "h-0.5" },
        { kind: "button", h: "h-2" },
      ];
    }
    return [
      { kind: "heading", h: "h-2" },
      { kind: "text", h: "h-1" },
      { kind: "text", h: "h-1" },
      { kind: "text", h: "h-1" },
    ];
  }, [sections, layoutId]);

  return (
    <div className="w-full h-full p-2 flex flex-col gap-1">
      {/* Mini header bar */}
      <div className="flex items-center gap-1 mb-1">
        <div className="w-4 h-1 rounded-full" style={{ background: accent }} />
        <div className="h-1 flex-1 rounded-full bg-border" />
      </div>
      {/* Section blocks */}
      {blocks.map((b, i) => (
        <div key={i} className={`w-full rounded-sm ${b.h}`}
          style={{
            background: b.kind === "divider" ? accent
              : b.kind === "button" ? accent
              : b.kind === "blog" || b.kind === "image" || b.kind === "video" || b.kind === "book" ? `linear-gradient(135deg, ${accent}33, ${accent}11)`
              : b.kind === "code" ? "#f3f4f6"
              : b.kind === "columns" ? `linear-gradient(90deg, ${accent}22 50%, #f3f4f6 50%)`
              : "#e5e7eb"
          }}
        />
      ))}
      {/* Mini footer */}
      <div className="mt-auto pt-1 flex justify-center">
        <div className="h-1 w-8 rounded-full" style={{ background: accent }} />
      </div>
    </div>
  );
}

/* ── Setting Group ───────────────────────────────────── */
function SettingGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">{title}</p>
      <div className="space-y-3">{children}</div>
    </div>
  );
}
