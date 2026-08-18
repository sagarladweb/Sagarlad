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
} from "lucide-react";
import { auth } from "@/lib/auth";
import { SignOutButton } from "@/components/admin/SignOutButton";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { ToastContainer } from "@/components/admin/Toast";
import { ConfirmContainer } from "@/components/admin/ConfirmDialog";
import { OfflineSync } from "@/components/admin/OfflineSync";
import { PHASE_1 } from "@/lib/phase";

export const dynamic = "force-dynamic";

const nav = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard, phase: 1 },
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
      <AdminSidebar
        nav={nav.map(({ label, href }) => ({ label, href }))}
        user={{ name: session.user.name, email: session.user.email, image: session.user.image }}
      />

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 inset-x-0 z-40 bg-card/95 backdrop-blur border-b border-border flex items-center justify-between px-4 h-14 shadow-sm">
        <span className="font-display font-bold text-base">Sagar Lad Admin</span>
        <div className="flex items-center gap-2">
          <Link href="/" className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground" aria-label="View site">
            <ExternalLink className="w-4 h-4" />
          </Link>
          <SignOutButton />
        </div>
      </div>

      <main className="flex-1 min-w-0 mt-14 md:mt-0 pb-24 md:pb-8">
        <div className="px-4 sm:px-8 py-6 sm:py-8 max-w-7xl mx-auto">{children}</div>
      </main>

      {/* Mobile bottom nav */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-card/95 backdrop-blur border-t border-border flex items-center gap-1 px-3 py-2 overflow-x-auto no-scrollbar scroll-smooth shadow-lg"
        aria-label="Admin mobile navigation"
      >
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="relative flex shrink-0 flex-col items-center justify-center gap-1 min-w-[64px] px-2 py-1.5 rounded-xl text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
          >
            <item.icon className="w-5 h-5 shrink-0" />
            <span className="whitespace-nowrap text-center leading-none text-[10px]">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}