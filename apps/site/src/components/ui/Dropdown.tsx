"use client";

import { useEffect, useRef, useState } from "react";

export type DropdownOption = { value: string; label: string };

export function Dropdown({
  id,
  label,
  value,
  onChange,
  options,
  placeholder = "Select an option",
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        (rootRef.current?.querySelector("button") as HTMLButtonElement | null)?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (open && activeIndex >= 0) {
      const el = listRef.current?.children[activeIndex] as HTMLElement | undefined;
      el?.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex, open]);

  function openList() {
    setActiveIndex(Math.max(0, options.findIndex((o) => o.value === value)));
    setOpen(true);
  }

  function choose(optionValue: string) {
    onChange(optionValue);
    setOpen(false);
  }

  function onTriggerKeyDown(e: React.KeyboardEvent) {
    if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key) && !open) {
      e.preventDefault();
      openList();
      return;
    }
    if (!open) return;
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((i) => (i + 1) % options.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((i) => (i - 1 + options.length) % options.length);
        break;
      case "Home":
        e.preventDefault();
        setActiveIndex(0);
        break;
      case "End":
        e.preventDefault();
        setActiveIndex(options.length - 1);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (activeIndex >= 0) choose(options[activeIndex].value);
        break;
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        id={id}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-listbox`}
        aria-label={label}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={onTriggerKeyDown}
        className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-left flex items-center justify-between gap-2 outline-none focus:ring-2 focus:ring-accent"
      >
        <span className={selected ? "text-foreground" : "text-muted-foreground truncate"}>
          {selected ? selected.label : placeholder}
        </span>
        <span
          aria-hidden="true"
          className={`h-2 w-2 shrink-0 border-r-2 border-b-2 border-muted-foreground transition-transform duration-200 ${
            open ? "rotate-225 -translate-y-px" : "rotate-45 translate-y-px"
          }`}
        />
      </button>

      {open && (
        <ul
          ref={listRef}
          id={`${id}-listbox`}
          role="listbox"
          aria-label={label}
          className="card-hover absolute left-0 right-0 z-30 mt-1.5 max-h-60 overflow-y-auto rounded-xl border border-border bg-card shadow-xl py-1.5"
        >
          {options.map((opt, i) => {
            const isActive = i === activeIndex;
            const isSelected = opt.value === value;
            return (
              <li key={opt.value} role="option" aria-selected={isSelected}>
                <button
                  type="button"
                  className={`flex w-full items-center justify-between gap-2 px-4 py-2.5 text-sm text-left transition-colors ${
                    isSelected
                      ? "bg-accent text-accent-foreground font-medium"
                      : isActive
                        ? "bg-muted text-foreground"
                        : "text-foreground hover:bg-muted"
                  }`}
                  onMouseEnter={() => setActiveIndex(i)}
                  onClick={() => choose(opt.value)}
                >
                  {opt.label}
                  {isSelected && (
                    <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-accent-foreground" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}