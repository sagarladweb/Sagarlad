"use client";

import { useMemo, useState } from "react";
import { Link2, Check, MessageCircle } from "lucide-react";

// Inline share strip for blog posts. Uses the browser URL so it works in the
// admin preview too (the live site resolves the canonical URL from its own
// origin). Each button is a plain anchor to the native share intent.
export function ShareButtons({
  title,
  slug,
  url,
}: {
  title: string;
  slug: string;
  url: string;
}) {
  const [copied, setCopied] = useState(false);

  const hrefs = useMemo(() => {
    const shareUrl = typeof window !== "undefined" ? window.location.href : url;
    const text = `${title} — from Sagar Lad`;
    return {
      x: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${text} ${shareUrl}`)}`,
      email: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(shareUrl)}`,
    };
  }, [title, url]);

  async function copyLink() {
    const shareUrl = typeof window !== "undefined" ? window.location.href : url;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard blocked — nothing we can do about it here.
    }
  }

  const iconBtn =
    "inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-brand-light/50 hover:text-brand";

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card px-5 py-3">
      <p className="text-sm font-semibold">Share this article</p>
      <div className="flex items-center gap-2">
        <a
          href={hrefs.x}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share on X (Twitter)"
          title="Share on X"
          className={iconBtn}
        >
          <XIcon />
        </a>
        <a
          href={hrefs.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share on LinkedIn"
          title="Share on LinkedIn"
          className={iconBtn}
        >
          <LinkedInIcon />
        </a>
        <a
          href={hrefs.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share on WhatsApp"
          title="Share on WhatsApp"
          className={iconBtn}
        >
          <MessageCircle className="h-4 w-4" />
        </a>
        <a
          href={hrefs.email}
          aria-label="Share by email"
          title="Share by email"
          className={iconBtn}
        >
          <MailOutline />
        </a>
        <button
          type="button"
          onClick={copyLink}
          aria-label="Copy link"
          title="Copy link"
          className={`${iconBtn} ${copied ? "border-green-500 text-green-600" : ""}`}
        >
          {copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
        </button>
      </div>
      <span className="hidden text-xs text-muted-foreground sm:block">
        /blog/{slug}
      </span>
    </div>
  );
}

function MailOutline() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124zM7.119 20.452H3.555V9h3.564v11.452z" />
    </svg>
  );
}