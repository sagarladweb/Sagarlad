"use client";

import { useEffect, useRef, useState } from "react";
import { NodeSelection } from "@tiptap/pm/state";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import { Node, mergeAttributes } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import Typography from "@tiptap/extension-typography";
import Dropcursor from "@tiptap/extension-dropcursor";
import Gapcursor from "@tiptap/extension-gapcursor";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import { ColorWheel } from "@/components/admin/ColorWheel";
import { youtubeId, youtubeThumb, youtubeWatchUrl } from "@/lib/youtube";
import { PostPreview, PreviewPending } from "@/components/admin/PostPreview";
import { ContentEmbed, type EmbedData } from "@/components/admin/ContentEmbed";
import { EmbedPicker } from "@/components/admin/EmbedPicker";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Quote as QuoteIcon,
  Link as LinkIcon,
  Image as ImageIcon,
  Undo2,
  Redo2,
  Minus,
  Highlighter,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Eye,
  Pencil,
  Loader2,
  X,
  Check,
  Keyboard,
  PanelTop,
  PanelLeft,
  PanelRight,
  MoveHorizontal,
  Wand2,
  StretchHorizontal,
  Palette,
  AlertCircle,
  HelpCircle,
  SquarePlus,
  LayoutTemplate,
  Trash2,
} from "lucide-react";

type Shortcut = string;
function shortcutLabel(keys: string): string {
  const isMac =
    typeof navigator !== "undefined" &&
    /Mac|iPhone|iPad/.test(navigator.platform);
  return keys
    .split(" ")
    .map((k) =>
      k === "Mod"
        ? isMac
          ? "⌘"
          : "Ctrl"
        : k === "Alt"
          ? isMac
            ? "⌥"
            : "Alt"
          : k === "Shift"
            ? "⇧"
            : k.toUpperCase()
    )
    .join(isMac ? "" : "+");
}

type ToolbarPos = "top" | "left" | "right";

