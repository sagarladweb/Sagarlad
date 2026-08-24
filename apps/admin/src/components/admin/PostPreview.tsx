"use client";

import { useEffect, useRef, useState } from "react";
import { Monitor, Tablet, Smartphone, ExternalLink, Loader2 } from "lucide-react";

type DeviceId = "desktop" | "tablet" | "mobile";

const DEVICES: {
  id: DeviceId;
  label: string;
  icon: typeof Monitor;
  width: number;
}[] = [
  { id: "desktop", label: "Desktop", icon: Monitor, width: 1280 },
  { id: "tablet", label: "Tablet", icon: Tablet, width: 768 },
  { id: "mobile", label: "Mobile", icon: Smartphone, width: 390 },
];

// Loads the real post page (see /preview/[slug]) inside an iframe with
// scripts enabled, so the preview is the actual site — interactive nav,
// styles, fonts and comments. The preview route is admin-gated, so it only
// resolves while the editor is authenticated.
export function PostPreview({
  url,
  liveUrl,
}: {
  url: string;
  liveUrl: string;
}) {
  const [device, setDevice] = useState<DeviceId>("desktop");
  const [iframeHeight, setIframeHeight] = useState(1200);
  const [loaded, setLoaded] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const activeLabel = DEVICES.find((d) => d.id === device)?.label ?? "Desktop";
  const activeWidth = DEVICES.find((d) => d.id === device)?.width ?? 1280;

  // The real URL a visitor would land on. `liveUrl` may be absolute (the live
  // site) or relative (the admin origin); normalise both to one absolute URL.
  const realUrl = typeof window !== "undefined"
    ? /^https?:\/\//.test(liveUrl)
      ? liveUrl
      : `${window.location.origin}${liveUrl}`
    : liveUrl;
  const addressBarUrl = realUrl;

  function handleIframeLoad() {
    setLoaded(true);
    // Same-origin: the iframe's document is readable, so we can auto-size.
    const doc = iframeRef.current?.contentDocument;
    if (doc?.body) setIframeHeight(Math.max(doc.body.scrollHeight + 8, 400));
  }

  // Re-measure when the device width changes (reflow only, no reload).
  useEffect(() => {
    const t = setTimeout(handleIframeLoad, 60);
    return () => clearTimeout(t);
  }, [device, url]);

  // New URL → new iframe (key change) → back to the loading state.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset loading state on URL change
    setLoaded(false);
  }, [url]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-3">
        <div className="flex items-center gap-1 rounded-full bg-muted p-1">
          {DEVICES.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => setDevice(d.id)}
              aria-pressed={device === d.id}
              title={`${d.label} (${d.width}px)`}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                device === d.id
                  ? "bg-foreground text-background"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              <d.icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{d.label}</span>
              <span className="text-[10px] opacity-70">{d.width}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {activeLabel} · {activeWidth}px
          </span>
          <a
            href={liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Open live
          </a>
        </div>
      </div>

      {/* Device frame — the iframe has its own viewport, so Tailwind
          breakpoints resolve exactly like the live site at each width. */}
      <div className="overflow-auto rounded-2xl border border-border bg-muted/60 p-3 sm:p-6 shadow-inner">
        <div
          className="mx-auto overflow-hidden rounded-xl border border-border bg-background shadow-2xl transition-[width] duration-300"
          style={{ width: activeWidth, maxWidth: "100%" }}
        >
          {/* Address bar */}
          <div className="sticky top-0 z-40 flex items-center gap-2 border-b border-border bg-card/90 backdrop-blur px-4 py-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5 truncate">
              <span className="h-2 w-2 shrink-0 rounded-full bg-green-500" />
              {addressBarUrl}
            </span>
          </div>

          <div className="relative">
          <iframe
            ref={iframeRef}
            key={url}
            title="Post preview"
            src={url}
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
            onLoad={handleIframeLoad}
            className="block w-full bg-background"
            style={{ height: iframeHeight }}
          />
          {!loaded && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-muted/60 backdrop-blur-[1px]">
              <Loader2 className="h-6 w-6 animate-spin text-accent" />
              <p className="text-sm font-medium text-muted-foreground">
                Loading preview…
              </p>
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}

// Shown while a brand-new post is being saved as a draft so a real preview
// URL exists to load.
export function PreviewPending() {
  return (
    <div className="grid min-h-[60vh] place-items-center text-muted-foreground">
      <div className="flex items-center gap-2 text-sm">
        <Loader2 className="w-4 h-4 animate-spin" />
        Saving draft… one moment
      </div>
    </div>
  );
}
