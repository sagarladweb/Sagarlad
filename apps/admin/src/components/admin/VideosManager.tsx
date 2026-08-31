"use client";

import { useEffect, useRef, useState } from "react";
import {
  Plus,
  Trash2,
  Loader2,
  Pencil,
  Link2,
  Monitor,
  Smartphone,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Wand2,
} from "lucide-react";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { youtubeThumb } from "@/lib/youtube";
import { isInstagramUrl } from "@/lib/instagram";
import { normalizeVideoUrl, type VideoPlatform } from "@/lib/video";
import { FaYoutube, FaInstagram } from "react-icons/fa6";
import { showConfirm } from "@/components/admin/ConfirmDialog";
import { showToast } from "@/components/admin/Toast";
import { Dropdown } from "@/components/ui/Dropdown";
import { Modal } from "@/components/ui/Modal";
import { inputCls } from "@/components/ui/Input";

type Video = {
  id: string;
  title: string;
  slug: string | null;
  embedUrl: string;
  thumbnail: string | null;
  content: string | null;
  layout: string;
  published: boolean;
  sortOrder: number;
  categoryId: string | null;
};

type VideoForm = {
  title: string;
  slug: string;
  embedUrl: string;
  thumbnail: string | null;
  content: string;
  layout: "video-first" | "text-first" | "split";
  published: boolean;
  sortOrder: number;
  categoryId: string;
};

type CategoryOption = {
  id: string;
  name: string;
};

const empty: VideoForm = {
  title: "",
  slug: "",
  embedUrl: "",
  thumbnail: null,
  content: "",
  layout: "video-first",
  published: true,
  sortOrder: 0,
  categoryId: "",
};

const LAYOUTS: { value: VideoForm["layout"]; label: string }[] = [
  { value: "video-first", label: "Video first" },
  { value: "text-first", label: "Text first" },
  { value: "split", label: "Split" },
];

const URL_HINTS: Record<VideoPlatform, { label: string; placeholder: string }> = {
  youtube: {
    label: "YouTube link *",
    placeholder:
      "https://www.youtube.com/watch?v=… · youtu.be/… · or embed link",
  },
  instagram: {
    label: "Instagram link *",
    placeholder:
      "https://www.instagram.com/reel/…  or  https://www.instagram.com/p/…",
  },
};

function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 200);
}

