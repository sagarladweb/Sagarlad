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
  BookOpen,
  Video,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  "/admin/dashboard": LayoutDashboard,
  "/admin/posts": FileText,
  "/admin/books": BookOpen,
  "/admin/videos": Video,
  "/admin/content": Layers,
  "/admin/newsletter": Mail,
  "/admin/social": Share2,
  "/admin/moderation": MessagesSquare,
  "/admin/settings": Settings,
};

type NavItem = { label: string; href: string };

const labelCls =
  "whitespace-nowrap opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0 transition-all duration-200";

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
      aria-label="Admin sidebar"
    >
      <div className="px-3.5 py-4 border-b border-border flex items-center gap-3.5">
        <Link
          href="/admin/dashboard"
          className="flex items-center gap-3.5"
          title="Sagar Lad Admin"
        >
          <span className="w-9 h-9 shrink-0 rounded-full bg-accent text-accent-foreground grid place-items-center font-display font-bold text-sm shadow-sm">
            S
          </span>
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
                  ? "bg-accent/10 text-accent"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
              }`}
              aria-current={active ? "page" : undefined}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span className={labelCls}>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-2.5 border-t border-border space-y-1">
        <div className="flex items-center gap-3.5 rounded-xl px-3 py-2">
          {user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.image}
              alt=""
              className="w-8 h-8 shrink-0 rounded-full object-cover ring-2 ring-border"
            />
          ) : (
            <span className="w-8 h-8 shrink-0 rounded-full bg-muted text-muted-foreground grid place-items-center font-semibold text-sm">
              {(user.name || "A").charAt(0).toUpperCase()}
            </span>
          )}
          <div className={`${labelCls} min-w-0`}>
            <p className="text-sm font-semibold truncate">{user.name || "Admin"}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        </div>

        <Link
          href="/"
          target="_blank"
          title="View site"
          className="flex items-center gap-3.5 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
        >
          <ExternalLink className="w-5 h-5 shrink-0" />
          <span className={labelCls}>View site</span>
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
            Sign out ({user.name || "Admin"})
          </span>
        </button>
      </div>
    </aside>
  );
}