function ToolbarButton({
  label,
  shortcut,
  icon,
  active,
  disabled,
  onClick,
}: {
  label: string;
  shortcut?: Shortcut;
  icon: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      aria-disabled={disabled}
      disabled={disabled}
      title={shortcut ? `${label} (${shortcutLabel(shortcut)})` : label}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
        active
          ? "bg-accent text-accent-foreground"
          : "hover:bg-muted text-foreground"
      } p-1.5`}
    >
      {icon}
    </button>
  );
}

function ToolbarDivider({ vertical }: { vertical?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`bg-border ${
        vertical ? "w-6 h-px my-1" : "w-px h-5 mx-1"
      }`}
    />
  );
}

const TEXT_COLORS = [
  "#111827",
  "#dc2626",
  "#ea580c",
  "#d97706",
  "#16a34a",
  "#059669",
  "#2563eb",
  "#4f46e5",
  "#9333ea",
  "#db2777",
];

function ColorPicker({
  editor,
  vertical,
  openSide = "right",
}: {
  editor: Editor;
  vertical?: boolean;
  openSide?: "left" | "right";
}) {
  const [open, setOpen] = useState(false);
  const [activeColor, setActiveColor] = useState<string | undefined>();
  const current = editor.getAttributes("textStyle").color as string | undefined;
  const pickerRef = useRef<HTMLDivElement>(null);

  const close = () => setOpen(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    const onDown = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Element)) {
        close();
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, [open]);

  const shown = activeColor ?? current;

  return (
    <div ref={pickerRef} className="relative">
      <ToolbarButton
        label="Text color"
        active={Boolean(current)}
        icon={
          <span className="flex items-center gap-1">
            <Palette className="w-4 h-4" />
            <span
              className="h-3 w-3 rounded-full border border-border/60"
              style={{ backgroundColor: shown ?? "transparent" }}
            />
          </span>
        }
        onClick={() => {
          setActiveColor(current);
          setOpen((o) => !o);
        }}
      />
      {open && (
        <div
          role="dialog"
          aria-label="Text color picker"
          className={`absolute z-40 rounded-2xl border border-border bg-card p-3 shadow-2xl ${
            vertical
              ? openSide === "left"
                ? "right-full top-1/2 mr-2 -translate-y-1/2"
                : "left-full top-1/2 ml-2 -translate-y-1/2"
              : "left-0 top-full mt-2"
          }`}
        >
          <div className="mb-2 flex items-center justify-between gap-4">
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <span
                className="inline-block h-3.5 w-3.5 rounded-full border border-border/60"
                style={{ backgroundColor: shown ?? "transparent" }}
              />
              Text color
            </span>
            <button
              type="button"
              aria-label="Close color picker"
              title="Close (Esc)"
              onClick={close}
              className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            {TEXT_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                aria-label={`Text color ${c}`}
                aria-pressed={activeColor === c}
                title={c}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setActiveColor(c);
                  editor.chain().focus().setColor(c).run();
                }}
                className="h-6 w-6 rounded-full border border-border/60 transition-transform hover:scale-110"
                style={{ backgroundColor: c }}
              />
            ))}
          </div>

          <div className="mt-3 border-t border-border pt-3">
            <ColorWheel
              value={shown ?? "#111827"}
              onChange={(hex) => {
                setActiveColor(hex);
                editor.chain().focus().setColor(hex).run();
              }}
            />
          </div>

          <div className="mt-2 flex items-center justify-end">
            <button
              type="button"
              onClick={() => {
                setActiveColor(undefined);
                editor.chain().focus().unsetColor().run();
              }}
              className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="w-3 h-3" /> Clear color
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const Callout = Node.create({
  name: "callout",
  group: "block",
  content: "paragraph+",
  defining: true,
  parseHTML: () => [{ tag: "div[data-callout]" }],
  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-callout": "" }), 0];
  },
});

const StyledImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      dataAlign: {
        default: "center",
        parseHTML: (element) =>
          element.getAttribute("data-align") || "center",
        renderHTML: (attributes) =>
          attributes.dataAlign
            ? { "data-align": attributes.dataAlign }
            : {},
      },
      dataWidth: {
        default: "full",
        parseHTML: (element) =>
          element.getAttribute("data-width") || "full",
        renderHTML: (attributes) => {
          if (!attributes.dataWidth) return {};
          const attrs: Record<string, string> = { "data-width": attributes.dataWidth };
          // Custom (drag-resized) widths are stored as percentages — the site
          // CSS can't read a dynamic value from data-width, so carry the width
          // as an inline style too. DOMPurify keeps inline styles.
          if (typeof attributes.dataWidth === "string" && attributes.dataWidth.endsWith("%")) {
            attrs.style = `width:${attributes.dataWidth}`;
          }
          return attrs;
        },
      },
    };
  },
});

const HELP_ROWS: [string, string][] = [
  ["Bold", "Mod b"],
  ["Italic", "Mod i"],
  ["Underline", "Mod u"],
  ["Strikethrough", "Mod Shift s"],
  ["Inline code", "Mod e"],
  ["Highlight", "Mod Shift h"],
  ["Heading 2", "Alt Mod 2"],
  ["Heading 3", "Alt Mod 3"],
  ["Bullet list", "Mod Shift 8"],
  ["Numbered list", "Mod Shift 7"],
  ["Quote", "Mod Shift b"],
  ["Callout", "Mod Alt c"],
  ["Divider", "—"],
  ["Add link", "Mod k"],
];

type TemplateId = "book" | "video" | "idea" | "quote";

const TEMPLATES: { id: TemplateId; title: string; desc: string; blocks: string }[] = [
  {
    id: "book",
    title: "Book highlight",
    desc: "A book's key idea + top takeaways",
    blocks:
      '<h2>What this book taught me</h2><p>[Note the core idea in your own words]</p><p>In <em>Insert book name</em>, the idea that stayed with me is simple:</p><div data-callout><p>[Write the one-line takeaway]</p></div><h3>Why it matters</h3><p>[Explain the real-life change it makes]</p><h3>Three things to try this week</h3><ul><li>[Action 1]</li><li>[Action 2]</li><li>[Action 3]</li></ul><p>If you read one thing this year, make it this book.</p><p>[TBD: embed the book]</p>',
  },
  {
    id: "video",
    title: "Video breakdown",
    desc: "Summarize a video worth watching",
    blocks:
      '<h2>Why this video matters</h2><p>[Set up the context in one or two lines]</p><p>If you have 10 minutes, watch this. Here is what<em> I</em> took away:</p><h3>The big idea</h3><p>[The main point]</p><div data-callout><p>[The one thing you should remember]</p></div><h3>What I disagree with</h3><p>[Optional counterpoint]</p><p>Worth your time if [who this is for].</p><p>[TBD: embed the video]</p>',
  },
  {
    id: "idea",
    title: "Idea essay",
    desc: "Turn a thought or habit into a post",
    blocks:
      '<h2>[Your idea as a headline]</h2><p>[Start with the moment you realized this]</p><div data-callout><p>[Your main argument in one sentence]</p></div><h3>What most people miss</h3><p>[The part you had to learn the hard way]</p><h3>What to do about it</h3><p>[One concrete step]</p><h3>A final thought</h3><p>[Close the loop]</p>',
  },
  {
    id: "quote",
    title: "Quote reflection",
    desc: "A quote + why it hit you",
    blocks: `<p>Some things you read once and they stay with you forever.</p><div data-callout><p>[Paste the quote you can't stop thinking about]</p></div><p>Here is why it hit me: [your reaction]</p><p>It changed how I think about [topic].</p><h3>If you only take one thing</h3><p>[The actionable lesson]</p>`,
  },
];

