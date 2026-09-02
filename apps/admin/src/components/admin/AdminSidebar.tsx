"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  FileText,
  Mail,
  Share2,
  MessagesSquare,
  ExternalLink,
  LogOut,
  Layers,
  Settings,
  Megaphone,
  type LucideIcon,
} from "lucide-react";
import { CommunityBadge } from "./CommunityBadge";

const ICONS: Record<string, LucideIcon> = {
  "/admin/dashboard": LayoutDashboard,
  "/admin/posts": FileText,
  "/admin/content": Layers,
  "/admin/announcement": Megaphone,
  "/admin/newsletter": Mail,
  "/admin/social": Share2,
  "/admin/moderation": MessagesSquare,
  "/admin/settings": Settings,
};

type NavItem = { label: string; href: string };

const labelCls =
  "whitespace-nowrap overflow-hidden max-w-0 opacity-0 translate-x-1 group-hover:max-w-56 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200";

function Avatar({
  src,
  name,
  size = "md",
}: {
  src?: string | null;
  name?: string | null;
  size?: "sm" | "md";
}) {
  const cls =
    size === "md"
      ? "w-9 h-9"
      : "w-8 h-8";
  return (
    <span className={`${cls} shrink-0 aspect-square overflow-hidden rounded-full ring-2 ring-border bg-muted grid place-items-center`}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="w-full h-full object-cover" />
      ) : (
        <span className="font-display font-bold text-sm text-muted-foreground">
          {(name || "A").charAt(0).toUpperCase()}
        </span>
      )}
    </span>
  );
}

export function AdminSidebar({
  nav,
  user,
}: {
  nav: NavItem[];
  user: { name?: string | null; email?: string | null; image?: string | null };
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isActive = (href: string) =>
    href === "/admin/dashboard"
      ? pathname === href
      : pathname === href || pathname.startsWith(href + "/");

  return (
    <aside
      className="group hidden md:flex sticky top-0 h-screen w-[68px] hover:w-60 shrink-0 flex-col border-r border-border bg-card overflow-hidden transition-[width] duration-300 ease-out shadow-sm z-30"
      style={{ borderColor: "color-mix(in srgb, var(--brand) 15%, var(--border))" }}
      aria-label="Admin sidebar"
    >
      <div className="px-3.5 py-4 border-b border-border flex items-center gap-3.5">
        <Link
          href="/admin/dashboard"
          className="flex items-center gap-3.5 min-w-0"
          title="Sagar Lad Admin"
        >
          <Avatar src={user.image} name={user.name} size="md" />
          <span className={`${labelCls} font-display font-bold text-base`}>
            Sagar Lad Admin
          </span>
        </Link>
      </div>

      <nav
        className="flex-1 p-2.5 space-y-1 overflow-y-auto no-scrollbar"
        aria-label="Admin navigation"
      >
        {nav.map((item) => {
          const active = isActive(item.href);
          const Icon = ICONS[item.href] ?? FileText;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={`relative flex items-center gap-3.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-accent/10 text-accent font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
              }`}
              aria-current={active ? "page" : undefined}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-full bg-accent" />
              )}
              <Icon className="w-5 h-5 shrink-0" />
              {item.href === "/admin/moderation" && <CommunityBadge />}
              <span className={labelCls}>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-2.5 border-t border-border space-y-1">
        <Link
          href="https://www.sagarlad.com"
          target="_blank"
          title="View site"
          className="flex items-center gap-3.5 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
        >
          <ExternalLink className="w-5 h-5 shrink-0" />
          <span className={labelCls}>sagarlad.com</span>
        </Link>

        <button
          type="button"
          onClick={async () => {
            await signOut({ redirect: false });
            router.push("/admin");
            router.refresh();
          }}
          title="Sign out"
          className="w-full flex items-center gap-3.5 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-red-600 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          <span className={`${labelCls} truncate text-left`}>
            Sign out
          </span>
        </button>
      </div>
    </aside>
  );
}
