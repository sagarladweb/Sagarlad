"use client";

import { Node } from "@tiptap/core";
import { ReactNodeViewRenderer, NodeViewWrapper, type ReactNodeViewProps } from "@tiptap/react";
import type { DOMOutputSpec } from "prosemirror-model";
import { X, Quote as QuoteIcon } from "lucide-react";

export type EmbedKind = "video" | "book" | "ebook" | "social" | "quote";

export type EmbedData = {
  kind: EmbedKind;
  id: string;
  title: string;
  subtitle: string;
  href: string;
  image: string;
  dataWidth?: string;
  dataAlign?: string;
};

const KINDS: Record<EmbedKind, { label: string; cta: string }> = {
  video: { label: "Video", cta: "" },
  book: { label: "Book", cta: "Read this book" },
  ebook: { label: "E-book", cta: "Read this e-book" },
  social: { label: "Social", cta: "" },
  quote: { label: "Quote", cta: "" },
};

/* Build the self-contained card markup that is serialized into the post and
   rendered publicly (PostArticle sanitizes + prints this HTML verbatim). */
export function embedSpec(attrs: Partial<EmbedData>): DOMOutputSpec {
  const { kind = "quote", title, subtitle, href, image } = attrs;
  const t = (s?: string) => (s && s.trim() ? s.trim() : "");
  const clean = (s?: string) => (s ? s.trim() || null : null);
  const titleTxt = t(title);
  const layout: Record<string, string> = {
    "data-width": attrs.dataWidth || "full",
    "data-align": attrs.dataAlign || "center",
  };
  // Custom (drag-resized) widths are stored as percentages — the site CSS
  // can't read a dynamic value from data-width, so carry the width as an
  // inline style too, exactly like images. DOMPurify keeps inline styles.
  if (typeof attrs.dataWidth === "string" && attrs.dataWidth.endsWith("%")) {
    layout.style = `width:${attrs.dataWidth}`;
  }

  if (kind === "video") {
    const mediaChildren: DOMOutputSpec[] = [
      ["span", { class: "tip-embed__play" }, ["b", "▶"]],
    ];
    if (image) {
      mediaChildren.unshift([
        "img",
        { class: "tip-embed__cover", src: image, alt: titleTxt || "Video", loading: "lazy" },
      ]);
    }
    const media: DOMOutputSpec = [
      "a",
      { class: "tip-embed__media", href: href || "#", target: "_blank", rel: "noopener" },
      ...mediaChildren,
    ];
    let titleSpec: DOMOutputSpec | string = titleTxt;
    if (href) titleSpec = ["a", { href, target: "_blank", rel: "noopener" }, titleTxt];
    const body: DOMOutputSpec[] = [
      ["p", { class: "tip-embed__label" }, "Video"],
      ["p", { class: "tip-embed__title" }, titleSpec],
    ];
    if (clean(subtitle)) body.push(["p", { class: "tip-embed__sub" }, t(subtitle)]);
    return [
      "div",
      { class: "tip-embed tip-embed--video", "data-embed": "video", ...layout },
      media,
      ["div", { class: "tip-embed__body" }, ...body],
    ];
  }

  if (kind === "book" || kind === "ebook") {
    const thumb: DOMOutputSpec = image
      ? ["img", { class: "tip-embed__thumb", src: image, alt: titleTxt || "Cover", loading: "lazy" }]
      : ["span", { class: "tip-embed__blank" }, (titleTxt || "B").charAt(0).toUpperCase()];
    const body: DOMOutputSpec[] = [
      ["p", { class: "tip-embed__label" }, KINDS[kind].label],
      ["p", { class: "tip-embed__title" }, titleTxt],
    ];
    if (clean(subtitle)) body.push(["p", { class: "tip-embed__sub" }, t(subtitle)]);
    if (href) body.push(["a", { class: "tip-embed__cta", href, target: "_blank", rel: "noopener" }, KINDS[kind].cta]);
    return [
      "div",
      { class: `tip-embed tip-embed--book tip-embed--media-row`, "data-embed": kind, ...layout },
      ["a", { class: "tip-embed__thumb-wrap", href: href || "#", target: "_blank", rel: "noopener" }, thumb],
      ["div", { class: "tip-embed__body" }, ...body],
    ];
  }

  if (kind === "social") {
    const icon: DOMOutputSpec = image
      ? ["img", { src: image, alt: "", loading: "lazy" }]
      : ["span", (titleTxt || "S").charAt(0).toUpperCase()];
    const body: DOMOutputSpec[] = [["p", { class: "tip-embed__label" }, titleTxt || "Social"]];
    if (clean(subtitle)) body.push(["p", { class: "tip-embed__handle" }, t(subtitle)]);
    return [
      "div",
      { class: "tip-embed tip-embed--social", "data-embed": "social", ...layout },
      ["a", { class: "tip-embed__sicon", href: href || "#", target: "_blank", rel: "noopener" }, icon],
      ["div", { class: "tip-embed__body" }, ...body],
    ];
  }

  const body: DOMOutputSpec[] = [["blockquote", titleTxt]];
  body.push([
    "figcaption",
    clean(subtitle) ? `— Sagar Lad · ${t(subtitle)}` : "— Sagar Lad",
  ]);
  return ["figure", { class: "tip-embed tip-embed--quote", "data-embed": "quote", ...layout }, ...body];
}

