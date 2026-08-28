"use client";
import Link from "next/link";

import { useEffect, useState } from "react";
import {
  ChevronDown,
} from "lucide-react";
import { SOCIAL_ICONS, type IconType } from "@/lib/social-icons";
import { SiteLogo } from "@/components/SiteLogo";

const footerCols: {
  title: string;
  links: {
    label: string;
    href: string;
    external?: boolean;
  }[];
}[] = [
  {
    title: "Explore",
    links: [
      { label: "Blogs", href: "/blog" },
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Books",
    links: [
      { label: "Books", href: "/books" },
      { label: "Books I read", href: "/books-read" },
    ],
  },
  {
    title: "More",
    links: [
      { label: "Mentorship", href: "https://topmate.io/sagar_lad", external: true },
      { label: "Newsletter", href: "/newsletter" },
      { label: "Speaking", href: "/speaking" },
    ],
  },
];

const LEGAL_LINKS = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];

/* Preferred social order for footer icons */
const FOOTER_SOCIAL_KEYS = ["instagram", "youtube", "linkedin", "twitter"] as const;

function sortSocials(
  socials: { label: string; href: string; icon: IconType | null; logoUrl: string | null }[]
) {
  const preferred: typeof socials = [];
  const rest: typeof socials = [];
  for (const s of socials) {
    const key = s.label.toLowerCase();
    const match = FOOTER_SOCIAL_KEYS.findIndex((m) => key.includes(m));
    if (match !== -1) {
      preferred[match] = s;
    } else {
      rest.push(s);
    }
  }
  return [...preferred.filter(Boolean), ...rest];
}

export function Footer() {
  const [socials, setSocials] = useState<
    { label: string; href: string; icon: IconType | null; logoUrl: string | null }[]
  >([]);
  const [openCol, setOpenCol] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/socials")
      .then((r) => r.json())
      .then((data) => {
        const all = (data.socials ?? [])
          .map((s: { label: string; href: string; icon: string; logoUrl?: string | null }) => ({
            label: s.label,
            href: s.href,
            logoUrl: s.logoUrl ?? null,
            icon: SOCIAL_ICONS[s.icon]?.icon ?? null,
          }));
        setSocials(all);
      })
      .catch(() => {});
  }, []);

  const toggleCol = (title: string) => {
    setOpenCol((prev) => (prev === title ? null : title));
  };

  const sortedSocials = sortSocials(socials);
  /* Desktop shows only 3 (IG/YT/LI); mobile shows 4 (IG/YT/LI/X) */
  const desktopSocials = sortedSocials.filter((s) =>
    ["instagram", "youtube", "linkedin"].some((k) => s.label.toLowerCase().includes(k))
  );

  return (
    <footer className="border-t border-foreground/10 bg-foreground text-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Logo + tagline + socials */}
          <div className="md:col-span-4">
            <Link href="/" className="inline-flex items-center gap-2">
              <SiteLogo light className="h-12 w-auto" />
            </Link>
            <p className="mt-4 text-sm text-background/70 max-w-xs leading-relaxed">
              Author · Investor · Public Speaker. Building awareness,
              one conversation at a time.
            </p>

            {/* Desktop social icons — 3 static */}
            <div className="mt-5 hidden md:flex items-center gap-2 flex-wrap">
              {desktopSocials.map((s) =>
                s.logoUrl || s.icon ? (
                  <a
                    key={s.label}
                    href={s.href}
                    aria-label={s.label}
                    className="p-2.5 rounded-full border border-background/25 text-background/70 hover:bg-accent hover:text-accent-foreground hover:border-accent transition-colors overflow-hidden"
                  >
                    {s.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={s.logoUrl} alt="" className="h-4 w-4 object-contain" />
                    ) : s.icon ? (
                      <s.icon className="w-4 h-4" />
                    ) : null}
                  </a>
                ) : null
              )}
            </div>
          </div>

          {/* Link columns — accordion on mobile, grid on desktop */}
          <div className="md:col-span-8">
            {/* Mobile: accordion */}
            <div className="md:hidden divide-y divide-background/15">
              {footerCols.map((col) => {
                const isOpen = openCol === col.title;
                return (
                  <div key={col.title}>
                    <button
                      type="button"
                      onClick={() => toggleCol(col.title)}
                      className="flex w-full items-center justify-between py-3 text-left"
                    >
                      <span className="text-xs font-semibold uppercase tracking-wider text-background/50">
                        {col.title}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-background/50 transition-transform duration-200 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    <div
                      className={`overflow-hidden transition-all duration-200 ${
                        isOpen ? "max-h-96 pb-3" : "max-h-0"
                      }`}
                    >
                      <ul className="space-y-2 pl-1">
                        {col.links.map((l) => (
                          <li key={l.href + l.label}>
                            <Link
                              href={l.href}
                              {...(l.external
                                ? { target: "_blank", rel: "noopener noreferrer" }
                                : {})}
                              className="inline-flex items-center gap-2 text-sm text-background/70 hover:text-background transition-colors"
                            >
                              {l.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop: 3-column grid — icon + text labels */}
            <div className="hidden md:grid grid-cols-3 gap-6">
              {footerCols.map((col) => (
                <div key={col.title}>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-background/50 mb-3">
                    {col.title}
                  </h4>
                  <ul className="space-y-2.5">
                    {col.links.map((l) => (
                      <li key={l.href + l.label}>
                        <Link
                          href={l.href}
                          {...(l.external
                            ? { target: "_blank", rel: "noopener noreferrer" }
                            : {})}
                          className="inline-flex items-center gap-2 text-sm text-background/70 hover:text-background transition-colors"
                        >
                          {l.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile/Tablet social icons — static, 4 icons (IG/YT/LI/X) */}
        {sortedSocials.length > 0 && (
          <div className="mt-8 md:hidden flex items-center justify-center gap-4">
            {sortedSocials.map((s) =>
              s.logoUrl || s.icon ? (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="p-2.5 rounded-full border border-background/25 text-background/70 hover:bg-accent hover:text-accent-foreground hover:border-accent transition-colors overflow-hidden"
                >
                  {s.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={s.logoUrl} alt="" className="h-4 w-4 object-contain" />
                  ) : s.icon ? (
                    <s.icon className="w-4 h-4" />
                  ) : null}
                </a>
              ) : null
            )}
          </div>
        )}

        {/* Legal links — always visible, outside collapsible */}
        <div className="mt-8 flex items-center justify-center gap-4 text-xs text-background/50">
          {LEGAL_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="hover:text-background transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-6 pt-6 border-t border-background/15 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-background/60">
          <p>© {new Date().getFullYear()} Sagar Lad. All rights reserved.</p>
          <p className="flex items-center gap-1">
            MindUp.RiseWithin.
            <span className="text-accent">✦</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
