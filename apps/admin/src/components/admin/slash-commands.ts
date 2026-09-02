import type { Editor } from "@tiptap/react";
import {
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Minus,
  ImageIcon,
  SquarePlus,
  AlertCircle,
  Link,
  Highlighter,
  type LucideIcon,
} from "lucide-react";
import { showPrompt } from "@/components/admin/ConfirmDialog";

export type SlashCommand = {
  label: string;
  icon: LucideIcon;
  description: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  action: (editor: Editor) => any;
};

export const SLASH_COMMANDS: SlashCommand[] = [
  {
    label: "Heading 1",
    icon: Heading1,
    description: "Large section heading",
    action: (e) => e.chain().focus().toggleHeading({ level: 1 }).run(),
  },
  {
    label: "Heading 2",
    icon: Heading2,
    description: "Medium section heading",
    action: (e) => e.chain().focus().toggleHeading({ level: 2 }).run(),
  },
  {
    label: "Heading 3",
    icon: Heading3,
    description: "Small section heading",
    action: (e) => e.chain().focus().toggleHeading({ level: 3 }).run(),
  },
  {
    label: "Bullet List",
    icon: List,
    description: "Unordered list",
    action: (e) => e.chain().focus().toggleBulletList().run(),
  },
  {
    label: "Numbered List",
    icon: ListOrdered,
    description: "Ordered list",
    action: (e) => e.chain().focus().toggleOrderedList().run(),
  },
  {
    label: "Blockquote",
    icon: Quote,
    description: "Highlighted quote block",
    action: (e) => e.chain().focus().toggleBlockquote().run(),
  },
  {
    label: "Code Block",
    icon: Code,
    description: "Syntax-highlighted code",
    action: (e) => e.chain().focus().toggleCodeBlock().run(),
  },
  {
    label: "Callout",
    icon: AlertCircle,
    description: "Highlighted note box",
    action: (e) => e.chain().focus().toggleWrap("callout").run(),
  },
  {
    label: "Divider",
    icon: Minus,
    description: "Horizontal rule",
    action: (e) => e.chain().focus().setHorizontalRule().run(),
  },
  {
    label: "Image",
    icon: ImageIcon,
    description: "Upload or embed an image",
    action: async (e) => {
      const url = await showPrompt({ title: "Image URL", placeholder: "https://...", confirmLabel: "Add image" });
      if (url) e.chain().focus().setImage({ src: url }).run();
    },
  },
  {
    label: "Embed",
    icon: SquarePlus,
    description: "Video, book, or social card",
    action: () => {
      document.dispatchEvent(new CustomEvent("open-embed-picker"));
    },
  },
  {
    label: "Link",
    icon: Link,
    description: "Add a hyperlink",
    action: async (e) => {
      const url = await showPrompt({ title: "Link URL", placeholder: "https://...", confirmLabel: "Add link" });
      if (url) e.chain().focus().setLink({ href: url }).run();
    },
  },
  {
    label: "Highlight",
    icon: Highlighter,
    description: "Highlight text with color",
    action: (e) => e.chain().focus().toggleHighlight().run(),
  },
];
