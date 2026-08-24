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
import ListBulletList from "@tiptap/extension-bullet-list";
import ListOrderedList from "@tiptap/extension-ordered-list";
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
  Trash2,
  ListTree,
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

const HIGHLIGHT_COLORS = [
  { label: "Yellow", value: "#fef08a" },
  { label: "Green", value: "#bbf7d0" },
  { label: "Blue", value: "#bfdbfe" },
  { label: "Pink", value: "#fbcfe8" },
  { label: "Orange", value: "#fed7aa" },
  { label: "Purple", value: "#e9d5ff" },
];

function HighlightPicker({
  editor,
  vertical,
  openSide = "right",
}: {
  editor: Editor;
  vertical?: boolean;
  openSide?: "left" | "right";
}) {
  const [open, setOpen] = useState(false);
  const [activeHighlightColor, setActiveHighlightColor] = useState("#fef08a");
  const pickerRef = useRef<HTMLDivElement>(null);
  const isHighlighted = editor.isActive("highlight");
  const currentColor = (editor.getAttributes("highlight").color as string) || activeHighlightColor;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onDown = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Element)) {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, [open]);

  // Quick 1-click apply of the last selected highlight color
  const quickApplyHighlight = () => {
    if (isHighlighted) {
      editor.chain().focus().unsetHighlight().run();
    } else {
      editor.chain().focus().toggleHighlight({ color: activeHighlightColor }).run();
    }
  };

  const applyColor = (colorHex: string) => {
    setActiveHighlightColor(colorHex);
    editor.chain().focus().setHighlight({ color: colorHex }).run();
    setOpen(false);
  };

  return (
    <div ref={pickerRef} className="relative flex items-center">
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={quickApplyHighlight}
        aria-label={`Apply ${activeHighlightColor} highlight`}
        title={`Apply highlight color (${shortcutLabel("Mod Shift h")})`}
        className={`inline-flex items-center gap-1 rounded-l-lg p-1.5 text-xs font-semibold transition-colors hover:bg-muted ${
          isHighlighted ? "bg-accent text-accent-foreground" : "text-muted-foreground"
        }`}
      >
        <Highlighter className="w-4 h-4" />
        <span
          className="h-2 w-3.5 rounded-sm border border-black/20"
          style={{ backgroundColor: currentColor }}
        />
      </button>
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setOpen((o) => !o)}
        aria-label="Pick highlight color"
        title="Choose highlight color"
        className={`rounded-r-lg border-l border-border/60 p-1 text-xs text-muted-foreground hover:bg-muted ${
          open ? "bg-muted" : ""
        }`}
      >
        ▼
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Highlight color picker"
          className={`absolute z-40 rounded-2xl border border-border bg-card p-3 shadow-2xl ${
            vertical
              ? openSide === "left"
                ? "right-full top-1/2 mr-2 -translate-y-1/2"
                : "left-full top-1/2 ml-2 -translate-y-1/2"
              : "left-0 top-full mt-2"
          }`}
        >
          <div className="mb-2 flex items-center justify-between gap-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Highlight Color
            </span>
            <button
              type="button"
              aria-label="Close highlight picker"
              title="Close (Esc)"
              onClick={() => setOpen(false)}
              className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            {HIGHLIGHT_COLORS.map((c) => (
              <button
                key={c.value}
                type="button"
                aria-label={`Highlight ${c.label}`}
                aria-pressed={currentColor === c.value}
                title={c.label}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => applyColor(c.value)}
                className={`h-6 w-6 rounded-full border border-border/60 transition-transform hover:scale-110 ${
                  activeHighlightColor === c.value ? "ring-2 ring-accent" : ""
                }`}
                style={{ backgroundColor: c.value }}
              />
            ))}
          </div>

          <div className="mt-3 flex items-center justify-end gap-2 border-t border-border pt-2">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                editor.chain().focus().unsetHighlight().run();
                setOpen(false);
              }}
              className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="w-3 h-3" /> Clear highlight
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ListStylePicker({
  editor,
  vertical,
  openSide = "right",
}: {
  editor: Editor;
  vertical?: boolean;
  openSide?: "left" | "right";
}) {
  const [open, setOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const inBullet = editor.isActive("bulletList");
  const inOrdered = editor.isActive("orderedList");
  const current = inBullet
    ? (editor.getAttributes("bulletList").listStyle as string) || "disc"
    : inOrdered
      ? (editor.getAttributes("orderedList").listStyle as string) || "decimal"
      : null;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onDown = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Element)) {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, [open]);

  const apply = (listType: "bulletList" | "orderedList", value: string) => {
    if (listType === "bulletList") {
      if (!editor.isActive("bulletList")) {
        editor.chain().focus().toggleBulletList().updateAttributes("bulletList", { listStyle: value }).run();
      } else {
        editor.chain().focus().updateAttributes("bulletList", { listStyle: value }).run();
      }
    } else if (listType === "orderedList") {
      if (!editor.isActive("orderedList")) {
        editor.chain().focus().toggleOrderedList().updateAttributes("orderedList", { listStyle: value }).run();
      } else {
        editor.chain().focus().updateAttributes("orderedList", { listStyle: value }).run();
      }
    }
    setOpen(false);
  };

  return (
    <div ref={pickerRef} className="relative">
      <ToolbarButton
        label="List style"
        icon={<ListTree className="w-4 h-4" />}
        active={open || inBullet || inOrdered}
        onClick={() => setOpen((o) => !o)}
      />
      {open && (
        <div
          role="dialog"
          aria-label="List style picker"
          className={`absolute z-40 w-60 rounded-2xl border border-border bg-card p-3.5 shadow-2xl ${
            vertical
              ? openSide === "left"
                ? "right-full top-1/2 mr-2 -translate-y-1/2"
                : "left-full top-1/2 ml-2 -translate-y-1/2"
              : "left-0 top-full mt-2"
          }`}
        >
          <div className="mb-2.5 flex items-center justify-between gap-4 border-b border-border pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Bullet & List Styles
            </span>
            <button
              type="button"
              aria-label="Close list style picker"
              title="Close (Esc)"
              onClick={() => setOpen(false)}
              className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Bullet Styles
              </p>
              <div className="grid gap-1">
                {LIST_STYLES.bullet.map((o) => (
                  <button
                    key={o.value}
                    type="button"
                    aria-pressed={inBullet && current === o.value}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => apply("bulletList", o.value)}
                    className={`flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-xs font-medium transition-colors ${
                      inBullet && current === o.value
                        ? "bg-accent text-accent-foreground font-semibold"
                        : "hover:bg-muted text-foreground"
                    }`}
                  >
                    <span
                      className="inline-block h-3 w-3 shrink-0 border border-current"
                      style={{
                        borderRadius:
                          o.value === "disc" || o.value === "circle" ? "9999px" : "2px",
                        backgroundColor:
                          o.value === "disc" ? "currentColor" : "transparent",
                      }}
                    />
                    <span>{o.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Numbered & Roman Styles
              </p>
              <div className="grid gap-1">
                {LIST_STYLES.ordered.map((o) => (
                  <button
                    key={o.value}
                    type="button"
                    aria-pressed={inOrdered && current === o.value}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => apply("orderedList", o.value)}
                    className={`flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-xs font-medium transition-colors ${
                      inOrdered && current === o.value
                        ? "bg-accent text-accent-foreground font-semibold"
                        : "hover:bg-muted text-foreground"
                    }`}
                  >
                    <span className="w-6 shrink-0 text-right font-mono text-xs font-bold text-accent">
                      {o.preview}
                    </span>
                    <span>{o.label}</span>
                  </button>
                ))}
              </div>
            </div>
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

// List-style variants: bullet lists (disc/circle/square) and ordered lists
// (decimal/nested-decimal/lower-alpha/upper-alpha/lower-roman/upper-roman).
const LIST_STYLES = {
  bullet: [
    { label: "Disc Bullet (●)", value: "disc" },
    { label: "Circle Bullet (○)", value: "circle" },
    { label: "Square Bullet (■)", value: "square" },
  ],
  ordered: [
    { label: "Standard Numbers", value: "decimal", preview: "1." },
    { label: "Nested Numbers (1.1, 1.2)", value: "nested-decimal", preview: "1.1" },
    { label: "Lowercase Roman", value: "lower-roman", preview: "i." },
    { label: "Uppercase Roman", value: "upper-roman", preview: "I." },
    { label: "Lowercase Letters", value: "lower-alpha", preview: "a." },
    { label: "Uppercase Letters", value: "upper-alpha", preview: "A." },
  ],
} as const;

const StyledBulletList = ListBulletList.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      listStyle: {
        default: "disc",
        parseHTML: (element) =>
          element.getAttribute("data-list-style") || element.style.listStyleType || "disc",
        renderHTML: (attributes) => {
          const { listStyle, ...rest } = attributes;
          const style =
            listStyle && listStyle !== "disc"
              ? { style: `list-style-type:${listStyle}`, "data-list-style": listStyle }
              : {};
          return ["ul", mergeAttributes(rest, style), 0];
        },
      },
    };
  },
});

const StyledOrderedList = ListOrderedList.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      listStyle: {
        default: "decimal",
        parseHTML: (element) =>
          element.getAttribute("data-list-style") ||
          element.style.listStyleType ||
          (element.classList.contains("list-nested-decimal") ? "nested-decimal" : "decimal"),
        renderHTML: (attributes) => {
          const { listStyle, ...rest } = attributes;
          if (listStyle === "nested-decimal") {
            return [
              "ol",
              mergeAttributes(rest, {
                class: "list-nested-decimal",
                style: "list-style-type:none;",
                "data-list-style": "nested-decimal",
              }),
              0,
            ];
          }
          const style =
            listStyle && listStyle !== "decimal"
              ? { style: `list-style-type:${listStyle}`, "data-list-style": listStyle }
              : {};
          return ["ol", mergeAttributes(rest, style), 0];
        },
      },
    };
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
            •{" "}
            <span className="font-semibold text-foreground">Inline code</span> ({" "}
            <kbd className="rounded border border-border bg-muted px-1 py-0.5">{shortcutLabel("Mod e")}</kbd>{" "}
            or the <Code className="inline h-3 w-3" /> button) is for short commands, keys and
            file names inside a sentence.
          </p>
          <p>
            •{" "}
            <span className="font-semibold text-foreground">Callout</span> ({" "}
            <kbd className="rounded border border-border bg-muted px-1 py-0.5">{shortcutLabel("Mod Alt c")}</kbd>{" "}
            or the <Wand2 className="inline h-3 w-3" /> button) turns any paragraph into a
            highlighted note box — great for tips and warnings.
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

