"use client";
import Link from "next/link";

import { useEffect, useState } from "react";
import { SOCIAL_ICONS, type IconType } from "@/lib/social-icons";
import { SiteLogo } from "@/components/SiteLogo";

const footerCols: { title: string; links: { label: string; href: string; external?: boolean }[] }[] = [
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
      { label: "Mentorship", href: "/mentorship" },
      { label: "Newsletter", href: "/newsletter" },
      { label: "Speaking", href: "/speaking" },
      { label: "Socials", href: "/socials" },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
];

const ALLOWED_NETWORKS = ["instagram", "youtube", "linkedin"];

export function Footer() {
  const [socials, setSocials] = useState<
    { label: string; href: string; icon: IconType | null; logoUrl: string | null }[]
  >([]);

  useEffect(() => {
    fetch("/api/socials")
      .then((r) => r.json())
      .then((data) => {
        const filtered = (data.socials ?? [])
          .filter((s: { icon: string; label: string }) =>
            ALLOWED_NETWORKS.includes(s.icon.toLowerCase()) ||
            ALLOWED_NETWORKS.includes(s.label.toLowerCase())
          )
          .map((s: { label: string; href: string; icon: string; logoUrl?: string | null }) => ({
            label: s.label,
            href: s.href,
            logoUrl: s.logoUrl ?? null,
            icon: SOCIAL_ICONS[s.icon]?.icon ?? null,
          }));
        setSocials(filtered);
      })
      .catch(() => {});
  }, []);

  return (
    <footer className="border-t border-foreground/10 bg-foreground text-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          <div className="md:col-span-4">
            <Link href="/" className="inline-flex items-center gap-2">
              <SiteLogo light className="h-12 w-auto" />
            </Link>
            <p className="mt-4 text-sm text-background/70 max-w-xs leading-relaxed">
              Author · Investor · Public Speaker. Building awareness,
              one conversation at a time.
            </p>
            <div className="mt-5 flex items-center gap-2 flex-wrap">
              {socials.map((s) =>
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

          <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-6">
            {footerCols.map((col) => (
              <div key={col.title}>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-background/50 mb-3">
                  {col.title}
                </h4>
                <ul className="space-y-2">
                  {col.links.map((l) => (
                    <li key={l.href + l.label}>
                      <Link
                        href={l.href}
                        {...(l.external
                          ? { target: "_blank", rel: "noopener noreferrer" }
                          : {})}
                        className="text-sm text-background/80 hover:text-background hover:underline underline-offset-4 transition-colors"
                      >
                        {l.label}
                        {l.external && (
                          <span aria-hidden="true" className="ml-1 text-[0.65em] align-middle">
                            ↗
                          </span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-background/15 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-background/60">
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
