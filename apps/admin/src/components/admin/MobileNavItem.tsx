"use client";

import Link from "next/link";
import { type LucideIcon } from "lucide-react";
import { CommunityBadge } from "./CommunityBadge";

export function MobileNavItem({
  href,
  label,
  icon: Icon,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
}) {
  return (
    <Link
      href={href}
      className="relative flex shrink-0 flex-col items-center justify-center gap-1 min-w-[64px] px-2 py-1.5 rounded-xl text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
    >
      <Icon className="w-5 h-5 shrink-0" />
      {href === "/admin/moderation" && <CommunityBadge className="!top-0 !right-0" />}
      <span className="whitespace-nowrap text-center leading-none text-[10px]">{label}</span>
    </Link>
  );
}