function EditorContextMenu({
  editor,
  position,
  onClose,
}: {
  editor: Editor;
  position: { x: number; y: number };
  onClose: () => void;
}) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Element)) {
        onClose();
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const inBullet = editor.isActive("bulletList");
  const inOrdered = editor.isActive("orderedList");
  const inList = inBullet || inOrdered;
  const currentBulletStyle = inBullet ? (editor.getAttributes("bulletList").listStyle || "disc") : null;
  const currentOrderedStyle = inOrdered ? (editor.getAttributes("orderedList").listStyle || "decimal") : null;

  const setHeading = (level: 1 | 2 | 3 | 4) => {
    editor.chain().focus().toggleHeading({ level }).run();
    onClose();
  };
  const setParagraph = () => {
    editor.chain().focus().setParagraph().run();
    onClose();
  };
  const setCallout = () => {
    editor.chain().focus().toggleWrap("callout").run();
    onClose();
  };
  const setBlockquote = () => {
    editor.chain().focus().toggleBlockquote().run();
    onClose();
  };

  const applyBulletStyle = (style: string) => {
    if (inOrdered) {
      editor.chain().focus().toggleBulletList().updateAttributes("bulletList", { listStyle: style }).run();
    } else if (inBullet) {
      editor.chain().focus().updateAttributes("bulletList", { listStyle: style }).run();
    } else {
      editor.chain().focus().toggleBulletList().updateAttributes("bulletList", { listStyle: style }).run();
    }
    onClose();
  };

  const applyOrderedStyle = (style: string) => {
    if (inBullet) {
      editor.chain().focus().toggleOrderedList().updateAttributes("orderedList", { listStyle: style }).run();
    } else if (inOrdered) {
      editor.chain().focus().updateAttributes("orderedList", { listStyle: style }).run();
    } else {
      editor.chain().focus().toggleOrderedList().updateAttributes("orderedList", { listStyle: style }).run();
    }
    onClose();
  };

  const indentList = () => {
    editor.chain().focus().sinkListItem("listItem").run();
    onClose();
  };

  const outdentList = () => {
    editor.chain().focus().liftListItem("listItem").run();
    onClose();
  };

  const left = typeof window !== "undefined" ? Math.min(position.x, window.innerWidth - 270) : position.x;
  const top = typeof window !== "undefined" ? Math.min(position.y, window.innerHeight - 490) : position.y;

  return (
    <div
      ref={menuRef}
      role="menu"
      aria-label="Editor context menu"
      className="fixed z-50 w-64 rounded-2xl border border-border bg-card p-2.5 shadow-2xl space-y-2 text-xs"
      style={{ left: `${Math.max(10, left)}px`, top: `${Math.max(10, top)}px` }}
    >
      <div>
        <p className="px-2 py-0.5 font-semibold uppercase tracking-wider text-[10px] text-muted-foreground">
          Headings & Tags
        </p>
        <div className="grid grid-cols-2 gap-1 mt-1">
          <button
            type="button"
            onClick={() => setHeading(1)}
            className={`flex items-center gap-1.5 rounded-lg px-2 py-1.5 font-medium transition-colors ${
              editor.isActive("heading", { level: 1 }) ? "bg-accent text-accent-foreground font-bold" : "hover:bg-muted"
            }`}
          >
            <span className="font-display font-bold text-xs">H1</span> Heading 1
          </button>
          <button
            type="button"
            onClick={() => setHeading(2)}
            className={`flex items-center gap-1.5 rounded-lg px-2 py-1.5 font-medium transition-colors ${
              editor.isActive("heading", { level: 2 }) ? "bg-accent text-accent-foreground font-bold" : "hover:bg-muted"
            }`}
          >
            <span className="font-display font-bold text-xs">H2</span> Heading 2
          </button>
          <button
            type="button"
            onClick={() => setHeading(3)}
            className={`flex items-center gap-1.5 rounded-lg px-2 py-1.5 font-medium transition-colors ${
              editor.isActive("heading", { level: 3 }) ? "bg-accent text-accent-foreground font-bold" : "hover:bg-muted"
            }`}
          >
            <span className="font-display font-bold text-xs">H3</span> Heading 3
          </button>
          <button
            type="button"
            onClick={() => setHeading(4)}
            className={`flex items-center gap-1.5 rounded-lg px-2 py-1.5 font-medium transition-colors ${
              editor.isActive("heading", { level: 4 }) ? "bg-accent text-accent-foreground font-bold" : "hover:bg-muted"
            }`}
          >
            <span className="font-display font-bold text-xs">H4</span> Heading 4
          </button>
          <button
            type="button"
            onClick={setParagraph}
            className={`col-span-2 flex items-center gap-1.5 rounded-lg px-2 py-1.5 font-medium transition-colors ${
              editor.isActive("paragraph") ? "bg-accent text-accent-foreground font-bold" : "hover:bg-muted"
            }`}
          >
            <span>¶</span> Paragraph Text
          </button>
        </div>
      </div>

      <div className="border-t border-border pt-1.5">
        <p className="px-2 py-0.5 font-semibold uppercase tracking-wider text-[10px] text-muted-foreground">
          Bullet Points & Lists
        </p>
        <div className="space-y-1 mt-1">
          <div className="px-2 text-[10px] font-semibold text-muted-foreground">Bullet Variants</div>
          <div className="grid grid-cols-3 gap-1">
            <button
              type="button"
              onClick={() => applyBulletStyle("disc")}
              className={`flex items-center justify-center gap-1 rounded-lg px-1 py-1 transition-colors ${
                inBullet && currentBulletStyle === "disc" ? "bg-accent text-accent-foreground font-bold" : "hover:bg-muted"
              }`}
              title="Disc Bullet (●)"
            >
              ● Disc
            </button>
            <button
              type="button"
              onClick={() => applyBulletStyle("circle")}
              className={`flex items-center justify-center gap-1 rounded-lg px-1 py-1 transition-colors ${
                inBullet && currentBulletStyle === "circle" ? "bg-accent text-accent-foreground font-bold" : "hover:bg-muted"
              }`}
              title="Circle Bullet (○)"
            >
              ○ Circle
            </button>
            <button
              type="button"
              onClick={() => applyBulletStyle("square")}
              className={`flex items-center justify-center gap-1 rounded-lg px-1 py-1 transition-colors ${
                inBullet && currentBulletStyle === "square" ? "bg-accent text-accent-foreground font-bold" : "hover:bg-muted"
              }`}
              title="Square Bullet (■)"
            >
              ■ Square
            </button>
          </div>

          <div className="px-2 pt-1 text-[10px] font-semibold text-muted-foreground">Numbered / Hierarchical</div>
          <div className="grid grid-cols-1 gap-1">
            <button
              type="button"
              onClick={() => applyOrderedStyle("decimal")}
              className={`flex items-center gap-1.5 rounded-lg px-2 py-1 transition-colors ${
                inOrdered && currentOrderedStyle === "decimal" ? "bg-accent text-accent-foreground font-bold" : "hover:bg-muted"
              }`}
            >
              <span className="font-mono font-bold w-6">1.</span> Numbers (1, 2, 3)
            </button>
            <button
              type="button"
              onClick={() => applyOrderedStyle("nested-decimal")}
              className={`flex items-center gap-1.5 rounded-lg px-2 py-1 transition-colors ${
                inOrdered && currentOrderedStyle === "nested-decimal" ? "bg-accent text-accent-foreground font-bold" : "hover:bg-muted"
              }`}
            >
              <span className="font-mono font-bold w-6">1.1</span> Hierarchical (1.1, 1.2)
            </button>
            <button
              type="button"
              onClick={() => applyOrderedStyle("lower-roman")}
              className={`flex items-center gap-1.5 rounded-lg px-2 py-1 transition-colors ${
                inOrdered && currentOrderedStyle === "lower-roman" ? "bg-accent text-accent-foreground font-bold" : "hover:bg-muted"
              }`}
            >
              <span className="font-mono font-bold w-6">i.</span> Lower Roman (i, ii)
            </button>
            <button
              type="button"
              onClick={() => applyOrderedStyle("upper-roman")}
              className={`flex items-center gap-1.5 rounded-lg px-2 py-1 transition-colors ${
                inOrdered && currentOrderedStyle === "upper-roman" ? "bg-accent text-accent-foreground font-bold" : "hover:bg-muted"
              }`}
            >
              <span className="font-mono font-bold w-6">I.</span> Upper Roman (I, II)
            </button>
            <button
              type="button"
              onClick={() => applyOrderedStyle("lower-alpha")}
              className={`flex items-center gap-1.5 rounded-lg px-2 py-1 transition-colors ${
                inOrdered && currentOrderedStyle === "lower-alpha" ? "bg-accent text-accent-foreground font-bold" : "hover:bg-muted"
              }`}
            >
              <span className="font-mono font-bold w-6">a.</span> Lower Alpha (a, b)
            </button>
            <button
              type="button"
              onClick={() => applyOrderedStyle("upper-alpha")}
              className={`flex items-center gap-1.5 rounded-lg px-2 py-1 transition-colors ${
                inOrdered && currentOrderedStyle === "upper-alpha" ? "bg-accent text-accent-foreground font-bold" : "hover:bg-muted"
              }`}
            >
              <span className="font-mono font-bold w-6">A.</span> Upper Alpha (A, B)
            </button>
          </div>
        </div>
      </div>

      {inList && (
        <div className="border-t border-border pt-1.5 flex items-center justify-between gap-1">
          <button
            type="button"
            onClick={indentList}
            className="flex-1 flex items-center justify-center gap-1 rounded-lg px-2 py-1 hover:bg-muted text-muted-foreground hover:text-foreground font-medium"
            title="Sub-category level (Tab)"
          >
            ↳ Indent Level
          </button>
          <button
            type="button"
            onClick={outdentList}
            className="flex-1 flex items-center justify-center gap-1 rounded-lg px-2 py-1 hover:bg-muted text-muted-foreground hover:text-foreground font-medium"
            title="Outdent level (Shift+Tab)"
          >
            ↰ Outdent Level
          </button>
        </div>
      )}

      <div className="border-t border-border pt-1.5 flex items-center justify-between gap-1">
        <button
          type="button"
          onClick={setCallout}
          className="flex-1 flex items-center justify-center gap-1 rounded-lg px-2 py-1 hover:bg-muted font-medium"
        >
          Callout
        </button>
        <button
          type="button"
          onClick={setBlockquote}
          className="flex-1 flex items-center justify-center gap-1 rounded-lg px-2 py-1 hover:bg-muted font-medium"
        >
          Quote
        </button>
      </div>
    </div>
  );
}

