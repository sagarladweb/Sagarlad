"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  Save,
  Lock,
  Clock,
  Type,
  X,
  ImageIcon,
  RefreshCw,
  Maximize2,
  Minimize2,
  ChevronLeft,
} from "lucide-react";
import { TipTapEditor } from "@/components/admin/TipTapEditor";
import { Dropdown } from "@/components/ui/Dropdown";
import { showToast } from "@/components/admin/Toast";
import { slugify, stripHtml, SITE } from "@/lib/site";
import { enqueue } from "@/lib/offline-queue";

type Category = { id: string; name: string };
type SaveState = "idle" | "loading" | "saved" | "error";

export function PostForm({
  categories,
  initial,
}: {
  categories: Category[];
  initial?: {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    coverImage: string;
    categoryId: string | null;
    featured: boolean;
    published: boolean;
  };
}) {
  const router = useRouter();
  const [slugTouched, setSlugTouched] = useState(false);
  // Identity of the post in the DB. `initial` may be absent (new post); once
  // a draft is created (e.g. to preview it), `postId` is set and later saves
  // become updates instead of creates.
  const [postId, setPostId] = useState<string | null>(initial?.id ?? null);
  const postIdRef = useRef(postId);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: initial?.title ?? "",
    slug: initial?.slug ?? "",
    excerpt: initial?.excerpt ?? "",
    content: initial?.content ?? "",
    coverImage: initial?.coverImage ?? "",
    categoryId: initial?.categoryId ?? "",
    featured: initial?.featured ?? false,
    published: initial?.published ?? true,
  });
  const [message, setMessage] = useState("");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [previewError, setPreviewError] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(true);

  const [uploadState, setUploadState] = useState<"idle" | "loading" | "error">(
    "idle"
  );
  const [uploadMessage, setUploadMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [categoryOptions, setCategoryOptions] = useState(categories);

  async function onUploadFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) await uploadFile(file);
  }

  async function uploadFile(file: File) {
    setUploadState("loading");
    setUploadMessage("");
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.url) {
        setForm((f) => ({ ...f, coverImage: data.url }));
        setUploadState("idle");
      } else {
        setUploadState("error");
        setUploadMessage(data.error ?? "Upload failed.");
      }
    } catch {
      setUploadState("error");
      setUploadMessage("Upload failed. Please try again.");
    }
  }

  async function onPasteCoverImage(dataUrl: string) {
    setUploadState("loading");
    setUploadMessage("");
    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataUrl, folder: "covers" }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.url) {
        setForm((f) => ({ ...f, coverImage: data.url }));
        setUploadState("idle");
      } else {
        setUploadState("error");
        setUploadMessage(data.error ?? "Upload failed.");
      }
    } catch {
      setUploadState("error");
      setUploadMessage("Upload failed. Please try again.");
    }
  }

  // Shared paste target: pasting an image (or a copied image data URL) anywhere
  // on the cover box uploads it, exactly like the file picker.
  function onCoverPaste(e: React.ClipboardEvent) {
    e.preventDefault();
    if (uploadState === "loading") return;
    const items = e.clipboardData?.items;
    const img =
      items &&
      Array.from(items).find((i) => i.type.startsWith("image/"));
    const file = img?.getAsFile();
    if (file) {
      void uploadFile(file);
      return;
    }
    const text = e.clipboardData?.getData("text/plain");
    if (text && text.startsWith("data:image/")) {
      void onPasteCoverImage(text);
    }
  }

  function validate(): string | null {
    if (!form.title.trim()) return "Please add a title.";
    if (!form.slug.trim()) return "Please add a web address.";
    if (form.content.trim().length < 10) return "Your post is too short. Add a few lines.";
    return null;
  }

  async function save(isRealtime = false) {
    const error = validate();
    if (error) {
      setMessage(error);
      if (!isRealtime) setSaveState("error");
      return false;
    }

    setMessage("");
    if (!isRealtime) setSaveState("loading");

    const url = postId
      ? `/api/admin/posts?id=${postId}`
      : "/api/admin/posts";
    const method = postId ? "PUT" : "POST";

    // Offline: keep the change in the local sync queue instead of failing.
    // The OfflineSync banner replays it when the connection returns, and the
    // API revalidates the public site, so the update lands there too.
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      enqueue(url, method, form, postId ? undefined : "new-post-draft");
      setMessage("Saved on this device — will sync when you're back online.");
      if (!isRealtime) {
        setSaveState("saved");
        showToast("Saved offline — syncs automatically when online", undefined, "success");
      }
      return true;
    }

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data.post?.id && !postId) setPostId(data.post.id);
        clearDraft?.();
        const msg = postId ? "Post updated successfully." : "Post created successfully.";
        setMessage(msg);
        if (!isRealtime) {
          setSaveState("saved");
          showToast(msg, undefined, "success");
        }
        router.refresh();
        if (!isRealtime && !initial) {
          setTimeout(() => {
            setSaveState("idle");
            router.push("/admin/posts");
          }, 1200);
        }
        return true;
      } else {
        const data = await res.json().catch(() => ({}));
        const errMsg = data.error ?? "Something went wrong.";
        setMessage(errMsg);
        if (!isRealtime) {
          setSaveState("error");
          showToast("Failed to save post", errMsg, "error");
        }
        return false;
      }
    } catch {
      const errMsg = "Network error. Please try again.";
      setMessage(errMsg);
      if (!isRealtime) {
        setSaveState("error");
        showToast("Network error", errMsg, "error");
      }
      return false;
    }
  }

  const saveRef = useRef(save);
  useEffect(() => {
    saveRef.current = save;
    postIdRef.current = postId;
  });

  // Preview loads the real post page (see /preview/[slug]). New posts must
  // exist in the DB first, so on first preview we create them as a draft.
  async function onPreview() {
    setPreviewError("");
    if (!form.title.trim()) {
      setPreviewError("Please add a title before previewing.");
      return;
    }
    if (!form.slug.trim()) {
      setPreviewError("Please add a web address before previewing.");
      return;
    }
    if (form.content.trim().length < 10) {
      setPreviewError("Your post is too short. Add a few lines to preview.");
      return;
    }
    if (!postId) {
      try {
        const res = await fetch("/api/admin/posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, published: false }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.post?.id) {
          setPreviewError(data.error ?? "Could not save draft. Please try again.");
          return;
        }
        setPostId(data.post.id);
        router.refresh();
        setPreviewUrl(`/preview/${data.post.slug}`);
      } catch {
        setPreviewError("Network error. Please try again.");
      }
      return;
    }
    // Existing post: flush latest content, then load the real page.
    if (await saveRef.current(true)) {
      setPreviewUrl(`/preview/${form.slug || "your-post"}`);
    } else {
      setPreviewError("Could not save the post before previewing.");
    }
  }

  // Real-time autosave (debounced) so work is never lost.
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autosave = useCallback(() => {
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => {
      if (!postIdRef.current) return; // only autosave existing posts to avoid accidental creates
      saveRef.current(true);
    }, 2500);
  }, []);

  // ------------------------------------------------------------------
  // Draft persistence. Every keystroke is mirrored to localStorage on a short
  // debounce so a refresh or accidental tab close never loses work:
  //   - new posts   -> "sl:admin:new-post-draft" (+ server sync when back online)
  //   - existing    -> "sl:admin:post-draft:<id>", restored only after a
  //                    same-session refresh so a stale draft from a previous
  //                    visit never clobbers the server's current data.
  // The editor is gated on `hydrated` so the restored content actually reaches
  // the TipTapEditor (it only reads its content once, on mount).
  // ------------------------------------------------------------------
  const DRAFT_KEY = "sl:admin:new-post-draft";
  const isNew = !initial;
  const EDIT_DRAFT_KEY = initial ? `sl:admin:post-draft:${initial.id}` : null;
  const formRef = useRef(form);
  useEffect(() => {
    formRef.current = form;
  }, [form]);
  const offlineDraftRef = useRef(false);
  const draftTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (draftTimer.current) clearTimeout(draftTimer.current);
    draftTimer.current = setTimeout(() => {
      if (isNew) {
        const f = formRef.current;
        if (!f.title.trim() && !f.content.trim() && !f.excerpt.trim()) return;
        offlineDraftRef.current = true;
        try {
          localStorage.setItem(
            DRAFT_KEY,
            JSON.stringify({ form: formRef.current, postId: postIdRef.current, savedAt: Date.now() })
          );
        } catch {}
        return;
      }
      if (!EDIT_DRAFT_KEY) return;
      try {
        sessionStorage.setItem(`sl:edit-dirty:${initial!.id}`, "1");
        localStorage.setItem(
          EDIT_DRAFT_KEY,
          JSON.stringify({ form: formRef.current, savedAt: Date.now() })
        );
      } catch {}
    }, 400);
  }, [form, isNew, EDIT_DRAFT_KEY, initial]);

  function clearDraft() {
    offlineDraftRef.current = false;
    if (draftTimer.current) clearTimeout(draftTimer.current);
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {}
    if (EDIT_DRAFT_KEY && initial) {
      try {
        localStorage.removeItem(EDIT_DRAFT_KEY);
        sessionStorage.removeItem(`sl:edit-dirty:${initial.id}`);
      } catch {}
    }
  }

  // Server rejects below: title >= 3 chars, slug >= 3, content >= 10.
  const syncDraft = useCallback(async () => {
    if (!offlineDraftRef.current || !navigator.onLine) return;
    let draft: { form: typeof form; postId: string | null } | null = null;
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) draft = JSON.parse(raw);
    } catch {}
    if (!draft) return;
    const title = draft.form.title.trim();
    const slug = draft.form.slug.trim();
    if (title.length < 3 || slug.length < 3 || draft.form.content.trim().length < 10) return;
    const res = await fetch(draft.postId ? `/api/admin/posts?id=${draft.postId}` : "/api/admin/posts", {
      method: draft.postId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...draft.form, published: false }),
      keepalive: true,
    });
    if (res.ok) clearDraft();
  }, []);

  // Restore a saved draft on load, then sync it if we're back online.
  useEffect(() => {
    const restore = (key: string, withPostId: boolean) => {
      let draft: { form: typeof form; postId: string | null } | null = null;
      try {
        const raw = localStorage.getItem(key);
        if (raw) draft = JSON.parse(raw);
      } catch {}
      if (!draft || typeof draft.form !== "object") return null;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time draft restore on mount, guarded by the localStorage read above
      setForm((f) => ({ ...f, ...draft!.form }));
      if (withPostId && draft.postId) setPostId(draft.postId);
      return draft;
    };

    if (isNew) {
      const draft = restore(DRAFT_KEY, true);
      offlineDraftRef.current = !!draft?.postId; // postId => already on the server
      if (draft) void syncDraft();
    } else if (EDIT_DRAFT_KEY && initial) {
      let dirty = "0";
      try {
        dirty = sessionStorage.getItem(`sl:edit-dirty:${initial.id}`) ?? "0";
        sessionStorage.removeItem(`sl:edit-dirty:${initial.id}`);
      } catch {}
      if (dirty === "1") restore(EDIT_DRAFT_KEY, false);
    }
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Coming back online -> push any leftover local draft.
  useEffect(() => {
    if (!isNew) return;
    const handler = () => {
      if (navigator.onLine) void syncDraft();
    };
    window.addEventListener("online", handler);
    return () => window.removeEventListener("online", handler);
  }, [isNew, syncDraft]);

  // Leaving the tab -> flush the local draft to the server (new) or at least
  // to localStorage (existing) so a refresh never loses work.
  useEffect(() => {
    const handler = () => {
      const f = formRef.current;
      if (isNew) {
        if (!offlineDraftRef.current || !navigator.onLine) return;
        const title = f.title.trim();
        const slug = f.slug.trim();
        if (title.length < 3 || slug.length < 3 || f.content.trim().length < 10) return;
        try {
          fetch(postIdRef.current ? `/api/admin/posts?id=${postIdRef.current}` : "/api/admin/posts", {
            method: postIdRef.current ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...f, published: false }),
            keepalive: true,
          }).then((r) => {
            if (r.ok) clearDraft();
          });
        } catch {}
        return;
      }
      if (!EDIT_DRAFT_KEY || !initial) return;
      try {
        sessionStorage.setItem(`sl:edit-dirty:${initial.id}`, "1");
        localStorage.setItem(EDIT_DRAFT_KEY, JSON.stringify({ form: f, savedAt: Date.now() }));
      } catch {}
    };
    window.addEventListener("pagehide", handler);
    return () => window.removeEventListener("pagehide", handler);
  }, [isNew, EDIT_DRAFT_KEY, initial]);

  // Cmd/Ctrl+S saves
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        saveRef.current(false);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const [showExitModal, setShowExitModal] = useState(false);

  const isDirty =
    form.title !== (initial?.title ?? "") ||
    form.slug !== (initial?.slug ?? "") ||
    form.excerpt !== (initial?.excerpt ?? "") ||
    form.content !== (initial?.content ?? "") ||
    form.coverImage !== (initial?.coverImage ?? "") ||
    form.categoryId !== (initial?.categoryId ?? "") ||
    form.featured !== (initial?.featured ?? false) ||
    form.published !== (initial?.published ?? true);

  // Intercept browser back/tab closure when changes are unsaved
  useEffect(() => {
    if (!isDirty || saveState === "saved") return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty, saveState]);

  const handleBackClick = () => {
    if (isDirty && saveState !== "saved") {
      setShowExitModal(true);
    } else {
      router.push("/admin/posts");
    }
  };

  const words = stripHtml(form.content).split(/\s+/).filter(Boolean).length;
  const readTime = Math.max(1, Math.round(words / 200));

  const input =
    "rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent w-full";
  const label = "block text-sm font-medium mb-1.5";

  const statusToggle = (
    label: string,
    value: boolean,
    onToggle: () => void,
    onColor = "bg-green-600"
  ) => (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={value}
      className="flex w-full items-center justify-between gap-2 text-sm font-medium"
    >
      {label}
      <span
        className={`inline-flex h-5 w-9 items-center rounded-full p-0.5 transition-colors ${
          value ? onColor : "bg-muted"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 rounded-full bg-white transform transition-transform ${
            value ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </span>
    </button>
  );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save(false);
      }}
      className={`space-y-6 transition-all ${
        isFullscreen
          ? "fixed inset-0 z-50 overflow-y-auto bg-background p-4 sm:p-8"
          : "w-full max-w-full"
      }`}
      noValidate
    >
      {/* Sticky header controls: Back, Title, Save & Fullscreen grouped together */}
      <div className="sticky top-0 z-40 flex flex-wrap items-center justify-between gap-4 border-b border-border bg-card/95 p-4 backdrop-blur shadow-sm rounded-2xl">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleBackClick}
            className="inline-flex items-center gap-1 rounded-xl border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            title="Back to posts list"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          <h2 className="font-display text-lg font-bold">
            {initial ? "Edit Post" : "Create New Post"}
          </h2>
          {saveState === "loading" && (
            <span className="flex items-center gap-1.5 rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground animate-pulse">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…
            </span>
          )}
          {saveState === "saved" && (
            <span className="flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
              <CheckCircle2 className="w-3.5 h-3.5" /> All changes saved
            </span>
          )}
          {saveState === "error" && (
            <span className="flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-600">
              <AlertCircle className="w-3.5 h-3.5" /> {message || "Error saving"}
            </span>
          )}
        </div>

        {/* Action group: Save + Fullscreen side by side */}
        <div className="flex items-center gap-2.5">
          <button
            type="submit"
            disabled={saveState === "loading"}
            title="Save post (⌘S / Ctrl+S)"
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-xs font-bold text-accent-foreground shadow-md transition-all hover:opacity-90 active:scale-95 disabled:opacity-60"
          >
            {saveState === "loading" ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            {initial ? "Save Changes" : "Publish Post"}
          </button>

          <button
            type="button"
            onClick={() => setIsFullscreen((prev) => !prev)}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-3.5 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shadow-sm"
            title={isFullscreen ? "Exit Fullscreen Mode" : "Enter Fullscreen Mode"}
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-3.5 h-3.5" /> Exit Fullscreen
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5" /> Fullscreen
              </>
            )}
          </button>
        </div>
      </div>

      <div className="flex flex-col items-start gap-6 lg:flex-row">
        {/* ---- Main canvas ---- */}
        <div className="min-w-0 flex-1 space-y-4 w-full">
          <div className="w-full rounded-2xl border border-border bg-card p-6">
            <label htmlFor="title" className={label}>Title *</label>
            <input
              id="title"
              value={form.title}
              onChange={(e) => {
                const t = e.target.value;
                setForm((f) => ({
                  ...f,
                  title: t,
                  slug: initial && slugTouched ? f.slug : slugify(t),
                }));
                autosave();
              }}
              placeholder="Give your post a title"
              className={`${input} text-xl font-semibold`}
              required
            />
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <label htmlFor="slug" className="text-sm font-medium">Web address</label>
              <span className="text-sm text-muted-foreground">
                sagarlad.com/blog/{form.slug || "your-post"}
              </span>
              <button
                type="button"
                onClick={() => setSlugTouched((prev) => !prev)}
                aria-pressed={slugTouched}
                title={
                  slugTouched
                    ? "The web address is locked — click to make it match your title automatically"
                    : "The web address matches your title — click to change it yourself"
                }
                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors ${
                  slugTouched
                    ? "border-accent text-accent"
                    : "border-border text-muted-foreground hover:bg-muted"
                }`}
              >
                <Lock className="w-3 h-3" />
                {slugTouched ? "Locked" : "Automatic"}
              </button>
            </div>
          </div>

          <div className="w-full">
            <span className="sr-only">Post</span>
            {hydrated ? (
              <TipTapEditor
                initialContent={form.content}
                onChange={(html) => {
                  setForm((f) => ({ ...f, content: html }));
                  autosave();
                }}
                preview={{
                  url: previewUrl,
                  liveUrl: `${SITE.url}/blog/${form.slug || "your-post"}`,
                  onPreview,
                  error: previewError,
                }}
              />
            ) : (
              <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-border bg-card">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>
        </div>

        {/* ---- Settings sidebar ---- */}
        <aside className="w-full shrink-0 space-y-4 lg:w-80 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto pr-1">
          <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Status
            </h3>
            {statusToggle("Featured", form.featured, () =>
              setForm((f) => ({ ...f, featured: !f.featured }))
            )}
            {statusToggle("Published", form.published, () =>
              setForm((f) => ({ ...f, published: !f.published }))
            )}
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Details
            </h3>
            <div>
              <span id="categoryId-label" className={label}>Category</span>
              <Dropdown
                id="categoryId"
                label="Category"
                value={form.categoryId}
                onChange={(value) => setForm({ ...form, categoryId: value })}
                placeholder="— Uncategorized —"
                options={[
                  { value: "", label: "— Uncategorized —" },
                  ...categoryOptions.map((c) => ({ value: c.id, label: c.name })),
                ]}
              />
            </div>
            <div>
              <span className={label}>Cover image</span>
              <div
                role="button"
                tabIndex={0}
                aria-label="Upload or paste a cover image"
                onPaste={onCoverPaste}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
                className={`group relative overflow-hidden rounded-2xl border-2 border-dashed transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                  form.coverImage ? "border-border" : "border-border hover:border-brand-light/60"
                } ${
                  uploadState === "loading"
                    ? "pointer-events-none opacity-70"
                    : "cursor-pointer"
                }`}
              >
                {form.coverImage ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={form.coverImage}
                      alt="Cover preview"
                      className="w-full aspect-video object-cover"
                    />
                    <span className="pointer-events-none absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/40" />
                    <span className="pointer-events-none absolute inset-0 hidden items-center justify-center gap-2 text-sm font-semibold text-white group-hover:flex">
                      <RefreshCw className="w-4 h-4" /> Click to replace
                    </span>
                  </>
                ) : (
                  <div className="flex aspect-video flex-col items-center justify-center gap-2 bg-muted/40 px-4 text-center">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand/10 text-brand">
                      {uploadState === "loading" ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <ImageIcon className="h-5 w-5" />
                      )}
                    </div>
                    <p className="text-sm font-medium">
                      {uploadState === "loading"
                        ? "Uploading…"
                        : "Click to upload, or paste an image"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      JPEG · PNG · WebP · GIF · AVIF — max 8MB, saved as WebP
                    </p>
                  </div>
                )}
              </div>
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs text-muted-foreground">
                  Copy an image, then paste it here (⌘V / Ctrl+V)
                </p>
                <div className="flex items-center gap-2">
                  {form.coverImage && (
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, coverImage: "" }))}
                      className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-red-600 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" /> Remove
                    </button>
                  )}
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                className="hidden"
                onChange={onUploadFile}
              />
              {uploadState === "error" && (
                <p className="mt-2 flex items-center gap-1.5 text-xs text-red-600">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {uploadMessage}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="excerpt" className={label}>
                Short summary
                <span className="ml-1 text-xs text-muted-foreground">
                  ({form.excerpt.length}/400)
                </span>
              </label>
              <textarea
                id="excerpt"
                value={form.excerpt}
                onChange={(e) => {
                  setForm({ ...form, excerpt: e.target.value.slice(0, 400) });
                  autosave();
                }}
                rows={4}
                placeholder="A line or two that shows up on the post card."
                className={`${input} resize-y`}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Live stats
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-muted/60 p-3">
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Type className="w-3.5 h-3.5" /> Words
                </p>
                <p className="mt-1 font-display text-xl font-bold tabular-nums">
                  {words.toLocaleString()}
                </p>
              </div>
              <div className="rounded-xl bg-muted/60 p-3">
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="w-3.5 h-3.5" /> Read time
                </p>
                <p className="mt-1 font-display text-xl font-bold tabular-nums">
                  {readTime} min
                </p>
              </div>
            </div>
          </div>
        </aside>
</div>

    {/* Floating save: stays out of the way while writing long posts */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2">
        {saveState === "loading" && (
          <p className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-lg">
            Saving…
          </p>
        )}
        {saveState === "saved" && (
          <p className="flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 shadow-lg">
            <CheckCircle2 className="w-3.5 h-3.5" /> All changes saved
          </p>
        )}
        {saveState === "error" && (
          <p className="max-w-[240px] rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600 shadow-lg">
            {message}
          </p>
        )}
        <button
          type="submit"
          disabled={saveState === "loading"}
          title="Save post (⌘S / Ctrl+S)"
          className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground shadow-xl transition-all hover:opacity-90 disabled:opacity-60"
        >
          {saveState === "loading" ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {initial ? "Save" : "Publish"}
        </button>
      </div>

      {/* Unsaved Changes Confirmation Modal */}
      {showExitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-amber-600">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className="font-display text-lg font-bold text-foreground">
                Unsaved Changes
              </h3>
            </div>
            <p className="text-sm text-muted-foreground">
              You have unsaved changes in your blog post. Would you like to save your draft before exiting?
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setShowExitModal(false)}
                className="w-full sm:w-auto rounded-xl border border-border px-4 py-2 text-xs font-semibold hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowExitModal(false);
                  router.push("/admin/posts");
                }}
                className="w-full sm:w-auto rounded-xl border border-red-200 bg-red-50 text-red-600 px-4 py-2 text-xs font-semibold hover:bg-red-100"
              >
                Discard & Exit
              </button>
              <button
                type="button"
                onClick={async () => {
                  await save(false);
                  setShowExitModal(false);
                  router.push("/admin/posts");
                }}
                className="w-full sm:w-auto rounded-xl bg-accent text-accent-foreground px-4 py-2 text-xs font-bold shadow hover:opacity-90"
              >
                Save Draft & Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}