"use client";

import { useCallback, useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import {
  NewsletterComposer,
  type InsertItem,
} from "@/components/admin/NewsletterComposer";
import type { NewsletterContent } from "@/lib/newsletterTemplates";

type Props = {
  subscriberCount: number;
  seed?: { subject: string; content: NewsletterContent; draftId?: string } | null;
  insert?: { posts: InsertItem[]; videos: InsertItem[]; books: InsertItem[]; read: InsertItem[]; ebooks: InsertItem[]; quotes: InsertItem[] };
  dbQuotes?: { id: string; text: string; tag: string | null }[];
  dbSocials?: { id: string; key: string; label: string; href: string; handle: string | null; color: string | null; logoUrl?: string | null }[];
};

const LS_KEY = "nl_composer_autosave";
const dirtyRef = { current: false };

type SavedState = { subject: string; content: NewsletterContent; selectedLayout: string | null; draftId: string | null; savedAt: number };

function readLocalSave(): SavedState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.content) return null;
    return parsed;
  } catch { return null; }
}

export function NewsletterComposeClient({ subscriberCount, seed, insert, dbQuotes, dbSocials }: Props) {
  const router = useRouter();
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [recoverOpen, setRecoverOpen] = useState(false);
  const [recovered, setRecovered] = useState<SavedState | null>(null);
  const pendingHref = useRef<string | null>(null);
  const pendingAction = useRef<"leave" | "save-leave" | null>(null);

  const markDirty = useCallback((dirty: boolean) => {
    dirtyRef.current = dirty;
  }, []);

  // Check for local save on mount
  useEffect(() => {
    if (seed) return; // Don't show recovery if editing existing draft
    const saved = readLocalSave();
    if (saved && (saved.content.sections.length > 0 || saved.content.greeting || saved.content.intro)) {
      const age = Date.now() - saved.savedAt;
      const mins = Math.floor(age / 60000);
      const timeStr = mins < 1 ? "just now" : mins < 60 ? `${mins}m ago` : `${Math.floor(mins / 60)}h ago`;
      setRecovered(saved);
      setRecoverOpen(true);
    }
  }, [seed]);

  function handleRecoverConfirm() {
    if (recovered) {
      // Pass recovered state to composer via a custom event
      window.dispatchEvent(new CustomEvent("nl_recover", { detail: recovered }));
    }
    setRecoverOpen(false);
    setRecovered(null);
  }

  function handleRecoverDiscard() {
    try { localStorage.removeItem(LS_KEY); } catch { /* ignore */ }
    setRecoverOpen(false);
    setRecovered(null);
  }

  function interceptNavigation(href: string) {
    if (dirtyRef.current) {
      pendingHref.current = href;
      pendingAction.current = "leave";
      setLeaveOpen(true);
      return;
    }
    router.push(href);
  }

  function handleLeaveConfirm() {
    dirtyRef.current = false;
    if (pendingHref.current) {
      router.push(pendingHref.current);
      pendingHref.current = null;
    }
    setLeaveOpen(false);
  }

  function handleSaveAndLeave() {
    // Save to localStorage then navigate
    try {
      (window as any).__nlComposerSave?.();
    } catch { /* ignore */ }
    dirtyRef.current = false;
    if (pendingHref.current) {
      router.push(pendingHref.current);
      pendingHref.current = null;
    }
    setLeaveOpen(false);
  }

  function handleLeaveCancel() {
    pendingHref.current = null;
    pendingAction.current = null;
    setLeaveOpen(false);
  }

  // SSR-safe: only access window inside useEffect
  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (dirtyRef.current) {
        // Auto-save to localStorage before unload
        try { (window as any).__nlComposerSave?.(); } catch { /* ignore */ }
        e.preventDefault();
        e.returnValue = "";
      }
    };
    const onPopState = () => {
      if (dirtyRef.current) {
        interceptNavigation("/admin/newsletter");
      }
    };
    const onDocClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || !href.startsWith("/") || anchor.hasAttribute("download") || anchor.target === "_blank") return;
      if (dirtyRef.current) {
        e.preventDefault();
        interceptNavigation(href);
      }
    };

    window.addEventListener("beforeunload", onBeforeUnload, { capture: true });
    window.addEventListener("popstate", onPopState, { capture: true });
    document.addEventListener("click", onDocClick, { capture: true });
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload, { capture: true });
      window.removeEventListener("popstate", onPopState, { capture: true });
      document.removeEventListener("click", onDocClick, { capture: true });
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const recoveredTime = recovered ? (() => {
    const age = Date.now() - recovered.savedAt;
    const mins = Math.floor(age / 60000);
    return mins < 1 ? "just now" : mins < 60 ? `${mins} minutes ago` : `${Math.floor(mins / 60)} hours ago`;
  })() : "";

  return (
    <>
      <div className="h-full min-h-0 flex flex-col overflow-hidden">
        <NewsletterComposer
          subscriberCount={subscriberCount}
          onSent={() => { try { (window as any).__nlComposerClear?.(); } catch {} interceptNavigation("/admin/newsletter"); }}
          onBack={() => interceptNavigation("/admin/newsletter")}
          onDirtyChange={markDirty}
          seed={seed}
          insert={insert}
          dbQuotes={dbQuotes}
          dbSocials={dbSocials}
        />
      </div>

      {/* Recovery dialog */}
      <Modal
        open={recoverOpen}
        title="Recover unsaved work?"
        onClose={handleRecoverDiscard}
        footer={
          <div className="flex justify-end gap-2">
            <button type="button" onClick={handleRecoverDiscard}
              className="rounded-full border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
              Start fresh
            </button>
            <button type="button" onClick={handleRecoverConfirm}
              className="rounded-full bg-accent text-accent-foreground px-4 py-2 text-sm font-semibold hover:opacity-90">
              Recover draft
            </button>
          </div>
        }
      >
        <p className="text-sm text-muted-foreground">
          You have an unsaved newsletter from <strong>{recoveredTime}</strong>.
          {recovered?.subject ? <> Subject: <em>{recovered.subject}</em></> : null}
        </p>
      </Modal>

      {/* Leave dialog */}
      <Modal
        open={leaveOpen}
        title="Leave without saving?"
        onClose={handleLeaveCancel}
        footer={
          <div className="flex justify-end gap-2">
            <button type="button" onClick={handleLeaveCancel}
              className="rounded-full border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
              Stay
            </button>
            <button type="button" onClick={handleLeaveConfirm}
              className="rounded-full border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
              Discard changes
            </button>
            <button type="button" onClick={handleSaveAndLeave}
              className="rounded-full bg-accent text-accent-foreground px-4 py-2 text-sm font-semibold hover:opacity-90">
              Save &amp; leave
            </button>
          </div>
        }
      >
        <p className="text-sm text-muted-foreground">You have unsaved changes. What would you like to do?</p>
      </Modal>
    </>
  );
}
