import type { Editor } from "@tiptap/react";
import { useEffect, useRef, useState } from "react";
import { SLASH_COMMANDS, type SlashCommand } from "./slash-commands";

const MENU_HEIGHT = 288; // max-h-72 = 18rem = 288px
const MENU_WIDTH = 256;  // w-64 = 16rem = 256px

export function SlashCommandMenu({
  editor,
  query,
  onClose,
  position,
}: {
  editor: Editor;
  query: string;
  onClose: () => void;
  position: { top: number; left: number };
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [adjustedPos, setAdjustedPos] = useState(position);

  // Clamp to viewport on mount / position change
  useEffect(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let { top, left } = position;

    // If menu would overflow bottom, show it above the cursor
    if (top + MENU_HEIGHT > vh) {
      top = Math.max(8, position.top - MENU_HEIGHT - 28);
    }
    // If menu would overflow right, shift left
    if (left + MENU_WIDTH > vw) {
      left = Math.max(8, vw - MENU_WIDTH - 8);
    }
    // Never go off left edge
    left = Math.max(8, left);

    setAdjustedPos({ top, left });
  }, [position]);

  const filtered = SLASH_COMMANDS.filter(
    (cmd) =>
      cmd.label.toLowerCase().includes(query.toLowerCase()) ||
      cmd.description.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => (i - 1 + filtered.length) % filtered.length);
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => (i + 1) % filtered.length);
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        if (filtered[selectedIndex]) selectItem(filtered[selectedIndex]);
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "Tab") {
        e.preventDefault();
        if (filtered[selectedIndex]) selectItem(filtered[selectedIndex]);
        return;
      }
    };
    document.addEventListener("keydown", handler, true);
    return () => document.removeEventListener("keydown", handler, true);
  }, [editor, filtered, selectedIndex, query, onClose]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const item = container.children[selectedIndex] as HTMLElement;
    if (item) item.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  const selectItem = (cmd: SlashCommand) => {
    const { state } = editor;
    const { from } = state.selection;
    // Delete "/" and any filter text typed after it
    const slashStart = from - 1 - query.length;
    editor
      .chain()
      .focus()
      .deleteRange({ from: slashStart, to: from })
      .run();
    cmd.action(editor);
    onClose();
  };

  if (filtered.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className="fixed z-[9999] max-h-72 w-64 overflow-y-auto rounded-xl border border-border bg-card shadow-2xl"
      style={{ top: adjustedPos.top, left: adjustedPos.left }}
    >
      {query && (
        <div className="border-b border-border px-3 py-2">
          <span className="text-xs text-muted-foreground">Filtering: </span>
          <span className="text-xs font-medium text-foreground">{query}</span>
        </div>
      )}
      {filtered.map((cmd, i) => {
        const Icon = cmd.icon;
        return (
          <button
            key={cmd.label}
            type="button"
            className={`flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors ${
              i === selectedIndex
                ? "bg-accent/10 text-accent-strong"
                : "text-foreground hover:bg-muted"
            }`}
            onMouseDown={(e) => {
              e.preventDefault();
              selectItem(cmd);
            }}
            onMouseEnter={() => setSelectedIndex(i)}
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
              <Icon className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="font-medium">{cmd.label}</p>
              <p className="truncate text-xs text-muted-foreground">
                {cmd.description}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
