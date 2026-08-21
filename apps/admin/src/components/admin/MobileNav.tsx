"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  FileText,
  MessagesSquare,
  Settings,
  Share2,
  Mail,
  Layers,
  type LucideIcon,
} from "lucide-react";
import { CommunityBadge } from "./CommunityBadge";

const icons: Record<string, LucideIcon> = {
  "/admin/dashboard": LayoutDashboard,
  "/admin/posts": FileText,
  "/admin/content": Layers,
  "/admin/newsletter": Mail,
  "/admin/social": Share2,
  "/admin/moderation": MessagesSquare,
  "/admin/settings": Settings,
};

export function MobileNav({
  items,
}: {
  items: { label: string; href: string }[];
}) {
  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-card/95 backdrop-blur border-t border-border flex items-center gap-1 px-3 py-2 overflow-x-auto no-scrollbar scroll-smooth shadow-lg"
      aria-label="Admin mobile navigation"
    >
      {items.map((item) => {
        const Icon = icons[item.href];
        return (
          <Link
            key={item.href}
            href={item.href}
            className="relative flex shrink-0 flex-col items-center justify-center gap-1 min-w-[64px] px-2 py-1.5 rounded-xl text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
          >
            {Icon && <Icon className="w-5 h-5 shrink-0" />}
            {item.href === "/admin/moderation" && (
              <CommunityBadge className="!top-0 !right-0" />
            )}
            <span className="whitespace-nowrap text-center leading-none text-[10px]">
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
