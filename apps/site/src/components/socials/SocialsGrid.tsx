"use client";

import { socialIcon } from "@/lib/social-icons";
import { Globe } from "lucide-react";

type Social = {
  key: string;
  label: string;
  handle: string | null;
  href: string;
  icon: string;
  logoUrl: string | null;
  color: string | null;
};

export function SocialsGrid({ socials }: { socials: Social[] }) {
  if (socials.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {socials.map((s) => {
        const meta = socialIcon(s.icon);
        const Icon = meta?.icon ?? Globe;
        const color = s.color ?? meta?.color ?? "#6b7280";

        return (
          <a
            key={s.key}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            className="card-hover group flex items-center gap-4 rounded-lg border border-border bg-card px-5 py-4 transition-all duration-200 hover:border-brand-light/70 hover:shadow-md"
          >
            <span
              className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-muted/70 overflow-hidden transition-colors group-hover:bg-brand-light/15"
              style={{ color }}
            >
              {s.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={s.logoUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <Icon className="w-5 h-5" />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground group-hover:text-brand transition-colors">
                {s.label}
              </p>
              {s.handle && (
                <p className="text-xs text-muted-foreground truncate">{s.handle}</p>
              )}
            </div>
            <span className="text-xs text-muted-foreground/60 group-hover:text-brand transition-colors shrink-0">
              ↗
            </span>
          </a>
        );
      })}
    </div>
  );
}
