"use client";

import { useRef, useEffect, useCallback } from "react";

type Props = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
};

export function CodeEditor({ value, onChange, placeholder, rows = 10, className }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  const lines = value.split("\n").length;
  const lineCount = Math.max(lines, rows);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const ta = e.currentTarget;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const val = ta.value;
      if (e.shiftKey) {
        // unindent: remove leading tab/spaces from current line
        const lineStart = val.lastIndexOf("\n", start - 1) + 1;
        const line = val.slice(lineStart, end);
        const unindented = line.replace(/^\t {1,4}/, "").replace(/^ {1,4}/, "");
        const diff = line.length - unindented.length;
        const newVal = val.slice(0, lineStart) + unindented + val.slice(end);
        onChange(newVal);
        requestAnimationFrame(() => { ta.selectionStart = start - diff; ta.selectionEnd = end - diff; });
      } else {
        const newVal = val.slice(0, start) + "  " + val.slice(end);
        onChange(newVal);
        requestAnimationFrame(() => { ta.selectionStart = start + 2; ta.selectionEnd = start + 2; });
      }
    }
  }, [onChange]);

  // sync scroll between textarea and line numbers
  const handleScroll = useCallback(() => {
    if (lineRef.current && ref.current) {
      lineRef.current.scrollTop = ref.current.scrollTop;
    }
  }, []);

  useEffect(() => {
    const ta = ref.current;
    if (!ta) return;
    ta.addEventListener("scroll", handleScroll, { passive: true });
    return () => ta.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
    <div className={`relative rounded-lg border border-gray-200 bg-gray-50 overflow-hidden font-mono text-[12px] leading-[1.6] ${className ?? ""}`}>
      {/* Line numbers */}
      <div ref={lineRef} className="absolute left-0 top-0 bottom-0 w-8 overflow-hidden border-r border-gray-200 bg-gray-100 select-none pt-2 pointer-events-none" aria-hidden>
        {Array.from({ length: lineCount }, (_, i) => (
          <div key={i} className="px-1 text-right text-gray-300 tabular-nums" style={{ height: "1.6em", fontSize: "12px" }}>
            {i + 1}
          </div>
        ))}
      </div>

      {/* Textarea */}
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={lineCount}
        spellCheck={false}
        className="w-full resize-none bg-transparent outline-none text-gray-700 pl-10 pr-3 py-2 font-mono"
        style={{ fontSize: "12px", lineHeight: "1.6", tabSize: 2 }}
      />
    </div>
  );
}
