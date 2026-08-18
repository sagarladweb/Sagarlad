"use client";

import { useEffect, useState } from "react";
import { socialIcon, type IconType } from "@/lib/social-icons";
import { Globe } from "lucide-react";

type Social = {
  label: string;
  handle: string | null;
  href: string;
  icon: IconType | null;
  logoUrl: string | null;
  color: string;
};

function SocialItem({ s }: { s: Social }) {
  const Icon = s.icon;
  return (
    <a
      href={s.href}
      target="_blank"
      rel="noopener noreferrer"
      className="group inline-flex shrink-0 items-center gap-2.5 rounded-full border border-border bg-card px-4 py-2 text-sm transition-all duration-300 hover:border-brand-light/60 hover:shadow-md"
    >
      <span
        className="grid h-8 w-8 place-items-center rounded-full bg-muted/70 overflow-hidden transition-colors group-hover:bg-brand-light/15"
        style={{ color: s.color }}
      >
        {s.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={s.logoUrl} alt="" className="h-full w-full object-cover" />
        ) : Icon ? (
          <Icon className="w-4 h-4 transition-colors group-hover:text-brand" />
        ) : (
          <Globe className="w-4 h-4 transition-colors group-hover:text-brand" />
        )}
      </span>
      <span className="font-semibold">
        <span className="sm:hidden">{s.label}</span>
        <span className="hidden sm:inline">{s.handle ?? s.label}</span>
        <span className="ml-2 text-xs font-normal text-muted-foreground group-hover:text-brand transition-colors">
          <span className="sm:hidden">{s.handle}</span>
          <span className="hidden sm:inline">{s.label}</span>
        </span>
      </span>
    </a>
  );
}

export function SocialLinks() {
  const [socials, setSocials] = useState<Social[]>([]);

  useEffect(() => {
    fetch("/api/socials")
      .then((r) => r.json())
      .then((data: { socials?: { label: string; handle: string | null; href: string; icon: string; logoUrl?: string | null; color: string | null }[] }) => {
        const list: Social[] = [];
        for (const s of data.socials ?? []) {
          const meta = socialIcon(s.icon);
          list.push({
            label: s.label,
            handle: s.handle,
            href: s.href,
            icon: meta?.icon ?? null,
            logoUrl: s.logoUrl ?? null,
            color: s.color ?? meta?.color ?? "#000000",
          });
        }
        setSocials(list);
      })
      .catch(() => {});
  }, []);

  if (socials.length === 0) return null;

  // Duplicate the list so the -50% translate loops seamlessly.
  const loop = [...socials, ...socials];

  return (
    <div className="marquee-mask w-full overflow-hidden">
      <div
        className="flex w-max gap-3 animate-marquee py-2 hover:[animation-play-state:paused]"
        style={{ animationDuration: "45s" }}
      >
        {loop.map((s, i) => (
          <SocialItem key={`${s.label}-${i}`} s={s} />
        ))}
      </div>
    </div>
  );
}
