import { redirect } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  FileText,
  MessagesSquare,
  ExternalLink,
  Settings,
  Share2,
  Mail,
  Layers,
  type LucideIcon,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { SignOutButton } from "@/components/admin/SignOutButton";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { MobileNav } from "@/components/admin/MobileNav";
import { ToastContainer } from "@/components/admin/Toast";
import { ConfirmContainer } from "@/components/admin/ConfirmDialog";
import { OfflineSync } from "@/components/admin/OfflineSync";
import { ThemeToggle } from "@/components/admin/ThemeToggle";
import { PHASE_1 } from "@/lib/phase";

export const dynamic = "force-dynamic";

const nav: { label: string; href: string; icon: LucideIcon; phase: number }[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard, phase: 2 },
  { label: "Posts", href: "/admin/posts", icon: FileText, phase: 1 },
  { label: "Content", href: "/admin/content", icon: Layers, phase: 2 },
  { label: "Newsletter", href: "/admin/newsletter", icon: Mail, phase: 2 },
  { label: "Social", href: "/admin/social", icon: Share2, phase: 2 },
  { label: "Community", href: "/admin/moderation", icon: MessagesSquare, phase: 2 },
  { label: "Settings", href: "/admin/settings", icon: Settings, phase: 1 },
].filter((item) => !PHASE_1 || item.phase === 1);

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/admin");
  }

  return (
    <div className="admin-panel min-h-screen bg-background flex">
      <ToastContainer />
      <ConfirmContainer />
      <OfflineSync />
      <ThemeToggle />
      <AdminSidebar
        nav={nav.map(({ label, href }) => ({ label, href }))}
        user={{ name: session.user.name, email: session.user.email, image: session.user.image }}
      />

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 inset-x-0 z-40 bg-card/95 backdrop-blur border-b border-border flex items-center justify-between px-4 h-14 shadow-sm">
        <span className="flex items-center gap-2.5 min-w-0">
          <span className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full ring-2 ring-border bg-muted grid place-items-center">
            {session.user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={session.user.image} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="font-display font-bold text-sm text-muted-foreground">
                {(session.user.name || "A").charAt(0).toUpperCase()}
              </span>
            )}
          </span>
          <span className="font-display font-bold text-base truncate">Sagar Lad Admin</span>
        </span>
        <div className="flex items-center gap-2">
          <Link href="https://www.sagarlad.com" target="_blank" className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground" aria-label="View site">
            <ExternalLink className="w-4 h-4" />
          </Link>
          <SignOutButton />
        </div>
      </div>

      <main className="flex-1 min-w-0 mt-14 md:mt-0 pb-24 md:pb-8">
        <div className="px-4 sm:px-8 py-6 sm:py-8 max-w-7xl mx-auto">{children}</div>
      </main>

      {/* Mobile bottom nav */}
      <MobileNav items={nav.map(({ label, href }) => ({ label, href }))} />
    </div>
  );
}