"use client";

import { useState, useEffect, useCallback } from "react";
import { ImageUpload } from "./ImageUpload";
import { CalendarPicker } from "./Calendar";
import { showToast } from "./Toast";
import {
  Globe,
  Tablet,
  Smartphone,
  Monitor,
  Save,
  Trash2,
  Plus,
  Eye,
  EyeOff,
  ExternalLink,
  Loader2,
  Megaphone,
  Layout,
  BarChart3,
  Calendar as CalendarIcon,
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
  active: boolean;
  eventDate: string | null;
  createdAt: string;
};

const EMPTY: Omit<Announcement, "id" | "createdAt"> = {
  title: "",
  description: null,
  imageUrl: null,
  buttonText: null,
  buttonLink: null,
  barText: null,
  barLink: null,
  barStyle: "scrolling",
  barSpeed: 30,
  active: false,
  eventDate: null,
};

type Device = "desktop" | "tablet" | "mobile";
type PreviewTab = "section" | "bar" | "full";

const DEVICE_WIDTHS: Record<Device, string> = {
  desktop: "100%",
  tablet: "768px",
  mobile: "375px",
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function BarPreview({ form }: { form: typeof EMPTY }) {
  const text = form.barText || form.title || "Announcement text";
  const dur = Math.max(8, 60 / form.barSpeed);
  return (
    <div className="rounded-lg overflow-hidden" style={{ background: "#e8f4fd" }}>
      {form.barStyle === "scrolling" ? (
        <div className="overflow-hidden">
          {/* key forces remount → animation restarts on speed/style change */}
          <div
            key={`${form.barStyle}-${form.barSpeed}-${text}`}
            className="flex whitespace-nowrap"
            style={{ animation: `marquee ${dur}s linear infinite` }}
          >
            <span className="whitespace-nowrap px-6 py-2 text-xs sm:text-sm font-semibold tracking-wide" style={{ color: "#1a1a2e" }}>{text}</span>
            <span className="whitespace-nowrap px-6 py-2 text-xs sm:text-sm font-semibold tracking-wide" style={{ color: "#1a1a2e" }}>{text}</span>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center py-2 px-4 gap-2">
          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "#3f88c5" }} />
          <span className="text-xs sm:text-sm font-semibold tracking-wide truncate" style={{ color: "#1a1a2e" }}>{text}</span>
        </div>
      )}
    </div>
  );
}

