"use client";

import { useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { showPrompt } from "@/components/admin/ConfirmDialog";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Highlight from "@tiptap/extension-highlight";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import Typography from "@tiptap/extension-typography";
import Image from "@tiptap/extension-image";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Link as LinkIcon,
  Highlighter,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Minus,
} from "lucide-react";
import { SlashCommandMenu } from "./SlashCommandMenu";

function BubbleMenuButton({
  icon: Icon,
  active,
  onClick,
  label,
}: {
  icon: React.ElementType;
  active?: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={`rounded-md p-1.5 transition-colors ${
        active ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

function ToolbarDivider() {
  return <div className="mx-0.5 h-5 w-px bg-border" />;
}

export type NewsletterTiptapEditorProps = {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
};

export function NewsletterTiptapEditor({
  content,
  onChange,
  placeholder = "Write your newsletter…",
}: NewsletterTiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        codeBlock: false,
        link: false,
        underline: false,
        dropcursor: false,
        gapcursor: false,
      }),
      Underline,
      Link.configure({ openOnClick: false, autolink: true }),
      Image.configure({ inline: false, allowBase64: true }),
      Placeholder.configure({ placeholder }),
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Typography,
    ],
    content,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "newsletter-editor min-h-[400px] w-full px-6 py-4 text-[0.95rem] leading-relaxed focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  const [slashState, setSlashState] = useState<{
    active: boolean;
    query: string;
    position: { top: number; left: number };
  }>({ active: false, query: "", position: { top: 0, left: 0 } });

  // Slash command: detect "/" typed at start of a new line or after whitespace
  useEffect(() => {
    if (!editor) return undefined;
    const handler = (e: KeyboardEvent) => {
      if (slashState.active) {
        if (e.key === "Backspace") {
          const { from } = editor.state.selection;
          const textBefore = editor.state.doc.textBetween(Math.max(0, from - 1), from, " ");
          if (textBefore === "/") {
            setSlashState({ active: false, query: "", position: { top: 0, left: 0 } });
          }
        }
        return;
      }
      if (e.key === "/" && !e.ctrlKey && !e.metaKey) {
        const { from } = editor.state.selection;
        const textBefore = from > 0 ? editor.state.doc.textBetween(Math.max(0, from - 1), from, " ") : " ";
        if (from === 0 || !textBefore || textBefore === " " || textBefore === "\n") {
          const coords = editor.view.coordsAtPos(from);
          setSlashState({ active: true, query: "", position: { top: coords.bottom + 8, left: coords.left } });
        }
      }
    };
    document.addEventListener("keydown", handler, true);
    return () => document.removeEventListener("keydown", handler, true);
  }, [editor, slashState.active]);

  // Update slash command query on text input while active
  useEffect(() => {
    if (!editor || !slashState.active) return undefined;
    const handler = () => {
      const { from } = editor.state.selection;
      const slashPos = from - 1 - slashState.query.length;
      if (slashPos < 0) {
        setSlashState({ active: false, query: "", position: { top: 0, left: 0 } });
        return;
      }
      const text = editor.state.doc.textBetween(slashPos, from, " ");
      if (!text.startsWith("/")) {
        setSlashState({ active: false, query: "", position: { top: 0, left: 0 } });
        return;
      }
      const query = text.slice(1);
      if (query.includes(" ")) {
        setSlashState({ active: false, query: "", position: { top: 0, left: 0 } });
        return;
      }
      setSlashState((s) => ({ ...s, query }));
    };
    editor.on("transaction", handler);
    return () => { editor.off("transaction", handler); };
  }, [editor, slashState.active, slashState.query.length]);

  if (!editor) return null;

  return (
    <div className="rounded-xl border border-border bg-card">
      <BubbleMenu
        editor={editor}
        className="flex items-center gap-0.5 rounded-xl border border-border bg-card px-2 py-1.5 shadow-xl"
      >
        <BubbleMenuButton
          icon={Bold}
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
          label="Bold"
        />
        <BubbleMenuButton
          icon={Italic}
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          label="Italic"
        />
        <BubbleMenuButton
          icon={UnderlineIcon}
          active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          label="Underline"
        />
        <BubbleMenuButton
          icon={Strikethrough}
          active={editor.isActive("strike")}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          label="Strikethrough"
        />
        <BubbleMenuButton
          icon={Code}
          active={editor.isActive("code")}
          onClick={() => editor.chain().focus().toggleCode().run()}
          label="Inline code"
        />
        <ToolbarDivider />
        <BubbleMenuButton
          icon={Highlighter}
          active={editor.isActive("highlight")}
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          label="Highlight"
        />
        <BubbleMenuButton
          icon={LinkIcon}
          active={editor.isActive("link")}
          onClick={async () => {
            const url = await showPrompt({ title: "Link URL", placeholder: "https://...", confirmLabel: "Add link" });
            if (url) editor.chain().focus().setLink({ href: url }).run();
          }}
          label="Add link"
        />
        <ToolbarDivider />
        <BubbleMenuButton
          icon={Heading1}
          active={editor.isActive("heading", { level: 1 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          label="Heading 1"
        />
        <BubbleMenuButton
          icon={Heading2}
          active={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          label="Heading 2"
        />
        <BubbleMenuButton
          icon={Heading3}
          active={editor.isActive("heading", { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          label="Heading 3"
        />
        <ToolbarDivider />
        <BubbleMenuButton
          icon={List}
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          label="Bullet list"
        />
        <BubbleMenuButton
          icon={ListOrdered}
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          label="Numbered list"
        />
        <BubbleMenuButton
          icon={Quote}
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          label="Blockquote"
        />
        <BubbleMenuButton
          icon={Minus}
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          label="Divider"
        />
      </BubbleMenu>

      <div className="border-t border-border">
        <EditorContent editor={editor} />
      </div>

      {slashState.active && editor && (
        <SlashCommandMenu
          editor={editor}
          query={slashState.query}
          position={slashState.position}
          onClose={() => setSlashState({ active: false, query: "", position: { top: 0, left: 0 } })}
        />
      )}

      <style jsx global>{`
        .newsletter-editor .ProseMirror p.is-editor-empty:first-child::before {
          color: var(--muted-foreground);
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }
        .newsletter-editor blockquote {
          border-left: 3px solid var(--accent);
          padding-left: 16px;
          margin: 16px 0;
          font-style: italic;
          color: var(--muted-foreground);
        }
        .newsletter-editor h1 { font-size: 1.5rem; font-weight: 700; margin: 20px 0 12px; }
        .newsletter-editor h2 { font-size: 1.25rem; font-weight: 700; margin: 18px 0 10px; }
        .newsletter-editor h3 { font-size: 1.1rem; font-weight: 600; margin: 16px 0 8px; }
        .newsletter-editor p { margin: 8px 0; }
        .newsletter-editor ul { list-style: disc; padding-left: 24px; margin: 8px 0; }
        .newsletter-editor ol { list-style: decimal; padding-left: 24px; margin: 8px 0; }
        .newsletter-editor hr { border: none; border-top: 1px solid var(--border); margin: 16px 0; }
        .newsletter-editor img { max-width: 100%; height: auto; border-radius: 8px; }
        .newsletter-editor mark { background: #ffd51d40; padding: 0 2px; border-radius: 2px; }
      `}</style>
    </div>
  );
}