export const ContentEmbed = Node.create({
  name: "embed",
  group: "block",
  atom: true,
  defining: true,
  draggable: true,

  addAttributes() {
    return {
      kind: {
        default: "quote",
        parseHTML: (el) => el.getAttribute("data-embed") || "quote",
      },
      id: { default: "" },
      title: {
        default: "",
        parseHTML: (el) => {
          const t =
            el.querySelector(".tip-embed__title") ||
            el.querySelector("blockquote") ||
            el.querySelector(".tip-embed__label");
          return t?.textContent?.trim() || "";
        },
      },
      subtitle: {
        default: "",
        parseHTML: (el) => {
          const sub =
            el.querySelector(".tip-embed__sub") ||
            el.querySelector(".tip-embed__handle") ||
            el.querySelector("figcaption");
          const txt = sub?.textContent?.trim() || "";
          return sub?.tagName === "FIGCAPTION"
            ? txt.replace(/^—\s*Sagar Lad\s*·\s*/, "").trim()
            : txt;
        },
      },
      href: {
        default: "",
        parseHTML: (el) =>
          el
            .querySelector(
              "a.tip-embed__media, a.tip-embed__thumb-wrap, a.tip-embed__cta, a.tip-embed__sicon"
            )
            ?.getAttribute("href") || "",
      },
      image: {
        default: "",
        parseHTML: (el) => el.querySelector("img")?.getAttribute("src") || "",
      },
      dataWidth: { default: "full", parseHTML: (el) => el.getAttribute("data-width") || "full", renderHTML: (a) => (a.dataWidth ? { "data-width": a.dataWidth } : {}) },
      dataAlign: { default: "center", parseHTML: (el) => el.getAttribute("data-align") || "center", renderHTML: (a) => (a.dataAlign ? { "data-align": a.dataAlign } : {}) },
    };
  },

  parseHTML() {
    return [{ tag: "div[data-embed]" }, { tag: "figure[data-embed]" }];
  },

  renderHTML({ node }) {
    return embedSpec(node.attrs);
  },

  addNodeView() {
    return ReactNodeViewRenderer(EmbedNodeView);
  },
});

function EmbedNodeView({ node, selected, deleteNode }: ReactNodeViewProps) {
  const attrs = node.attrs as EmbedData;
  const kind = KINDS[attrs.kind] ?? KINDS.quote;
  const width = attrs.dataWidth || "full";
  const align = attrs.dataAlign || "center";
  const cover = attrs.image ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={attrs.image} alt="" loading="lazy" />
  ) : (
    <span className="grid h-full w-full place-items-center bg-card text-lg font-bold text-accent">
      {(attrs.title || "S").charAt(0).toUpperCase()}
    </span>
  );

  const renderBody = () => {
    switch (attrs.kind) {
      case "video":
        return (
          <div className="p-0">
            <a
              href={attrs.href || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="tip-embed__media"
            >
              {cover}
              <span className="tip-embed__play">
                <b>▶</b>
              </span>
            </a>
            <div className="tip-embed__body px-3 py-2.5">
              <p className="tip-embed__label">Video</p>
              <p className="tip-embed__title">{attrs.title || "Untitled"}</p>
              {attrs.subtitle ? <p className="tip-embed__sub">{attrs.subtitle}</p> : null}
            </div>
          </div>
        );
      case "book":
      case "ebook":
        return (
          <div className="tip-embed--media-row">
            <a
              href={attrs.href || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="tip-embed__thumb-wrap"
            >
              {cover}
            </a>
            <div className="tip-embed__body">
              <p className="tip-embed__label">{kind.label}</p>
              <p className="tip-embed__title">{attrs.title || "Untitled"}</p>
              {attrs.subtitle ? (
                <p className="tip-embed__sub">{attrs.subtitle}</p>
              ) : null}
              {attrs.href ? (
                <a
                  href={attrs.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tip-embed__cta"
                >
                  {kind.cta || kind.label}
                </a>
              ) : null}
            </div>
          </div>
        );
      case "social":
        return (
          <div className="flex items-center gap-3 px-3 py-2.5">
            <span className="grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded-full bg-card text-sm font-bold text-accent">
              {cover}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-foreground">
                {attrs.title || "Social"}
              </span>
              {attrs.subtitle ? (
                <span className="block truncate text-xs text-accent">{attrs.subtitle}</span>
              ) : null}
            </span>
          </div>
        );
      default:
        return (
          <figure className="px-3 py-2.5">
            <blockquote className="border-l-2 border-accent pl-3 text-sm italic text-foreground">
              {attrs.title || "Untitled quote"}
            </blockquote>
            <figcaption className="mt-1 pl-3 text-xs text-muted-foreground">
              {attrs.subtitle ? `— Sagar Lad · ${attrs.subtitle}` : "— Sagar Lad"}
            </figcaption>
          </figure>
        );
    }
  };

  return (
    <NodeViewWrapper
      className={`tip-embed-node group my-4 overflow-hidden rounded-xl border ${
        selected ? "border-accent ring-2 ring-accent/30" : "border-border"
      }`}
      style={{
        width:
          width === "half"
            ? "55%"
            : typeof width === "string" && width.endsWith("%")
              ? width
              : "100%",
        marginLeft: align === "left" ? 0 : "auto",
        marginRight: align === "right" ? 0 : "auto",
      }}
    >
      <div className="flex items-center justify-between gap-2 bg-muted/60 px-3 py-1.5">
        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-accent">
          {attrs.kind === "quote" ? <QuoteIcon className="h-3 w-3" /> : null}
          {kind.label}
        </span>
        <button
          type="button"
          aria-label="Remove embedded content"
          onClick={deleteNode}
          className="rounded-md p-1 text-muted-foreground opacity-60 transition-opacity hover:bg-border hover:text-foreground group-hover:opacity-100"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      {renderBody()}
    </NodeViewWrapper>
  );
}