function SectionPreview({ form }: { form: typeof EMPTY }) {
  const { title, description, imageUrl, buttonText, buttonLink, eventDate } = form;
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
                {buttonText} <ExternalLink className="w-3 h-3" />
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
              {buttonText} <ExternalLink className="w-3 h-3" />
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function FullPreview({ form }: { form: typeof EMPTY }) {
  return (
    <div className="rounded-xl border border-border overflow-hidden bg-background">
      <BarPreview form={form} />

      {/* Navbar mock */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-background/80 backdrop-blur">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-brand" style={{ background: "#0d21a1" }} />
          <span className="text-sm font-bold text-foreground">Sagar Lad</span>
        </div>
        <div className="hidden sm:flex items-center gap-4">
          <span className="text-xs text-muted-foreground">Home</span>
          <span className="text-xs text-muted-foreground">Blog</span>
          <span className="text-xs text-muted-foreground">Videos</span>
          <span className="text-xs text-muted-foreground">Speaking</span>
        </div>
      </div>

      <SectionPreview form={form} />

      {/* More page sections mock */}
      <div className="p-6 space-y-6">
        {/* Hero text */}
        <div className="text-center space-y-2">
          <h2 className="font-display text-lg font-bold text-foreground">Hi, I&apos;m Sagar</h2>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">Helping you build wealth, think clearly, and live intentionally.</p>
        </div>

        {/* Topics grid mock */}
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Popular Topics</p>
          <div className="grid grid-cols-3 gap-2">
            {["Money", "Career", "Books", "Habits", "Startups", "Anxiety"].map((t) => (
              <div key={t} className="rounded-lg border border-border p-2 text-center text-[10px] text-muted-foreground hover:border-accent/50 transition-colors">
                {t}
              </div>
            ))}
          </div>
        </div>

        {/* Blog preview mock */}
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Latest Posts</p>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3 rounded-lg border border-border p-3">
                <div className="w-16 h-16 rounded-lg bg-muted shrink-0" />
                <div className="space-y-1 flex-1">
                  <div className="h-3 bg-muted rounded w-3/4" />
                  <div className="h-2 bg-muted rounded w-1/2" />
                  <div className="h-2 bg-muted rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonial mock */}
        <div className="rounded-lg border border-border p-4 text-center space-y-2">
          <div className="w-10 h-10 rounded-full bg-muted mx-auto" />
          <p className="text-[10px] text-muted-foreground italic">&quot;Sagar&apos;s content changed how I think about money.&quot;</p>
          <p className="text-[10px] font-bold text-foreground">— Subscriber</p>
        </div>

        {/* Newsletter mock */}
        <div className="rounded-lg bg-accent/10 p-4 text-center space-y-2">
          <p className="text-xs font-bold text-foreground">Subscribe to the Newsletter</p>
          <div className="flex gap-2">
            <input type="text" placeholder="your@email.com" className="flex-1 rounded-lg border border-border px-3 py-1.5 text-[10px] bg-background" disabled />
            <div className="rounded-lg bg-accent text-accent-foreground px-3 py-1.5 text-[10px] font-bold">Subscribe</div>
          </div>
        </div>
      </div>

      {/* Footer mock */}
      <div className="border-t border-border px-4 py-6 space-y-3">
        <div className="flex justify-center gap-4">
          {["X", "YouTube", "LinkedIn", "Instagram"].map((s) => (
            <span key={s} className="text-[10px] text-muted-foreground">{s}</span>
          ))}
        </div>
        <p className="text-center text-[9px] text-muted-foreground">&copy; 2026 Sagar Lad. All rights reserved.</p>
      </div>
    </div>
  );
}

const PREVIEW_MAP: Record<PreviewTab, typeof SectionPreview> = {
  section: SectionPreview,
  bar: BarPreview,
  full: FullPreview,
};

export function AnnouncementManager() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [device, setDevice] = useState<Device>("desktop");
  const [previewTab, setPreviewTab] = useState<PreviewTab>("section");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/announcements");
      const data = await res.json();
      setAnnouncements(data.announcements ?? []);
    } catch {
      showToast("Failed to load announcements", undefined, "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  function resetForm() { setForm(EMPTY); setEditingId(null); }

  function edit(a: Announcement) {
    setEditingId(a.id);
    setForm({
      title: a.title, description: a.description, imageUrl: a.imageUrl,
      buttonText: a.buttonText, buttonLink: a.buttonLink,
      barText: a.barText, barLink: a.barLink, barStyle: a.barStyle,
      barSpeed: a.barSpeed, active: a.active, eventDate: a.eventDate,
    });
  }

  async function handleSave() {
    if (!form.title.trim()) { showToast("Title is required", undefined, "error"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, id: editingId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed");
      showToast(editingId ? "Updated" : "Created");
      resetForm();
      load();
    } catch (err) {
      showToast("Save failed", err instanceof Error ? err.message : undefined, "error");
    } finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this announcement?")) return;
    try {
      const res = await fetch(`/api/admin/announcements?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      showToast("Deleted");
      if (editingId === id) resetForm();
      load();
    } catch { showToast("Delete failed", undefined, "error"); }
  }

  async function toggleActive(a: Announcement) {
    try {
      const res = await fetch("/api/admin/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: a.id, active: !a.active }),
      });
      if (!res.ok) throw new Error("Toggle failed");
      showToast(a.active ? "Deactivated" : "Activated");
      load();
    } catch { showToast("Toggle failed", undefined, "error"); }
  }

  const devices: { key: Device; icon: typeof Monitor; label: string }[] = [
    { key: "desktop", icon: Monitor, label: "Desktop" },
    { key: "tablet", icon: Tablet, label: "Tablet" },
    { key: "mobile", icon: Smartphone, label: "Mobile" },
  ];

  const previewTabs: { key: PreviewTab; icon: typeof Layout; label: string }[] = [
    { key: "section", icon: Layout, label: "Section" },
    { key: "bar", icon: BarChart3, label: "Bar" },
    { key: "full", icon: Globe, label: "Full Page" },
  ];

  const PreviewComponent = PREVIEW_MAP[previewTab];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 min-h-0">
      {/* Left: Form */}
      <div className="xl:col-span-3 space-y-5">
        {/* Section Content */}
        <div className="rounded-xl border border-border bg-card p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Layout className="w-4 h-4 text-muted-foreground" />
            <h2 className="font-display text-sm font-bold">
              {editingId ? "Edit Announcement" : "New Announcement"}
            </h2>
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

          {/* Event Date */}
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

        {/* Announcement Bar */}
        <div className="rounded-xl border border-border bg-card p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-muted-foreground" />
            <h2 className="font-display text-sm font-bold">Announcement Bar</h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Always shown above the header when announcement is active.
          </p>

          <div className="space-y-4">
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
          </div>
        </div>

        {/* Popup Settings */}
        <div className="rounded-xl border border-border bg-card p-5 sm:p-6 space-y-3">
          <h2 className="font-display text-sm font-bold">Popup</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Popup shows 6 seconds after page load and auto-closes after 5 seconds.
            Appears once per session per announcement.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !form.title.trim()}
            className="inline-flex items-center gap-2 rounded-full bg-accent text-accent-foreground px-5 py-2.5 text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {editingId ? "Update" : "Create"}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Cancel
            </button>
          )}
        </div>

        {/* Saved list */}
        <div className="rounded-xl border border-border bg-card p-5 sm:p-6 space-y-3">
          <h2 className="font-display text-sm font-bold">Saved</h2>
          {loading && <p className="text-sm text-muted-foreground">Loading...</p>}
          {!loading && announcements.length === 0 && (
            <p className="text-sm text-muted-foreground">No announcements yet.</p>
          )}
          {announcements.map((a) => (
            <div
              key={a.id}
              className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{a.title}</p>
                <p className="text-[11px] text-muted-foreground">
                  {a.eventDate && (
                    <span className="inline-flex items-center gap-1 mr-2">
                      <CalendarIcon className="w-2.5 h-2.5" />
                      {formatDate(a.eventDate)}
                    </span>
                  )}
                  {new Date(a.createdAt).toLocaleDateString()}
                </p>
              </div>
              <button
                type="button"
                onClick={() => toggleActive(a)}
                className={`p-1.5 rounded-lg transition-colors ${
                  a.active
                    ? "text-green-600 bg-green-500/10 hover:bg-green-500/20"
                    : "text-muted-foreground hover:bg-muted"
                }`}
                title={a.active ? "Active — click to deactivate" : "Inactive — click to activate"}
              >
                {a.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={() => edit(a)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                title="Edit"
              >
                <Plus className="w-4 h-4 rotate-45" />
              </button>
              <button
                type="button"
                onClick={() => handleDelete(a.id)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-500/10 transition-colors"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Right: Live Preview */}
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
  );
}