function ModalOverlay({
  label,
  onClose,
  children,
}: {
  label: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Element)) onClose();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={label}
    >
      <div
        ref={ref}
        className="w-full max-w-md rounded-xl border border-border bg-card p-4 shadow-xl"
      >
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold">{label}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label={`Close ${label}`}
            className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function EditorHelp({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Editor tools help"
    >
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl border border-border bg-card p-5 shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-base font-bold">Editor tools</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          The toolbar stays pinned to the editor&apos;s top — it never scrolls away, even on a
          long post.
        </p>
        <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
          {HELP_ROWS.map(([label, key]) => (
            <li key={label} className="flex items-center justify-between gap-2">
              <span className="text-foreground">{label}</span>
              {key !== "—" ? (
                <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-[11px]">
                  {shortcutLabel(key)}
                </kbd>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </li>
          ))}
        </ul>
        <div className="mt-4 space-y-1.5 border-t border-border pt-3 text-xs text-muted-foreground">
          <p>
            • Click an image to show its alignment and width controls.
          </p>
          <p>• Paste an image straight into the editor to add it.</p>
          <p>
            • Use{" "}
            <span className="font-semibold text-foreground">Insert content</span> to embed a
            video, book, e-book, social link or quote you&apos;ve already created.
          </p>
          <p>
            • Press <kbd className="rounded border border-border bg-muted px-1 py-0.5">{shortcutLabel("Mod s")}</kbd>{" "}
            to save your post.
          </p>
        </div>
      </div>
    </div>
  );
}

export function TipTapEditor({
  initialContent,
  onChange,
  preview,
  footer,
}: {
  initialContent?: string;
  onChange: (html: string) => void;
  preview?: {
    url: string | null;
    liveUrl: string;
    onPreview: () => void;
    error?: string;
  };
  footer?: React.ReactNode;
}) {
  const [mode, setMode] = useState<"write" | "preview">("write");
  const [toolbarPos, setToolbarPos] = useState<ToolbarPos>(() => {
    if (typeof window === "undefined") return "top";
    const saved = window.localStorage.getItem("admin-toolbar-pos");
    return saved === "left" || saved === "right" || saved === "top" ? saved : "top";
  });
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [imageOpen, setImageOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [helpOpen, setHelpOpen] = useState(false);
  const [embedPickerOpen, setEmbedPickerOpen] = useState(false);
  const [templateOpen, setTemplateOpen] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [selectedImage, setSelectedImage] = useState<{
    dataAlign: string;
    dataWidth: string;
  } | null>(null);
  const [selectedEmbed, setSelectedEmbed] = useState<{
    kind: string;
    dataAlign: string;
    dataWidth: string;
  } | null>(null);
  // Viewport coords of the selected media node, used to float the layout bar
  // right above it. coordsAtPos returns viewport-relative coords, so a
  // position:fixed bar stays glued to the node while scrolling.
  const [selPos, setSelPos] = useState<{
    top: number;
    bottom: number;
    left: number;
    width: number;
  } | null>(null);

  // Remember toolbar position across sessions.
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        codeBlock: { HTMLAttributes: { spellcheck: "false" } },
        link: false,
        underline: false,
        dropcursor: false,
        gapcursor: false,
      }),
      Underline,
      Link.configure({ openOnClick: false, autolink: true }),
      StyledImage.configure({ inline: false, allowBase64: true }),
      Placeholder.configure({ placeholder: "Write your post here…" }),
      CharacterCount,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TextStyle,
      Color,
      Typography,
      Dropcursor.configure({ color: "var(--accent)", width: 2 }),
      Gapcursor,
      Callout,
      ContentEmbed,
    ],
    content: initialContent || "",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "editor-content prose-editor min-h-[60vh] w-full bg-background px-5 sm:px-8 py-6 text-[0.95rem] leading-relaxed focus:outline-none",
      },
      handlePaste: (view, event) => {
        const items = Array.from(event.clipboardData?.items ?? []);
        const image = items.find((i) => i.type.startsWith("image/"));
        const file = image?.getAsFile();
        const insertUploaded = (url: string, name: string) => {
          const { state } = view;
          const { tr } = state;
          const node = state.schema.nodes.image.create({
            src: url,
            alt: name,
            dataWidth: "full",
          });
          tr.replaceSelectionWith(node);
          view.dispatch(tr);
        };
        // Pasting a bare YouTube link embeds it as a video card immediately,
        // then swaps in the real title + self-hosted thumbnail in the background.
        const pasted = (event.clipboardData?.getData("text/plain") ?? "").trim();
        const ytId = youtubeId(pasted);
        if (ytId) {
          event.preventDefault();
          const watch = youtubeWatchUrl(pasted) ?? "";
          const embedNode = view.state.schema.nodes.embed.create({
            kind: "video",
            id: "",
            title: "Video",
            subtitle: "",
            href: watch,
            image: youtubeThumb(pasted) ?? "",
            dataWidth: "full",
            dataAlign: "center",
          });
          view.dispatch(view.state.tr.replaceSelectionWith(embedNode));
          void (async () => {
            const res = await fetch(
              `/api/admin/videos/import?url=${encodeURIComponent(pasted)}`
            );
            const data = await res.json().catch(() => ({}));
            if (!res.ok) return;
            const { state } = view;
            let found = -1;
            state.doc.descendants((node, pos) => {
              if (found !== -1) return false;
              if (
                node.type.name === "embed" &&
                node.attrs.kind === "video" &&
                node.attrs.href === watch
              ) {
                found = pos;
                return false;
              }
              return true;
            });
            if (found === -1) return;
            const { tr } = state;
            tr.setNodeMarkup(found, undefined, {
              ...state.doc.nodeAt(found)?.attrs,
              title: data.title || "Video",
              ...(data.thumbnailUrl ? { image: data.thumbnailUrl } : {}),
            });
            view.dispatch(tr);
          })();
          return true;
        }
        if (file) {
          event.preventDefault();
          void (async () => {
            const body = new FormData();
            body.append("file", file);
            const res = await fetch("/api/admin/upload", { method: "POST", body });
            const data = await res.json().catch(() => ({}));
            if (res.ok && data.url) insertUploaded(data.url, file.name);
          })();
          return true;
        }
        // Copying an image from the web usually puts an <img> (remote URL) in
        // the HTML clipboard with no native image file — re-host it locally.
        const html = event.clipboardData?.getData("text/html") ?? "";
        const text = event.clipboardData?.getData("text/plain") ?? "";
        const htmlSrc = /<img[^>]+src=["']([^"']+)["']/i.exec(html)?.[1];
        const textIsImage = /^https?:\/\/\S+\.(png|jpe?g|webp|gif|avif)(\?\S*)?$/i.test(
          text.trim()
        );
        const remoteUrl =
          (htmlSrc && /^https?:\/\//i.test(htmlSrc) && text.trim().length === 0
            ? htmlSrc
            : null) ?? (textIsImage ? text.trim() : null);
        if (remoteUrl) {
          event.preventDefault();
          void (async () => {
            const res = await fetch("/api/admin/upload-from-url", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ url: remoteUrl }),
            });
            const data = await res.json().catch(() => ({}));
            if (res.ok && data.url) insertUploaded(data.url, "");
          })();
          return true;
        }
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
      setWordCount(editor.storage.characterCount.words());
      setCharCount(editor.storage.characterCount.characters());
    },
    onCreate: ({ editor }) => {
      setWordCount(editor.storage.characterCount.words());
      setCharCount(editor.storage.characterCount.characters());
    },
  });

  useEffect(() => {
    if (!editor) return;
    const handler = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      // Cmd/Ctrl+K opens the link dialog
      if (mod && !e.altKey && !e.shiftKey && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (linkOpen) return;
        const { from, to } = editor.state.selection;
        const text = editor.state.doc.textBetween(from, to, " ");
        const prev = editor.getAttributes("link").href as string | undefined;
        setLinkUrl(prev ?? "");
        setLinkText(text);
        setLinkOpen(true);
      }
      // Cmd/Ctrl+Alt+C toggles a callout (no TipTap keymap ships with the custom node)
      if (mod && e.altKey && !e.shiftKey && e.key.toLowerCase() === "c") {
        e.preventDefault();
        editor.chain().focus().toggleWrap("callout").run();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [editor, linkOpen]);

  // Track when an image or embed node is selected so we can show layout controls.
  useEffect(() => {
    if (!editor) return;
    const update = () => {
      const { selection } = editor.state;
      // NodeSelection.node() is the only reliable way to get the selected
      // atom node — $from.node($from.depth) resolves to the parent, not the node
      // itself, for a node selection.
      const node = selection instanceof NodeSelection ? selection.node : null;
      const isMedia = node?.type.name === "image" || node?.type.name === "embed";
      if (node?.type.name === "image") {
        setSelectedImage({
          dataAlign: node.attrs.dataAlign || "center",
          dataWidth: node.attrs.dataWidth || "full",
        });
      } else {
        setSelectedImage(null);
      }
      if (node?.type.name === "embed") {
        setSelectedEmbed({
          kind: node.attrs.kind || "quote",
          dataAlign: node.attrs.dataAlign || "center",
          dataWidth: node.attrs.dataWidth || "full",
        });
      } else {
        setSelectedEmbed(null);
      }
      setSelPos(isMedia ? rectOfSelected(editor) : null);
    };
    update();
    editor.on("selectionUpdate", update);
    editor.on("transaction", update);
    return () => {
      editor.off("selectionUpdate", update);
      editor.off("transaction", update);
    };
  }, [editor]);

  // Re-float the bar on scroll/resize so it stays glued to the selected node.
  useEffect(() => {
    if (!editor) return;
    const recompute = () => {
      setSelPos(rectOfSelected(editor));
    };
    window.addEventListener("scroll", recompute, { passive: true, capture: true });
    window.addEventListener("resize", recompute);
    return () => {
      window.removeEventListener("scroll", recompute, { capture: true } as EventListenerOptions);
      window.removeEventListener("resize", recompute);
    };
  }, [editor]);

  if (!editor) return null;

  const readTime = Math.max(1, Math.round(wordCount / 200));
  const isLinkActive = editor.isActive("link");

  const closeLink = () => {
    setLinkOpen(false);
    setLinkUrl("");
    setLinkText("");
  };

  const applyLink = () => {
    const url = linkUrl.trim();
    if (!url) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      closeLink();
      return;
    }
    let href = url;
    if (!/^https?:\/\//i.test(url)) href = `https://${url}`;
    if (linkText) {
      const esc = (s: string) =>
        s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      editor.chain().focus().insertContent(`<a href="${esc(href)}">${esc(linkText)}</a>`).run();
    } else {
      editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
    }
    closeLink();
  };

  // Update a selected media node's attrs and keep it selected so the floating
  // layout bar doesn't vanish after the click.
  const applyNodeAttrs = (type: "image" | "embed", attrs: Record<string, string>) => {
    if (!editor) return;
    const pos = editor.state.selection.$from.pos;
    editor.chain().focus().updateAttributes(type, attrs).run();
    const node = editor.state.doc.nodeAt(pos);
    if (node?.type.name === type) {
      editor.chain().setNodeSelection(pos).run();
      if (type === "image") syncImageDom();
    }
  };

  const deleteSelectedNode = () => {
    if (!editor) return;
    editor.chain().focus().deleteSelection().run();
  };

  // Viewport rect of the selected media node. The image's own DOM rect is more
  // accurate than coordsAtPos (which can measure line-height for floats), and
  // it's exactly what the drag-resize grip needs to sit on the corner.
  const rectOfSelected = (ed: Editor) => {
    const { selection } = ed.state;
    if (!(selection instanceof NodeSelection)) return null;
    const node = selection.node;
    if (node?.type.name !== "image" && node?.type.name !== "embed") return null;
    const dom = ed.view.nodeDOM(selection.$from.pos) as HTMLElement | null;
    if (dom) {
      const r = dom.getBoundingClientRect();
      return { top: r.top, bottom: r.bottom, left: r.left, width: r.width };
    }
    const c = ed.view.coordsAtPos(selection.$from.pos);
    return { top: c.top, bottom: c.bottom, left: c.left, width: c.right - c.left };
  };

  // Keep the editor's <img> element in sync with the node's dataWidth attr —
  // TipTap's image node view only syncs src/alt/title, and an inline width from
  // a previous drag would otherwise override the CSS presets.
  const syncImageDom = () => {
    if (!editor) return;
    const { selection } = editor.state;
    if (!(selection instanceof NodeSelection) || selection.node.type.name !== "image") return;
    const dom = editor.view.nodeDOM(selection.$from.pos) as HTMLElement | null;
    if (!dom) return;
    const w = selection.node.attrs.dataWidth;
    dom.setAttribute("data-width", w);
    dom.style.width = typeof w === "string" && w.endsWith("%") ? w : w === "half" ? "55%" : "";
  };

  const startResize = (e: React.PointerEvent) => {
    if (!editor) return;
    e.preventDefault();
    e.stopPropagation();
    const { selection } = editor.state;
    if (!(selection instanceof NodeSelection)) return;
    const nodeType = selection.node.type.name;
    if (nodeType !== "image" && nodeType !== "embed") return;
    const pos = selection.$from.pos;
    const el = editor.view.nodeDOM(pos) as HTMLElement | null;
    if (!el) return;
    const startX = e.clientX;
    const startWidth = el.getBoundingClientRect().width;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    const onMove = (ev: PointerEvent) => {
      const delta = ev.clientX - startX;
      const pct = Math.max(20, Math.min(100, Math.round(((startWidth + delta) / editor.view.dom.clientWidth) * 100)));
      editor.chain().updateAttributes(nodeType, { dataWidth: `${pct}%` }).run();
      const live = editor.view.nodeDOM(pos) as HTMLElement | null;
      if (live) {
        live.style.width = `${pct}%`;
        live.setAttribute("data-width", `${pct}%`);
        const r = live.getBoundingClientRect();
        setSelPos({ top: r.top, bottom: r.bottom, left: r.left, width: r.width });
      }
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      const node = editor.state.doc.nodeAt(pos);
      if (node?.type.name === nodeType) editor.chain().setNodeSelection(pos).run();
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  const mediaType = selectedImage ? "image" : selectedEmbed ? "embed" : null;
  const mediaAttrs = selectedImage ?? selectedEmbed;
  const mediaKind = selectedEmbed?.kind;

  const floatingToolbar = mediaType && mediaAttrs && selPos ? (
    <div
      role="toolbar"
      aria-label={mediaType === "image" ? "Image layout controls" : "Media layout controls"}
      className="fixed z-50 flex max-w-[calc(100vw-1rem)] items-center gap-0.5 rounded-full border border-border bg-card px-2 py-1 shadow-xl"
      style={{
        top: Math.max(8, Math.min(selPos.top - 44, window.innerHeight - 56)),
        left: Math.max(8, Math.min(selPos.left + selPos.width / 2, window.innerWidth - 190)),
        transform: "translateX(-50%)",
      }}
    >
      <span className="hidden sm:block px-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {mediaType === "image" ? "Image" : mediaKind}
      </span>
      <ToolbarDivider />
      <ToolbarButton
        label="Align left"
        icon={<AlignLeft className="w-4 h-4" />}
        active={mediaAttrs.dataAlign === "left"}
        onClick={() => applyNodeAttrs(mediaType, { dataAlign: "left" })}
      />
      <ToolbarButton
        label="Align center"
        icon={<AlignCenter className="w-4 h-4" />}
        active={mediaAttrs.dataAlign === "center"}
        onClick={() => applyNodeAttrs(mediaType, { dataAlign: "center" })}
      />
      <ToolbarButton
        label="Align right"
        icon={<AlignRight className="w-4 h-4" />}
        active={mediaAttrs.dataAlign === "right"}
        onClick={() => applyNodeAttrs(mediaType, { dataAlign: "right" })}
      />
      <ToolbarDivider />
      <ToolbarButton
        label="Half width"
        icon={<MoveHorizontal className="w-4 h-4" />}
        active={mediaAttrs.dataWidth === "half"}
        onClick={() => applyNodeAttrs(mediaType, { dataWidth: "half" })}
      />
      <ToolbarButton
        label="Full width"
        icon={<StretchHorizontal className="w-4 h-4" />}
        active={mediaAttrs.dataWidth === "full"}
        onClick={() => applyNodeAttrs(mediaType, { dataWidth: "full" })}
      />
      <ToolbarDivider />
      <ToolbarButton
        label="Delete"
        icon={<Trash2 className="w-4 h-4" />}
        onClick={deleteSelectedNode}
      />
    </div>
  ) : null;

  const onUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    setUploadError("");
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.url) {
        editor.chain().focus().setImage({ src: data.url, alt: file.name }).run();
        setImageOpen(false);
        setImageUrl("");
      } else {
        setUploadError(data.error ?? "Upload failed.");
      }
    } catch {
      setUploadError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const insertImageByUrl = () => {
    const url = imageUrl.trim();
    if (url) {
      editor.chain().focus().setImage({ src: url, alt: "Blog image" }).run();
      setImageUrl("");
      setImageOpen(false);
    }
  };

  const textGroup = [
    { label: "Bold", shortcut: "Mod b", icon: <Bold className="w-4 h-4" />, active: editor.isActive("bold"), onClick: () => editor.chain().focus().toggleBold().run() },
    { label: "Italic", shortcut: "Mod i", icon: <Italic className="w-4 h-4" />, active: editor.isActive("italic"), onClick: () => editor.chain().focus().toggleItalic().run() },
    { label: "Underline", shortcut: "Mod u", icon: <UnderlineIcon className="w-4 h-4" />, active: editor.isActive("underline"), onClick: () => editor.chain().focus().toggleUnderline().run() },
    { label: "Strikethrough", shortcut: "Mod Shift s", icon: <Strikethrough className="w-4 h-4" />, active: editor.isActive("strike"), onClick: () => editor.chain().focus().toggleStrike().run() },
    { label: "Inline code", shortcut: "Mod e", icon: <Code className="w-4 h-4" />, active: editor.isActive("code"), onClick: () => editor.chain().focus().toggleCode().run() },
    { label: "Highlight", shortcut: "Mod Shift h", icon: <Highlighter className="w-4 h-4" />, active: editor.isActive("highlight"), onClick: () => editor.chain().focus().toggleHighlight().run() },
  ];

  const blockGroup = [
    { label: "Heading 2", shortcut: "Mod Alt 2", icon: <Heading1 className="w-4 h-4" />, active: editor.isActive("heading", { level: 2 }), onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run() },
    { label: "Heading 3", shortcut: "Mod Alt 3", icon: <Heading2 className="w-4 h-4" />, active: editor.isActive("heading", { level: 3 }), onClick: () => editor.chain().focus().toggleHeading({ level: 3 }).run() },
    { label: "Bullet list", shortcut: "Mod Shift 8", icon: <List className="w-4 h-4" />, active: editor.isActive("bulletList"), onClick: () => editor.chain().focus().toggleBulletList().run() },
    { label: "Numbered list", shortcut: "Mod Shift 7", icon: <ListOrdered className="w-4 h-4" />, active: editor.isActive("orderedList"), onClick: () => editor.chain().focus().toggleOrderedList().run() },
    { label: "Quote", shortcut: "Mod Shift b", icon: <QuoteIcon className="w-4 h-4" />, active: editor.isActive("blockquote"), onClick: () => editor.chain().focus().toggleBlockquote().run() },
    { label: "Callout", shortcut: "Mod Alt c", icon: <Wand2 className="w-4 h-4" />, active: editor.isActive("callout"), onClick: () => editor.chain().focus().toggleWrap("callout").run() },
    { label: "Divider", icon: <Minus className="w-4 h-4" />, onClick: () => editor.chain().focus().setHorizontalRule().run() },
  ];

  const alignGroup = [
    { label: "Align left", shortcut: "Mod Shift l", icon: <AlignLeft className="w-4 h-4" />, active: editor.isActive({ textAlign: "left" }), onClick: () => editor.chain().focus().setTextAlign("left").run() },
    { label: "Align center", shortcut: "Mod Shift e", icon: <AlignCenter className="w-4 h-4" />, active: editor.isActive({ textAlign: "center" }), onClick: () => editor.chain().focus().setTextAlign("center").run() },
    { label: "Align right", shortcut: "Mod Shift r", icon: <AlignRight className="w-4 h-4" />, active: editor.isActive({ textAlign: "right" }), onClick: () => editor.chain().focus().setTextAlign("right").run() },
  ];

  const historyGroup = [
    { label: "Undo", shortcut: "Mod z", icon: <Undo2 className="w-4 h-4" />, disabled: !editor.can().undo(), onClick: () => editor.chain().focus().undo().run() },
    { label: "Redo", shortcut: "Mod Shift z", icon: <Redo2 className="w-4 h-4" />, disabled: !editor.can().redo(), onClick: () => editor.chain().focus().redo().run() },
  ];

  const linkImageGroup = [
    {
      label: "Add link",
      shortcut: "Mod k",
      icon: <LinkIcon className="w-4 h-4" />,
      active: isLinkActive,
      onClick: () => {
        const { from, to } = editor.state.selection;
        const text = editor.state.doc.textBetween(from, to, " ");
        const prev = editor.getAttributes("link").href as string | undefined;
        setLinkUrl(prev ?? "");
        setLinkText(text);
        setLinkOpen(true);
      },
    },
    {
      label: "Add image",
      icon: <ImageIcon className="w-4 h-4" />,
      onClick: () => {
        setImageUrl("");
        setImageOpen(true);
      },
    },
  ];

  const insertGroup = [
    {
      label: "Starter template (book, video, idea…)",
      icon: <LayoutTemplate className="w-4 h-4" />,
      onClick: () => setTemplateOpen(true),
    },
    {
      label: "Insert content (video, book, social, quote…)",
      icon: <SquarePlus className="w-4 h-4" />,
      onClick: () => setEmbedPickerOpen(true),
    },
  ];

  const insertEmbed = (items: EmbedData[]) => {
    if (items.length === 1) {
      editor.chain().focus().insertContent({ type: "embed", attrs: items[0] }).run();
    } else {
      editor
        .chain()
        .focus()
        .insertContent(items.map((data) => ({ type: "embed", attrs: data })))
        .run();
    }
    setEmbedPickerOpen(false);
  };

  const insertTemplate = (blocks: string) => {
    editor.chain().focus().insertContent(blocks).run();
    setTemplateOpen(false);
  };

  const renderGroup = (vertical: boolean) => {
    const groups = [textGroup, blockGroup, alignGroup, linkImageGroup, historyGroup, insertGroup];
    return groups.map((group, gi) => (
      <div
        key={gi}
        className={vertical ? "flex flex-col items-center gap-0.5" : "flex items-center gap-1"}
      >
        {gi === 0 && (
          <ColorPicker
            editor={editor}
            vertical
            openSide={toolbarPos === "right" ? "left" : "right"}
          />
        )}
        {group.map((b) => (
          <ToolbarButton key={b.label} {...b} />
        ))}
        {gi < groups.length - 1 && <ToolbarDivider vertical={vertical} />}
      </div>
    ));
  };

  const horizontalToolbar = (
    <div className="flex flex-wrap items-center gap-1 p-2">
      <ColorPicker editor={editor} />
      {textGroup.map((b) => (
        <ToolbarButton key={b.label} {...b} />
      ))}
      <ToolbarDivider />
      {blockGroup.map((b) => (
        <ToolbarButton key={b.label} {...b} />
      ))}
      <ToolbarDivider />
      {alignGroup.map((b) => (
        <ToolbarButton key={b.label} {...b} />
      ))}
      <ToolbarDivider />
      {linkImageGroup.map((b) => (
        <ToolbarButton key={b.label} {...b} />
      ))}
      <ToolbarDivider />
      {historyGroup.map((b) => (
        <ToolbarButton key={b.label} {...b} />
      ))}
      <ToolbarDivider />
      {insertGroup.map((b) => (
        <ToolbarButton key={b.label} {...b} />
      ))}
    </div>
  );

  const verticalToolbar = (
    <div className="flex flex-col items-center gap-1 p-2">
      {renderGroup(true)}
    </div>
  );

  const body = (
    <div className="relative">
      {mode === "write" ? (
        <>
          <EditorContent editor={editor} />
          {floatingToolbar}
          {mediaType && selPos && (
            <div
              role="button"
              aria-label="Resize media width"
              title="Drag to resize"
              onPointerDown={startResize}
              className="fixed z-50 h-4 w-4 cursor-col-resize touch-none rounded-[4px] border-2 border-background bg-accent shadow-lg"
              style={{
                left: Math.min(selPos.left + selPos.width, window.innerWidth - 8),
                top: Math.min(selPos.bottom, window.innerHeight - 12),
                transform: "translate(-50%, 50%)",
              }}
            />
          )}
        </>
      ) : (
        <div className="min-h-[60vh]">
          {preview?.url ? (
            <PostPreview url={preview.url} liveUrl={preview.liveUrl} />
          ) : preview?.error ? (
            <div className="flex min-h-[60vh] items-center justify-center px-4">
              <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                <AlertCircle className="w-4 h-4 shrink-0" /> {preview.error}
              </div>
            </div>
          ) : (
            <PreviewPending />
          )}
        </div>
      )}
      {linkOpen && (
        <ModalOverlay label="Add link" onClose={closeLink}>
          <div className="space-y-3">
            <Field label="URL">
              <input
                autoFocus
                type="text"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") applyLink();
                  if (e.key === "Escape") closeLink();
                }}
                placeholder="https://example.com"
                aria-label="Link URL"
                className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-accent"
              />
            </Field>
            <Field label="Link text (optional)">
              <input
                type="text"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") applyLink();
                  if (e.key === "Escape") closeLink();
                }}
                placeholder="Replace selection with linked text"
                aria-label="Link text"
                className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-accent"
              />
            </Field>
            {linkText && linkUrl.trim() && (
              <div className="rounded-lg border border-border bg-background px-3 py-2 text-sm">
                <span className="text-muted-foreground">Preview: </span>
                <a
                  href={/^https?:\/\//i.test(linkUrl.trim()) ? linkUrl.trim() : `https://${linkUrl.trim()}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent underline underline-offset-2"
                >
                  {linkText}
                </a>
              </div>
            )}
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={closeLink}
                className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={applyLink}
                className="inline-flex items-center gap-1 rounded-lg bg-accent px-3 py-1.5 text-sm font-semibold text-accent-foreground hover:opacity-90"
              >
                <Check className="w-4 h-4" />
                {linkText ? "Insert link" : "Apply link"}
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}
      {imageOpen && (
        <ModalOverlay label="Add an image" onClose={() => setImageOpen(false)}>
          <div className="space-y-3">
            <Field label="Paste an image URL">
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") insertImageByUrl();
                  if (e.key === "Escape") setImageOpen(false);
                }}
                placeholder="https://example.com/image.jpg"
                aria-label="Image URL"
                className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-accent"
              />
            </Field>
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={insertImageByUrl}
                disabled={!imageUrl.trim()}
                className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted disabled:opacity-50"
              >
                Add URL
              </button>
              <button
                type="button"
                disabled={uploading}
                onClick={() => {
                  const input = document.getElementById("editor-image-upload");
                  input?.click();
                }}
                className="inline-flex items-center gap-1 rounded-lg bg-accent px-3 py-1.5 text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-60"
              >
                {uploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ImageIcon className="w-4 h-4" />
                )}
                {uploading ? "Uploading…" : "Upload"}
              </button>
              <input
                id="editor-image-upload"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                className="hidden"
                onChange={onUploadImage}
              />
            </div>
            {uploadError && (
              <p className="text-xs text-red-600">Could not upload. Try a smaller photo.</p>
            )}
          </div>
        </ModalOverlay>
      )}
    </div>
  );

  return (
    <div className="relative rounded-2xl border border-border bg-card">
      {/* Mode + toolbar position + help bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-t-2xl bg-card border-b border-border px-3 py-1.5">
        <div className="flex items-center gap-1" role="tablist" aria-label="Editor view">
          <button
            type="button"
            role="tab"
            aria-selected={mode === "write"}
            onClick={() => setMode("write")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              mode === "write"
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <Pencil className="w-3.5 h-3.5" /> Write
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "preview"}
            onClick={() => {
              setMode("preview");
              preview?.onPreview();
            }}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              mode === "preview"
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <Eye className="w-3.5 h-3.5" /> Preview
          </button>
        </div>

        <div className="flex items-center gap-1">
          {/* Toolbar position control */}
          <div
            className="flex items-center gap-0.5 rounded-lg bg-muted/60 p-0.5"
            role="group"
            aria-label="Toolbar position"
          >
            <button
              type="button"
              onClick={() => {
                setToolbarPos("top");
                window.localStorage.setItem("admin-toolbar-pos", "top");
              }}
              aria-pressed={toolbarPos === "top"}
              title="Toolbar on top"
              className={`p-1.5 rounded-md transition-colors ${
                toolbarPos === "top"
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <PanelTop className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => {
                setToolbarPos("left");
                window.localStorage.setItem("admin-toolbar-pos", "left");
              }}
              aria-pressed={toolbarPos === "left"}
              title="Toolbar on the left"
              className={`p-1.5 rounded-md transition-colors ${
                toolbarPos === "left"
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <PanelLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => {
                setToolbarPos("right");
                window.localStorage.setItem("admin-toolbar-pos", "right");
              }}
              aria-pressed={toolbarPos === "right"}
              title="Toolbar on the right"
              className={`p-1.5 rounded-md transition-colors ${
                toolbarPos === "right"
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <PanelRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setHelpOpen(true)}
            aria-label="Editor tools help"
            title="How to use the editor tools"
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-muted"
          >
            <HelpCircle className="w-3.5 h-3.5" /> Help
          </button>
        </div>
      </div>

      {/* Toolbar + body: the editor scrolls internally so the tools never scroll away */}
      {toolbarPos === "top" ? (
        <>
          <div className="sticky top-0 z-30 shrink-0 border-b border-border bg-muted/60">
            {mode === "write" && horizontalToolbar}
          </div>
          <div className="relative max-h-[calc(100dvh-15rem)] min-h-[45vh] overflow-y-auto overscroll-contain">
            {body}
          </div>
        </>
      ) : toolbarPos === "left" ? (
        <div className="flex items-stretch">
          {mode === "write" && (
            <div className="max-h-[calc(100dvh-15rem)] shrink-0 overflow-y-auto rounded-bl-2xl border-r border-border bg-muted/60">
              {verticalToolbar}
            </div>
          )}
          <div className="relative max-h-[calc(100dvh-15rem)] min-h-[45vh] flex-1 min-w-0 overflow-y-auto overscroll-contain">
            {body}
          </div>
        </div>
      ) : (
        <div className="flex items-stretch">
          <div className="relative max-h-[calc(100dvh-15rem)] min-h-[45vh] flex-1 min-w-0 overflow-y-auto overscroll-contain">
            {body}
          </div>
          {mode === "write" && (
            <div className="max-h-[calc(100dvh-15rem)] shrink-0 overflow-y-auto rounded-br-2xl border-l border-border bg-muted/60">
              {verticalToolbar}
            </div>
          )}
        </div>
      )}

      {/* Footer: stats + shortcuts hint */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-b-2xl border-t border-border bg-card px-3 py-1.5 text-[11px] text-muted-foreground">
        <span className="tabular-nums">
          {wordCount.toLocaleString()} words
        </span>
        <span className="tabular-nums">
          {charCount.toLocaleString()} characters
        </span>
        <span className="tabular-nums">~{readTime} min read</span>
        <span className="ml-auto hidden sm:inline-flex items-center gap-1">
          <Keyboard className="w-3.5 h-3.5" />
          <kbd className="rounded border border-border bg-muted px-1">{shortcutLabel("Mod k")}</kbd> link ·{" "}
          <kbd className="rounded border border-border bg-muted px-1">{shortcutLabel("Mod b")}</kbd> bold ·{" "}
          <kbd className="rounded border border-border bg-muted px-1">{shortcutLabel("Mod Shift 8")}</kbd> list
        </span>
      </div>

      {/* Floating save / feature bar pinned to the bottom of the editor */}
      {footer && <div className="rounded-b-2xl bg-card px-3 py-2">{footer}</div>}

      {embedPickerOpen && (
        <EmbedPicker onPick={insertEmbed} onClose={() => setEmbedPickerOpen(false)} />
      )}

      {templateOpen && (
        <ModalOverlay label="Start from a template" onClose={() => setTemplateOpen(false)}>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Pick a starter layout — headings, callouts and placeholders appear in your post. Replace
              the [placeholders] with your own words.
            </p>
            {TEMPLATES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => insertTemplate(t.blocks)}
                className="flex w-full items-center gap-3 rounded-xl border border-border p-3 text-left transition-colors hover:border-accent hover:bg-muted"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-accent/10 text-accent">
                  <LayoutTemplate className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-foreground">{t.title}</span>
                  <span className="block text-xs text-muted-foreground">{t.desc}</span>
                </span>
              </button>
            ))}
          </div>
        </ModalOverlay>
      )}

      {helpOpen && <EditorHelp onClose={() => setHelpOpen(false)} />}
    </div>
  );
}
