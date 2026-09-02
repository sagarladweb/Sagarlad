"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ImageUpload } from "./ImageUpload";
import { CalendarPicker } from "./Calendar";
import { showToast } from "./Toast";
import { ColorWheel } from "./ColorWheel";
import {
  Globe,
  Tablet,
  Smartphone,
  Monitor,
  Save,
  ArrowLeft,
  Loader2,
  Megaphone,
  Layout,
  BarChart3,
  Calendar as CalendarIcon,
  Image as ImageIcon,
  Plus,
} from "lucide-react";

type Announcement = {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  buttonText: string | null;
  buttonLink: string | null;
  barText: string | null;
  barLink: string | null;
  barStyle: string;
  barSpeed: number;
  barBgColor: string | null;
  barColor: string | null;
  active: boolean;
  eventDate: string | null;
  createdAt: string;
};

function emptyForm(): Omit<Announcement, "id" | "createdAt"> {
  return {
    title: "",
    description: null,
    imageUrl: null,
    buttonText: null,
    buttonLink: null,
    barText: null,
    barLink: null,
    barStyle: "scrolling",
    barSpeed: 30,
    barBgColor: "#dbeafe",
    barColor: "#1e3a5f",
    active: false,
    eventDate: null,
  };
}

function toForm(a: Announcement): Omit<Announcement, "id" | "createdAt"> {
  return {
    title: a.title,
    description: a.description,
    imageUrl: a.imageUrl,
    buttonText: a.buttonText,
    buttonLink: a.buttonLink,
    barText: a.barText,
    barLink: a.barLink,
    barStyle: a.barStyle,
    barSpeed: a.barSpeed,
    barBgColor: a.barBgColor || "#dbeafe",
    barColor: a.barColor || "#1e3a5f",
    active: a.active,
    eventDate: a.eventDate,
  };
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const COLOR_PRESETS = [
  { label: "Blue", bg: "#dbeafe", fg: "#1e3a5f" },
  { label: "Yellow", bg: "#fef9c3", fg: "#713f12" },
];

type Device = "desktop" | "tablet" | "mobile";
type PreviewTab = "hero" | "section" | "bar" | "full";

const DEVICE_WIDTHS: Record<Device, string> = {
  desktop: "100%",
  tablet: "768px",
  mobile: "375px",
};

/* ── Bar Preview ─────────────────────────────────────────── */

function BarPreview({ form }: { form: Omit<Announcement, "id" | "createdAt"> }) {
  const text = form.barText || form.title || "Announcement text";
  const dur = Math.max(8, 60 / form.barSpeed);
  const bg = form.barBgColor || "#dbeafe";
  const fg = form.barColor || "#1e3a5f";
  return (
    <div className="rounded-lg overflow-hidden" style={{ background: bg }}>
      {form.barStyle === "scrolling" ? (
        <div className="overflow-hidden">
          <div
            key={`${form.barStyle}-${form.barSpeed}-${text}`}
            className="flex whitespace-nowrap"
            style={{ animation: `marquee-right-to-left ${dur}s linear infinite`, width: "max-content" }}
          >
            <span className="whitespace-nowrap px-6 py-2 text-xs sm:text-sm font-semibold tracking-wide" style={{ color: fg }}>{text}</span>
            <span className="whitespace-nowrap px-6 py-2 text-xs sm:text-sm font-semibold tracking-wide" style={{ color: fg }}>{text}</span>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center py-2 px-4">
          <span className="text-xs sm:text-sm font-semibold tracking-wide truncate" style={{ color: fg }}>{text}</span>
        </div>
      )}
    </div>
  );
}

/* ── Hero Preview ────────────────────────────────────────── */

function HeroPreview({ form }: { form: Omit<Announcement, "id" | "createdAt"> }) {
  const { title, description, imageUrl, buttonText, eventDate } = form;
  return (
    <div className="rounded-xl border border-border overflow-hidden bg-foreground text-background" style={{ minHeight: "400px" }}>
      <div className="relative w-full min-h-[400px]">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt={title} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-950 to-black" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-black/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/40" />
        {!imageUrl && (
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full opacity-20"
            style={{ background: "radial-gradient(circle, rgba(255,213,29,0.25) 0%, transparent 70%)", filter: "blur(60px)" }} />
        )}
        <div className="relative z-10 flex flex-col justify-end min-h-[400px] p-6 sm:p-8">
          {eventDate && (
            <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70 border border-white/20 rounded-full px-3 py-1 mb-3 self-start">
              <CalendarIcon className="w-2.5 h-2.5" />
              {formatDate(eventDate)}
            </span>
          )}
          <h3 className="font-display text-2xl sm:text-3xl font-bold text-white leading-tight max-w-lg drop-shadow-md">
            {title || "Announcement Title"}
          </h3>
          {description && <p className="mt-2 text-sm text-white/70 max-w-md leading-relaxed">{description}</p>}
          <div className="mt-4">
            {buttonText ? (
              <span className="inline-flex items-center gap-2 rounded-full bg-accent text-accent-foreground px-5 py-2 text-xs font-bold">
                {buttonText}
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-full bg-white/90 text-foreground px-5 py-2 text-xs font-bold">
                Learn more
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Section Preview ─────────────────────────────────────── */

function SectionPreview({ form }: { form: Omit<Announcement, "id" | "createdAt"> }) {
  const { title, description, imageUrl, buttonText, eventDate } = form;
  return (
    <div className="rounded-xl border border-border overflow-hidden bg-background">
      {imageUrl ? (
        <div className="relative w-full min-h-[200px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt={title} className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="relative z-10 flex flex-col justify-end min-h-[200px] p-6">
            <span className="inline-flex items-center rounded-full bg-accent px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-accent-foreground mb-2 self-start">
              New Event
            </span>
            <h3 className="font-display text-xl sm:text-2xl font-bold text-white leading-tight max-w-lg">
              {title || "Announcement Title"}
            </h3>
            {eventDate && <p className="mt-1 text-xs font-medium text-white/90">{formatDate(eventDate)}</p>}
            {description && <p className="mt-2 text-sm text-white/80 max-w-md leading-relaxed">{description}</p>}
            {buttonText && (
              <span className="inline-flex items-center gap-2 rounded-full bg-accent text-accent-foreground px-5 py-2 text-xs font-bold mt-3 self-start">
                {buttonText}
              </span>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center p-8">
          <span className="inline-flex items-center rounded-full bg-accent/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-accent-strong mb-3">
            New Event
          </span>
          <h3 className="font-display text-xl sm:text-2xl font-bold text-foreground leading-tight max-w-lg mx-auto">
            {title || "Announcement Title"}
          </h3>
          {eventDate && <p className="mt-1 text-sm font-medium text-muted-foreground">{formatDate(eventDate)}</p>}
          {description && <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">{description}</p>}
          {buttonText && (
            <span className="inline-flex items-center gap-2 rounded-full bg-accent text-accent-foreground px-5 py-2 text-xs font-bold mt-3">
              {buttonText}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Full Preview ────────────────────────────────────────── */

function FullPreview({ form }: { form: Omit<Announcement, "id" | "createdAt"> }) {
  return (
    <div className="rounded-xl border border-border overflow-hidden bg-background">
      <BarPreview form={form} />
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-background/80 backdrop-blur">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full" style={{ background: "#0d21a1" }} />
          <span className="text-sm font-bold text-foreground">Sagar Lad</span>
        </div>
        <div className="hidden sm:flex items-center gap-4">
          <span className="text-xs text-muted-foreground">Home</span>
          <span className="text-xs text-muted-foreground">Blog</span>
          <span className="text-xs text-muted-foreground">Videos</span>
        </div>
      </div>
      <SectionPreview form={form} />
      <div className="p-6 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="font-display text-lg font-bold text-foreground">Hi, I&apos;m Sagar</h2>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">Helping you build wealth, think clearly, and live intentionally.</p>
        </div>
        <div className="rounded-lg bg-accent/10 p-4 text-center space-y-2">
          <p className="text-xs font-bold text-foreground">Subscribe to the Newsletter</p>
          <div className="flex gap-2">
            <input type="text" placeholder="your@email.com" className="flex-1 rounded-lg border border-border px-3 py-1.5 text-[10px] bg-background" disabled />
            <div className="rounded-lg bg-accent text-accent-foreground px-3 py-1.5 text-[10px] font-bold">Subscribe</div>
          </div>
        </div>
      </div>
    </div>
  );
}

const PREVIEW_MAP: Record<PreviewTab, typeof SectionPreview> = {
  hero: HeroPreview,
  section: SectionPreview,
  bar: BarPreview,
  full: FullPreview,
};

/* ── Color Picker ────────────────────────────────────────── */

function BarColorPicker({
  bgColor,
  textColor,
  onChangeBg,
  onChangeText,
}: {
  bgColor: string;
  textColor: string;
  onChangeBg: (c: string) => void;
  onChangeText: (c: string) => void;
}) {
  const [showCustomBg, setShowCustomBg] = useState(false);
  const [showCustomFg, setShowCustomFg] = useState(false);

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <label className="text-xs font-semibold text-muted-foreground">Bar Background</label>
        <div className="flex items-center gap-2 flex-wrap">
          {COLOR_PRESETS.map((p) => (
            <button
              key={p.bg}
              type="button"
              onClick={() => onChangeBg(p.bg)}
              className={`w-8 h-8 rounded-lg border-2 transition-all ${
                bgColor === p.bg ? "border-accent scale-110" : "border-border hover:border-muted-foreground/50"
              }`}
              style={{ backgroundColor: p.bg }}
              title={p.label}
            />
          ))}
          <button
            type="button"
            onClick={() => setShowCustomBg(!showCustomBg)}
            className="w-8 h-8 rounded-lg border-2 border-dashed border-border hover:border-muted-foreground/50 flex items-center justify-center text-muted-foreground transition-colors"
            title="Custom color"
          >
            <Plus className="w-3 h-3" />
          </button>
          <input
            type="text"
            value={bgColor}
            onChange={(e) => onChangeBg(e.target.value)}
            className="w-24 rounded-lg border border-border bg-background px-2 py-1 text-xs font-mono"
            placeholder="#hex"
          />
        </div>
        {showCustomBg && (
          <div className="p-3 rounded-lg border border-border bg-background">
            <ColorWheel color={bgColor} onChange={onChangeBg} />
          </div>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold text-muted-foreground">Bar Text</label>
        <div className="flex items-center gap-2 flex-wrap">
          {COLOR_PRESETS.map((p) => (
            <button
              key={p.fg}
              type="button"
              onClick={() => onChangeText(p.fg)}
              className={`w-8 h-8 rounded-lg border-2 transition-all ${
                textColor === p.fg ? "border-accent scale-110" : "border-border hover:border-muted-foreground/50"
              }`}
              style={{ backgroundColor: p.fg }}
              title={p.label}
            />
          ))}
          <button
            type="button"
            onClick={() => setShowCustomFg(!showCustomFg)}
            className="w-8 h-8 rounded-lg border-2 border-dashed border-border hover:border-muted-foreground/50 flex items-center justify-center text-muted-foreground transition-colors"
            title="Custom color"
          >
            <Plus className="w-3 h-3" />
          </button>
          <input
            type="text"
            value={textColor}
            onChange={(e) => onChangeText(e.target.value)}
            className="w-24 rounded-lg border border-border bg-background px-2 py-1 text-xs font-mono"
            placeholder="#hex"
          />
        </div>
        {showCustomFg && (
          <div className="p-3 rounded-lg border border-border bg-background">
            <ColorWheel color={textColor} onChange={onChangeText} />
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Main Form ───────────────────────────────────────────── */

type AnnouncementFormProps = {
  initial?: Announcement;
};

export function AnnouncementForm({ initial }: AnnouncementFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<Omit<Announcement, "id" | "createdAt">>(
    initial ? toForm(initial) : emptyForm
  );
  const [device, setDevice] = useState<Device>("desktop");
  const [previewTab, setPreviewTab] = useState<PreviewTab>("section");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!form.title.trim()) { showToast("Title is required", undefined, "error"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, id: initial?.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed");
      showToast(initial ? "Updated" : "Created");
      router.push("/admin/announcement");
    } catch (err) {
      showToast("Save failed", err instanceof Error ? err.message : undefined, "error");
    } finally { setSaving(false); }
  }

  const devices: { key: Device; icon: typeof Monitor; label: string }[] = [
    { key: "desktop", icon: Monitor, label: "Desktop" },
    { key: "tablet", icon: Tablet, label: "Tablet" },
    { key: "mobile", icon: Smartphone, label: "Mobile" },
  ];

  const previewTabs: { key: PreviewTab; icon: typeof Layout; label: string }[] = [
    { key: "hero", icon: ImageIcon, label: "Hero" },
    { key: "section", icon: Layout, label: "Section" },
    { key: "bar", icon: BarChart3, label: "Bar" },
    { key: "full", icon: Globe, label: "Full Page" },
  ];

  const PreviewComponent = PREVIEW_MAP[previewTab];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/admin/announcement")}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="font-display text-lg font-bold">
            {initial ? "Edit Announcement" : "New Announcement"}
          </h1>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !form.title.trim()}
          className="inline-flex items-center gap-2 rounded-full bg-accent text-accent-foreground px-5 py-2.5 text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {initial ? "Update" : "Create"}
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Left: Form */}
        <div className="xl:col-span-3 space-y-5">
          {/* Content */}
          <div className="rounded-xl border border-border bg-card p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Layout className="w-4 h-4 text-muted-foreground" />
              <h2 className="font-display text-sm font-bold">Content</h2>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground">Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Upcoming AI Summit 2026"
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground">Description</label>
              <textarea
                value={form.description ?? ""}
                onChange={(e) => setForm({ ...form, description: e.target.value || null })}
                rows={3}
                placeholder="Brief description of the announcement..."
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 resize-none"
              />
            </div>

            <ImageUpload
              value={form.imageUrl}
              onChange={(url) => setForm({ ...form, imageUrl: url })}
              label="Banner Image"
              folder="announcements"
            />

            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                <CalendarIcon className="w-3.5 h-3.5" />
                Event Date (optional)
              </label>
              <CalendarPicker
                value={form.eventDate ? form.eventDate.slice(0, 10) : null}
                onChange={(date) => setForm({ ...form, eventDate: date })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">Button Text</label>
                <input
                  type="text"
                  value={form.buttonText ?? ""}
                  onChange={(e) => setForm({ ...form, buttonText: e.target.value || null })}
                  placeholder="e.g. Register Now"
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">Button Link</label>
                <input
                  type="url"
                  value={form.buttonLink ?? ""}
                  onChange={(e) => setForm({ ...form, buttonLink: e.target.value || null })}
                  placeholder="https://..."
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
                />
              </div>
            </div>
          </div>

          {/* Bar */}
          <div className="rounded-xl border border-border bg-card p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-muted-foreground" />
              <h2 className="font-display text-sm font-bold">Announcement Bar</h2>
            </div>
            <p className="text-xs text-muted-foreground">
              Always shown above the header when announcement is active.
            </p>

            <div className="space-y-3">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">Bar Text</label>
                <input
                  type="text"
                  value={form.barText ?? ""}
                  onChange={(e) => setForm({ ...form, barText: e.target.value || null })}
                  placeholder="Uses section title if empty"
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">Bar Link</label>
                <input
                  type="url"
                  value={form.barLink ?? ""}
                  onChange={(e) => setForm({ ...form, barLink: e.target.value || null })}
                  placeholder="Uses button link if empty"
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground">Style</label>
                  <div className="flex rounded-lg border border-border overflow-hidden">
                    {(["scrolling", "static"] as const).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setForm({ ...form, barStyle: s })}
                        className={`flex-1 px-4 py-2 text-xs font-medium transition-colors ${
                          form.barStyle === s
                            ? "bg-accent text-accent-foreground"
                            : "bg-background text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {s === "scrolling" ? "Scrolling" : "Static"}
                      </button>
                    ))}
                  </div>
                </div>

                {form.barStyle === "scrolling" && (
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground">
                      Speed: {form.barSpeed}px/s
                    </label>
                    <input
                      type="range"
                      min={10}
                      max={60}
                      value={form.barSpeed}
                      onChange={(e) => setForm({ ...form, barSpeed: Number(e.target.value) })}
                      className="w-full accent-accent"
                    />
                  </div>
                )}
              </div>

              <BarColorPicker
                bgColor={form.barBgColor || "#dbeafe"}
                textColor={form.barColor || "#1e3a5f"}
                onChangeBg={(c) => setForm({ ...form, barBgColor: c })}
                onChangeText={(c) => setForm({ ...form, barColor: c })}
              />
            </div>
          </div>

          {/* Popup */}
          <div className="rounded-xl border border-border bg-card p-5 sm:p-6 space-y-2">
            <h2 className="font-display text-sm font-bold">Popup</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Popup shows 6 seconds after page load and auto-closes after 5 seconds.
              Appears once per session per announcement.
            </p>
          </div>
        </div>

        {/* Right: Preview */}
        <div className="xl:col-span-2 space-y-3 xl:sticky xl:top-6 xl:self-start">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-0.5">
              {previewTabs.map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setPreviewTab(t.key)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      previewTab === t.key
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{t.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-0.5">
              {devices.map((d) => {
                const Icon = d.icon;
                return (
                  <button
                    key={d.key}
                    type="button"
                    onClick={() => setDevice(d.key)}
                    className={`p-1.5 rounded-md transition-colors ${
                      device === d.key
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    title={d.label}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </button>
                );
              })}
            </div>
          </div>

          <div
            className="rounded-xl border border-border bg-muted/30 overflow-auto p-4"
            style={{ height: "calc(100vh - 200px)", minHeight: "400px" }}
          >
            <div
              className="mx-auto transition-all duration-300"
              style={{ maxWidth: DEVICE_WIDTHS[device] }}
            >
              <PreviewComponent form={form} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
