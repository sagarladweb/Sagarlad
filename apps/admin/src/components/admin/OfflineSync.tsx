"use client";

import { useCallback, useEffect, useState } from "react";
import { WifiOff, RefreshCw, Loader2, CheckCircle2, CloudUpload } from "lucide-react";
import { getQueue, syncQueue, QUEUE_EVENT } from "@/lib/offline-queue";

export function OfflineSync() {
  const [online, setOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
  const [pending, setPending] = useState(() =>
    typeof window !== "undefined" ? getQueue().length : 0
  );
  const [syncing, setSyncing] = useState(false);
  const [justSynced, setJustSynced] = useState(false);

  const refresh = useCallback(() => setPending(getQueue().length), []);

  const sync = useCallback(async () => {
    if (syncing) return;
    setSyncing(true);
    try {
      const { synced } = await syncQueue();
      if (synced > 0) {
        setJustSynced(true);
        setTimeout(() => setJustSynced(false), 5000);
      }
    } finally {
      setSyncing(false);
      refresh();
    }
  }, [syncing, refresh]);

  useEffect(() => {
    const onOnline = () => {
      setOnline(true);
      void sync();
    };
    const onOffline = () => setOnline(false);
    const onQueue = () => refresh();
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    window.addEventListener(QUEUE_EVENT, onQueue);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      window.removeEventListener(QUEUE_EVENT, onQueue);
    };
  }, [sync, refresh]);

  if (online && pending === 0 && !justSynced) return null;

  return (
    <div className="fixed inset-x-0 bottom-20 z-50 px-4 md:bottom-5 md:px-6">
      <div
        role="status"
        className={`mx-auto flex max-w-xl items-center gap-3 rounded-2xl border px-4 py-3 shadow-lg backdrop-blur ${
          justSynced
            ? "border-emerald-300 bg-emerald-50/95"
            : "border-border bg-card/95"
        }`}
      >
        {syncing ? (
          <Loader2 className="h-5 w-5 shrink-0 animate-spin text-brand" />
        ) : justSynced ? (
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
        ) : online ? (
          <CloudUpload className="h-5 w-5 shrink-0 text-brand" />
        ) : (
          <WifiOff className="h-5 w-5 shrink-0 text-amber-600" />
        )}

        <div className="min-w-0 flex-1 text-sm">
          {syncing ? (
            <p className="font-medium">Syncing your changes…</p>
          ) : justSynced ? (
            <p className="font-medium text-emerald-700">All changes synced to the website.</p>
          ) : online ? (
            <p className="font-medium">
              {pending} {pending === 1 ? "change" : "changes"} waiting to sync.
            </p>
          ) : (
            <p className="font-medium">
              You&apos;re offline — changes are saved on this device and will sync automatically.
            </p>
          )}
        </div>

        {online && !syncing && pending > 0 && (
          <button
            type="button"
            onClick={() => void sync()}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-xs font-semibold text-accent-foreground transition-opacity hover:opacity-90"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Sync now
          </button>
        )}
      </div>
    </div>
  );
}
