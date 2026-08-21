"use client";

import { useEffect } from "react";

const STORAGE_KEY = "admin-theme";

function isNightTime(): boolean {
  const hour = new Date().getHours();
  return hour < 6 || hour >= 18;
}

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
    // Determine initial theme: saved preference > time-based auto
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "dark" || saved === "light") {
        apply(saved);
      } else {
        apply(isNightTime() ? "dark" : "light");
      }
    } catch {
      apply(isNightTime() ? "dark" : "light");
    }

    // Check every 5 minutes and auto-switch if user hasn't manually set a preference
    const interval = setInterval(() => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (!saved) {
          apply(isNightTime() ? "dark" : "light");
        }
      } catch {
        // ignore
      }
    }, 5 * 60 * 1000);

    function onKeyDown(e: KeyboardEvent) {
      if (!e.key || e.key.toLowerCase() !== "t" || e.ctrlKey || e.metaKey || e.altKey) return;
      const el = e.target as HTMLElement | null;
      if (!el) return;
      const tag = el.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el.isContentEditable) return;
      e.preventDefault();
      apply(document.documentElement.classList.contains("dark") ? "light" : "dark");
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      clearInterval(interval);
    };
  }, []);

  return null;
}
