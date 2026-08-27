"use client";
import Link from "next/link";

import { useEffect, useState } from "react";
import {
  ChevronDown,
  BookOpen,
  User,
  Mail,
  BookMarked,
  Users,
  Mic,
  Share2,
} from "lucide-react";
import { SOCIAL_ICONS, type IconType } from "@/lib/social-icons";
import { SiteLogo } from "@/components/SiteLogo";

const footerCols: {
  title: string;
  links: {
    label: string;
    href: string;
    external?: boolean;
    icon: React.ComponentType<{ className?: string }>;
  }[];
}[] = [
  {
    title: "Explore",
    links: [
      { label: "Blogs", href: "/blog", icon: BookOpen },
      { label: "About", href: "/about", icon: User },
      { label: "Contact", href: "/contact", icon: Mail },
    ],
  },
  {
    title: "Books",
    links: [
      { label: "Books", href: "/books", icon: BookOpen },
      { label: "Books I read", href: "/books-read", icon: BookMarked },
    ],
  },
  {
    title: "More",
    links: [
      { label: "Mentorship", href: "https://topmate.io/sagar_lad", external: true, icon: Users },
      { label: "Newsletter", href: "/newsletter", icon: Mail },
      { label: "Speaking", href: "/speaking", icon: Mic },
      { label: "Socials", href: "/socials", icon: Share2 },
    ],
  },
];

const LEGAL_LINKS = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];

/* Marquee order: Instagram, YouTube, LinkedIn first, then the rest */
const MARQUEE_ORDER = ["instagram", "youtube", "linkedin"];

function sortSocialsForMarquee(
  socials: { label: string; href: string; icon: IconType | null; logoUrl: string | null }[]
) {
  const preferred: typeof socials = [];
  const rest: typeof socials = [];
  for (const s of socials) {
    const key = s.label.toLowerCase();
    const match = MARQUEE_ORDER.findIndex((m) => key.includes(m));
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

  const sortedSocials = sortSocialsForMarquee(socials);
  const marqueeItems = [...sortedSocials, ...sortedSocials];

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

            {/* Desktop social icons */}
            <div className="mt-5 hidden md:flex items-center gap-2 flex-wrap">
              {sortedSocials.map((s) =>
                s.logoUrl || s.icon ? (
                  <a
                    key={s.label}
                    href={s.href}
                    aria-label={s.label}
                    className="p-2.5 rounded-full border border-background/25 hover:bg-accent hover:text-accent-foreground hover:border-accent transition-colors overflow-hidden"
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
                      <div className="flex items-center gap-3 pl-1">
                        {col.links.map((l) => (
                          <Link
                            key={l.href + l.label}
                            href={l.href}
                            {...(l.external
                              ? { target: "_blank", rel: "noopener noreferrer" }
                              : {})}
                            aria-label={l.label}
                            className="p-2.5 rounded-full border border-background/25 hover:bg-accent hover:text-accent-foreground hover:border-accent transition-colors"
                          >
                            <l.icon className="w-4 h-4" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop: 3-column grid — icons only */}
            <div className="hidden md:grid grid-cols-3 gap-6">
              {footerCols.map((col) => (
                <div key={col.title}>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-background/50 mb-3">
                    {col.title}
                  </h4>
                  <div className="flex items-center gap-3">
                    {col.links.map((l) => (
                      <Link
                        key={l.href + l.label}
                        href={l.href}
                        {...(l.external
                          ? { target: "_blank", rel: "noopener noreferrer" }
                          : {})}
                        aria-label={l.label}
                        className="p-2.5 rounded-full border border-background/25 hover:bg-accent hover:text-accent-foreground hover:border-accent transition-colors"
                      >
                        <l.icon className="w-4 h-4" />
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile social marquee — all socials, IG/YT/LI first */}
        {sortedSocials.length > 0 && (
          <div className="mt-8 md:hidden overflow-hidden">
            <div className="flex w-max gap-4 animate-marquee hover:[animation-play-state:paused]"
              style={{ animationDuration: "15s" }}
            >
              {marqueeItems.map((s, i) =>
                s.logoUrl || s.icon ? (
                  <a
                    key={`${s.label}-${i}`}
                    href={s.href}
                    aria-label={s.label}
                    className="p-2.5 rounded-full border border-background/25 hover:bg-accent hover:text-accent-foreground hover:border-accent transition-colors shrink-0 overflow-hidden"
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