export function VideosManager() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<VideoForm | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [tab, setTab] = useState<VideoPlatform>("youtube");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [videoPage, setVideoPage] = useState(1);

  const isEditingInstagram = () =>
    !!editing && isInstagramUrl(editing.embedUrl);

  async function fetchFromUrl() {
    if (!editing || !editing.embedUrl.trim()) {
      showToast("Paste a YouTube or Instagram link first.", undefined, "error");
      return;
    }
    setFetching(true);
    try {
      const res = await fetch(
        `/api/admin/videos/import?url=${encodeURIComponent(editing.embedUrl.trim())}`
      );
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        if (data.platform === "instagram") {
          showToast("Instagram link detected. Add a title — thumbnail is optional.");
          if (!editing.title.trim()) {
            setEditing({ ...editing, title: "Instagram Reel" });
          }
        } else {
          setEditing({
            ...editing,
            title: editing.title.trim() || data.title || editing.title,
            thumbnail: editing.thumbnail ?? data.thumbnailUrl ?? null,
          });
          showToast(
            `Auto-filled${data.title ? ` "${data.title}"` : ""} and thumbnail from YouTube.`
          );
        }
      } else {
        showToast(data.error ?? "Could not fetch that video.", undefined, "error");
      }
    } catch {
      showToast("Could not reach YouTube.", undefined, "error");
    } finally {
      setFetching(false);
    }
  }

  async function handlePastedImage(dataUrl: string) {
    if (!editing) return;
    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataUrl, folder: "videos" }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.url) {
        setEditing({ ...editing, thumbnail: data.url });
        showToast("Pasted image uploaded.");
      } else {
        showToast(data.error ?? "Could not upload that image.", undefined, "error");
      }
    } catch {
      showToast("Could not upload the pasted image.", undefined, "error");
    }
  }

  async function load(): Promise<Video[] | null> {
    let fetched: Video[] = [];
    try {
      const res = await fetch("/api/admin/videos");
      if (res.ok) {
        const data = await res.json();
        fetched = data.videos;
        setVideos(fetched);
      }
      const catRes = await fetch("/api/admin/categories");
      if (catRes.ok) {
        const data = await catRes.json();
        setCategories(data.categories.map((c: { id: string; name: string }) => ({ id: c.id, name: c.name })));
      }
      return fetched;
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load().then((fetched) => {
      const id = new URLSearchParams(window.location.search).get("edit");
      if (!id || !fetched) return;
      const v = fetched.find((x) => x.id === id);
      if (v) {
        startEdit(v);
        const url = new URL(window.location.href);
        url.searchParams.delete("edit");
        window.history.replaceState(null, "", url.toString());
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function platformOf(v: Video): VideoPlatform {
    return isInstagramUrl(v.embedUrl) ? "instagram" : "youtube";
  }

  function startNew() {
    setEditing({ ...empty });
    setEditingId(null);
  }

  function startEdit(v: Video) {
    setEditing({
      title: v.title,
      slug: v.slug ?? "",
      embedUrl: v.embedUrl,
      thumbnail: v.thumbnail,
      content: v.content ?? "",
      layout: (v.layout as VideoForm["layout"]) ?? "video-first",
      published: v.published,
      sortOrder: v.sortOrder,
      categoryId: v.categoryId ?? "",
    });
    setTab(platformOf(v));
    setEditingId(v.id);
  }

  function cancelEdit() {
    setEditing(null);
    setEditingId(null);
    setShowAdvanced(false);
  }

  // When a full URL lands in the box (paste/type), auto-fetch details once.
  // Manual retries are still available via "Fetch details".
  const lastAutoFetch = useRef<string>("");
  function onEmbedUrlChange(value: string) {
    if (!editing) return;
    setEditing({ ...editing, embedUrl: value });
    const trimmed = value.trim();
    const looksLikeUrl = /^https?:\/\/\S+$/.test(trimmed) && trimmed.length > 15;
    if (!looksLikeUrl || trimmed === lastAutoFetch.current) return;
    lastAutoFetch.current = trimmed;
    const delay = setTimeout(() => {
      if (lastAutoFetch.current === trimmed) fetchFromUrl();
    }, 800);
    // ponytail: timer isn't cleared on unmount; admin pages rarely unmount
    // mid-typing and the fetch is idempotent, so a stray fire is harmless.
    void delay;
  }

  async function save() {
    if (!editing || !editing.title.trim()) {
      showToast("Title is required.", undefined, "error");
      return;
    }
    const normalized = normalizeVideoUrl(editing.embedUrl);
    if (!normalized) {
      showToast("That doesn't look like a YouTube or Instagram link.", undefined, "error");
      return;
    }
    setBusy(true);
    const payload = {
      ...(editingId ? { id: editingId } : {}),
      title: editing.title.trim(),
      slug: editing.slug.trim() || slugify(editing.title.trim()),
      embedUrl: normalized.url,
      thumbnail: editing.thumbnail,
      content: editing.content.trim(),
      layout: editing.layout,
      published: editing.published,
      sortOrder: Number(editing.sortOrder || 0),
      categoryId: editing.categoryId || null,
    };
    const res = await fetch("/api/admin/videos", {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      showToast(data.error ?? "Something went wrong.", undefined, "error");
      return;
    }
    setEditing(null);
    setEditingId(null);
    showToast(editingId ? "Video updated." : "Video added.");
    await load();
  }

  async function remove(id: string) {
    const ok = await showConfirm({
      title: "Delete video?",
      message: "This removes the video from your site. This action cannot be undone.",
    });
    if (!ok) return;
    const res = await fetch(`/api/admin/videos?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setVideos((v) => v.filter((x) => x.id !== id));
      if (editingId === id) {
        setEditing(null);
        setEditingId(null);
      }
    }
  }

  const hint = URL_HINTS[tab];
  const tabVideos = videos.filter((v) => platformOf(v) === tab);
  const counts = {
    youtube: videos.filter((v) => platformOf(v) === "youtube").length,
    instagram: videos.filter((v) => platformOf(v) === "instagram").length,
  };

  const VIDEO_PAGE_SIZE = 24;
  const videoPageCount = Math.max(1, Math.ceil(tabVideos.length / VIDEO_PAGE_SIZE));
  const safeVideoPage = Math.min(videoPage, videoPageCount);
  const pagedVideos = tabVideos.slice(
    (safeVideoPage - 1) * VIDEO_PAGE_SIZE,
    safeVideoPage * VIDEO_PAGE_SIZE
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="w-64">
          <Dropdown
            id="video-platform"
            label="Platform"
            value={tab}
            onChange={(v) => {
              setTab(v as VideoPlatform);
              setVideoPage(1);
            }}
            options={[
              { value: "youtube", label: `YouTube (${counts.youtube})` },
              { value: "instagram", label: `Instagram (${counts.instagram})` },
            ]}
          />
        </div>
        <p className="text-sm text-muted-foreground">
          {tabVideos.length} {tab} video{tabVideos.length === 1 ? "" : "s"}
        </p>
        {!editing && (
          <button
            onClick={startNew}
            className="ml-auto inline-flex items-center gap-2 rounded-full bg-accent text-accent-foreground px-5 py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" /> Add {tab} video
          </button>
        )}
      </div>

      {editing && (
        <Modal
          open
          title={editingId ? `Edit ${tab} video` : `New ${tab} video`}
          onClose={cancelEdit}
          wide
          footer={
            <>
              <button
                type="submit"
                form="video-form"
                disabled={busy}
                className="inline-flex items-center gap-2 rounded-full bg-accent text-accent-foreground px-5 py-2.5 text-sm font-semibold disabled:opacity-60"
              >
                {busy && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingId ? "Save changes" : "Add video"}
              </button>
              <button
                type="button"
                onClick={cancelEdit}
                className="flex-1 sm:flex-none rounded-full border border-border px-5 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
            </>
          }
        >
        <form
          id="video-form"
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}
          className="space-y-4"
          noValidate
        >
          <div className="flex items-center gap-2">
            {tab === "youtube" ? (
              <FaYoutube className="w-4 h-4 text-red-600" />
            ) : (
              <FaInstagram className="w-4 h-4 text-pink-600" />
            )}
            {!editingId && (
              <span className="ml-auto rounded-full bg-accent/15 text-accent px-3 py-1 text-xs font-medium">
                Paste a link below — the rest fills in automatically
              </span>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">
              {hint.label} *
            </label>
            <input
              value={editing.embedUrl}
              onChange={(e) => onEmbedUrlChange(e.target.value)}
              placeholder={hint.placeholder}
              className={`${inputCls} ${fetching ? "opacity-60" : ""}`}
              autoFocus
            />
            <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs text-muted-foreground">
                Paste a link, an embed URL, or a full{" "}
                <code className="text-accent">&lt;iframe&gt;</code> snippet — we
                normalize it so clips play inline.
              </p>
              <button
                type="button"
                onClick={fetchFromUrl}
                disabled={fetching || !editing.embedUrl.trim()}
                className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-accent disabled:opacity-50 transition-colors"
              >
                {fetching ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Wand2 className="w-3.5 h-3.5" />
                )}
                {fetching ? "Fetching…" : "Fetch details"}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Title *</label>
            <input
              value={editing.title}
              onChange={(e) => setEditing({ ...editing, title: e.target.value })}
              placeholder="Auto-filled from the link when you paste one"
              className={inputCls}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Category</label>
            <Dropdown
              id="video-category"
              label="Category"
              value={editing.categoryId}
              onChange={(v) => setEditing({ ...editing, categoryId: v })}
              placeholder="No category"
              options={categories.map((c) => ({ value: c.id, label: c.name }))}
            />
          </div>

          <LivePreview
            title={editing.title || "Your video title"}
            content={editing.content}
            layout={editing.layout}
            thumb={editing.thumbnail ?? youtubeThumb(editing.embedUrl)}
            isInstagram={isEditingInstagram()}
          />

          {/* Advanced options */}
          <div className="rounded-xl border border-border">
            <button
              type="button"
              onClick={() => setShowAdvanced((s) => !s)}
              aria-expanded={showAdvanced}
              className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              <span className="inline-flex items-center gap-1.5">
                <Link2 className="w-3.5 h-3.5" /> More options
              </span>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${showAdvanced ? "rotate-180" : ""}`}
              />
            </button>
            {showAdvanced && (
              <div className="space-y-4 border-t border-border p-4">
                <div className="flex flex-wrap gap-4 items-start">
                  <ImageUpload
                    label="Thumbnail (optional)"
                    folder="videos"
                    value={editing.thumbnail}
                    onChange={(url) => setEditing({ ...editing, thumbnail: url })}
                    onPastedDataUrl={handlePastedImage}
                  />
                  <div className="flex flex-col gap-2 pt-5">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={editing.published}
                        onChange={(e) =>
                          setEditing({ ...editing, published: e.target.checked })
                        }
                        className="accent-[var(--accent)]"
                      />
                      Published (visible)
                    </label>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Slug</label>
                    <input
                      value={editing.slug}
                      onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
                      placeholder={slugify(editing.title || "video-title")}
                      className={inputCls}
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                      URL:{" "}
                      <span className="font-mono">/videos/{editing.slug.trim() || slugify(editing.title.trim() || "auto")}</span>
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Layout</label>
                    <div className="flex gap-2">
                      {LAYOUTS.map((l) => (
                        <button
                          key={l.value}
                          type="button"
                          onClick={() => setEditing({ ...editing, layout: l.value })}
                          className={`flex-1 rounded-xl border px-2 py-2 text-xs font-medium transition-colors ${
                            editing.layout === l.value
                              ? "border-accent bg-accent/10 text-accent"
                              : "border-border text-muted-foreground hover:border-accent/50"
                          }`}
                        >
                          {l.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    Article text (optional, supports basic HTML)
                  </label>
                  <textarea
                    value={editing.content}
                    onChange={(e) => setEditing({ ...editing, content: e.target.value })}
                    rows={6}
                    placeholder={"<p>In this video I talk about…</p>\n<p>Key takeaways…</p>"}
                    className={`${inputCls} resize-y font-mono text-xs`}
                  />
                </div>
              </div>
            )}
          </div>

        </form>
        </Modal>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : tabVideos.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No {tab} videos yet. Use “Add {tab} video” above.
        </p>
      ) : (
        <ul className="columns-2 gap-4 sm:columns-3 lg:columns-4">
          {pagedVideos.map((v) => (
            <li
              key={v.id}
              className="group mb-4 break-inside-avoid rounded-2xl border border-border bg-card card-grad overflow-hidden transition-shadow hover:shadow-lg"
            >
              <div
                className={`relative w-full overflow-hidden bg-muted ${
                  tab === "instagram" ? "aspect-[9/16]" : "aspect-video"
                }`}
              >
                {v.thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={v.thumbnail}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="grid h-full w-full place-items-center text-xs text-muted-foreground">
                    {tab === "instagram" ? "Instagram reel" : "No thumb"}
                  </div>
                )}
                <div className="absolute inset-0 flex items-start justify-end gap-1.5 bg-gradient-to-b from-black/40 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    onClick={() => startEdit(v)}
                    aria-label="Edit video"
                    className="rounded-lg border border-white/20 bg-black/50 p-1.5 text-white backdrop-blur-sm hover:bg-black/70 transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => remove(v.id)}
                    aria-label="Delete video"
                    className="rounded-lg border border-white/20 bg-black/50 p-1.5 text-white backdrop-blur-sm hover:bg-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="space-y-2 p-3">
                <p className="font-medium leading-snug line-clamp-2">{v.title}</p>
                <div className="flex flex-wrap gap-1.5 text-[11px]">
                  <span
                    className={
                      v.published
                        ? "rounded-full bg-emerald-100 text-emerald-700 px-2 py-0.5"
                        : "rounded-full bg-muted text-muted-foreground px-2 py-0.5"
                    }
                  >
                    {v.published ? "Published" : "Hidden"}
                  </span>
                  {v.categoryId && (
                    <span className="rounded-full bg-accent/15 text-accent px-2 py-0.5">
                      {categories.find((c) => c.id === v.categoryId)?.name ?? "Category"}
                    </span>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {videoPageCount > 1 && (
        <nav aria-label="Pagination" className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setVideoPage((p) => Math.max(1, p - 1))}
            disabled={safeVideoPage <= 1}
            aria-label="Previous page"
            className="inline-flex items-center gap-1 rounded-full border border-border px-4 py-2 text-sm font-semibold transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>
          <span className="text-sm text-muted-foreground">
            Page {safeVideoPage} of {videoPageCount}
          </span>
          <button
            type="button"
            onClick={() => setVideoPage((p) => Math.min(videoPageCount, p + 1))}
            disabled={safeVideoPage >= videoPageCount}
            aria-label="Next page"
            className="inline-flex items-center gap-1 rounded-full border border-border px-4 py-2 text-sm font-semibold transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </nav>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// LivePreview — mirrors the exact layout classes the public /videos/[slug]
// detail page renders, so admins see how video + text scale together across
// desktop (wide) and mobile (narrow) before saving. Aspect follows the
// platform: 16:9 for YouTube, 9:16 portrait for Instagram reels.
// ---------------------------------------------------------------------------

function LivePreview({
  title,
  content,
  layout,
  thumb,
  isInstagram,
}: {
  title: string;
  content: string;
  layout: "video-first" | "text-first" | "split";
  thumb: string | null;
  isInstagram: boolean;
}) {
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const hasText = content.trim().length > 0;

  const body = hasText ? (
    <div
      className="prose prose-sm max-w-none text-muted-foreground leading-relaxed"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  ) : (
    <p className="text-sm text-muted-foreground/60 italic">
      Add article text above to preview it here.
    </p>
  );

  const videoBlock = (
    <div
      className={`${
        isInstagram ? "aspect-[9/16]" : "aspect-video"
      } overflow-hidden rounded-xl bg-black ${
        isInstagram ? "mx-auto max-w-[220px]" : ""
      }`}
    >
      {thumb ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={thumb} alt="" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full grid place-items-center text-xs text-white/60">
          {isInstagram ? "Instagram reel" : "Video thumbnail"}
        </div>
      )}
    </div>
  );

  const order: ("video" | "text")[] =
    layout === "text-first" ? ["text", "video"] : ["video", "text"];

  const splitRow = (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      {layout === "text-first" ? (
        <>
          <div>{body}</div>
          <div>{videoBlock}</div>
        </>
      ) : (
        <>
          <div>{videoBlock}</div>
          <div>{body}</div>
        </>
      )}
    </div>
  );

  const stackedRow =
    layout === "split" ? (
      splitRow
    ) : (
      <div className="space-y-6">
        {order.map((item) =>
          item === "video" ? (
            <div key="video">{videoBlock}</div>
          ) : (
            <div key="text">{body}</div>
          )
        )}
      </div>
    );

  return (
    <div className="rounded-2xl border border-border bg-muted/40 p-4">
      <div className="flex items-center justify-between gap-4 mb-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Live preview
        </p>
        <div className="flex gap-1 rounded-full border border-border bg-background p-1">
          <button
            type="button"
            onClick={() => setDevice("desktop")}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              device === "desktop"
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Monitor className="w-3.5 h-3.5" /> Desktop
          </button>
          <button
            type="button"
            onClick={() => setDevice("mobile")}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              device === "mobile"
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" /> Mobile
          </button>
        </div>
      </div>

      <div
        className={`mx-auto overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 ${
          device === "mobile" ? "max-w-[320px]" : "w-full"
        }`}
      >
        <div className="border-b border-border px-4 py-2.5">
          <h3 className="font-display text-sm font-bold leading-snug truncate">
            {title}
          </h3>
        </div>
        <div className="p-4">{stackedRow}</div>
      </div>
    </div>
  );
}