export function TipTapEditor({
  initialContent,
  onChange,
  preview,
  footer,
  stickyToolbarOffset = "top-14",
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
  stickyToolbarOffset?: string;
}) {
  const [mode, setMode] = useState<"write" | "preview">("write");
  const [contextMenuPos, setContextMenuPos] = useState<{ x: number; y: number } | null>(null);
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
        heading: { levels: [1, 2, 3, 4] },
        codeBlock: { HTMLAttributes: { spellcheck: "false" } },
        link: false,
        underline: false,
        dropcursor: false,
        gapcursor: false,
        bulletList: false,
        orderedList: false,
      }),
      Underline,
      StyledBulletList,
      StyledOrderedList,
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
          "editor-content prose-editor mx-auto max-w-full min-h-[60vh] w-full bg-background px-6 py-6 text-[0.95rem] leading-relaxed focus:outline-none",
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
  ];

  const blockGroup = [
    { label: "Heading 1", shortcut: "Mod Alt 1", icon: <Heading1 className="w-4 h-4" />, active: editor.isActive("heading", { level: 1 }), onClick: () => editor.chain().focus().toggleHeading({ level: 1 }).run() },
    { label: "Heading 2", shortcut: "Mod Alt 2", icon: <Heading2 className="w-4 h-4" />, active: editor.isActive("heading", { level: 2 }), onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run() },
    { label: "Bullet list", shortcut: "Mod Shift 8", icon: <List className="w-4 h-4" />, active: editor.isActive("bulletList") || editor.isActive("orderedList"), onClick: () => editor.chain().focus().toggleBulletList().run() },
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

  const renderGroup = (vertical: boolean) => {
    const groups = [textGroup, blockGroup, alignGroup, linkImageGroup, historyGroup, insertGroup];
    return groups.map((group, gi) => (
      <div
        key={gi}
        className={vertical ? "flex flex-col items-center gap-0.5" : "flex items-center gap-1"}
      >
        {gi === 0 && (
          <>
            <ColorPicker
              editor={editor}
              vertical
              openSide={toolbarPos === "right" ? "left" : "right"}
            />
            <HighlightPicker
              editor={editor}
              vertical
              openSide={toolbarPos === "right" ? "left" : "right"}
            />
          </>
        )}
        {group.map((b) => (
          <ToolbarButton key={b.label} {...b} />
        ))}
        {gi === 1 && (
          <ListStylePicker
            editor={editor}
            vertical
            openSide={toolbarPos === "right" ? "left" : "right"}
          />
        )}
        {gi < groups.length - 1 && <ToolbarDivider vertical={vertical} />}
      </div>
    ));
  };

  const horizontalToolbar = (
    <div className="flex flex-wrap items-center gap-1 p-2">
      <ColorPicker editor={editor} />
      <HighlightPicker editor={editor} />
      {textGroup.map((b) => (
        <ToolbarButton key={b.label} {...b} />
      ))}
      <ToolbarDivider />
      {blockGroup.map((b) => (
        <ToolbarButton key={b.label} {...b} />
      ))}
      <ListStylePicker editor={editor} />
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

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenuPos({ x: e.clientX, y: e.clientY });
  };

  const body = (
    <div className="relative" onContextMenu={handleContextMenu}>
      {mode === "write" ? (
        <>
          <EditorContent editor={editor} />
          {contextMenuPos && (
            <EditorContextMenu
              editor={editor}
              position={contextMenuPos}
              onClose={() => setContextMenuPos(null)}
            />
          )}
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
      {/* Mode + toolbar position + help bar — scrolls away, not sticky */}
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

          {mode === "write" && (
            <button
              type="button"
              onClick={() => setHelpOpen(true)}
              aria-label="Editor tools help"
              title="How to use the editor tools"
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-muted"
            >
              <HelpCircle className="w-3.5 h-3.5" /> Help
            </button>
          )}
        </div>
      </div>

        {/* Only the toolbar is sticky — sticks flush at the top, no gap */}
        {toolbarPos === "top" ? (
          <div className={`sticky ${stickyToolbarOffset} z-30 shrink-0 border-b border-border bg-card shadow-sm`}>
            {mode === "write" && horizontalToolbar}
          </div>
        ) : null}

      {toolbarPos === "top" ? (
        <div className="relative min-h-[45vh]">{body}</div>
      ) : toolbarPos === "left" ? (
        <div className="flex items-start">
          {mode === "write" && (
            <div className={`sticky ${stickyToolbarOffset} z-30 max-h-[calc(100vh-3.5rem)] shrink-0 overflow-y-auto rounded-bl-2xl border-r border-border bg-card shadow-sm`}>
              {verticalToolbar}
            </div>
          )}
          <div className="relative min-h-[45vh] flex-1 min-w-0">{body}</div>
        </div>
      ) : (
        <div className="flex items-start">
          <div className="relative min-h-[45vh] flex-1 min-w-0">{body}</div>
          {mode === "write" && (
            <div className={`sticky ${stickyToolbarOffset} z-30 max-h-[calc(100vh-3.5rem)] shrink-0 overflow-y-auto rounded-br-2xl border-l border-border bg-card shadow-sm`}>
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

      {helpOpen && <EditorHelp onClose={() => setHelpOpen(false)} />}
    </div>
  );
}
