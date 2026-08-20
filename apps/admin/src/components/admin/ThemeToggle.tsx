"use client";

import { useEffect } from "react";

const STORAGE_KEY = "admin-theme";

function apply(theme: "dark" | "light") {
  document.documentElement.classList.toggle("dark", theme === "dark");
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // private mode — just apply for this session
  }
}

export function ThemeToggle() {
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      apply(saved === "dark" ? "dark" : "light");
    } catch {
      // no saved preference — stay with the default
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key.toLowerCase() !== "t" || e.ctrlKey || e.metaKey || e.altKey) return;
      const el = e.target as HTMLElement | null;
      const typing =
        el &&
        (el.tagName === "INPUT" ||
          el.tagName === "TEXTAREA" ||
          el.tagName === "SELECT" ||
          el.isContentEditable);
      if (typing) return;
      e.preventDefault();
      apply(document.documentElement.classList.contains("dark") ? "light" : "dark");
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return null;
}