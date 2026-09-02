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
  ShieldOff,
  Megaphone,
  type LucideIcon,
} from "lucide-react";
import { auth, signOut } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { MobileNav } from "@/components/admin/MobileNav";
import { ToastContainer } from "@/components/admin/Toast";
import { ConfirmContainer } from "@/components/admin/ConfirmDialog";
import { PromptContainer } from "@/components/admin/ConfirmDialog";
import { OfflineSync } from "@/components/admin/OfflineSync";
import { ThemeToggle } from "@/components/admin/ThemeToggle";
import { PHASE_1 } from "@/lib/phase";

export const dynamic = "force-dynamic";

const nav: { label: string; href: string; icon: LucideIcon; phase: number }[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard, phase: 2 },
  { label: "Posts", href: "/admin/posts", icon: FileText, phase: 1 },
  { label: "Content", href: "/admin/content", icon: Layers, phase: 2 },
  { label: "Announcement", href: "/admin/announcement", icon: Megaphone, phase: 2 },
  { label: "Newsletter", href: "/admin/newsletter", icon: Mail, phase: 2 },
  { label: "Social", href: "/admin/social", icon: Share2, phase: 2 },
  { label: "Community", href: "/admin/moderation", icon: MessagesSquare, phase: 2 },
  { label: "Settings", href: "/admin/settings", icon: Settings, phase: 1 },
].filter((item) => !PHASE_1 || item.phase === 1);

async function signOutAction() {
  "use server";
  await signOut({ redirectTo: "/admin" });
}

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let session: any = null;
  let dbError = false;

  try {
    session = await auth();
  } catch (err) {
    console.warn("[admin layout] auth() failed, rendering with limited session:", (err as Error).message);
    dbError = true;
  }

  // If auth returned null AND we didn't have a DB error, it's a genuine
  // missing/expired session — show the sign-in prompt.
  // If auth returned null but we had a DB error, let the children render
  // anyway (the JWT might still be valid client-side).
  if (!session?.user && !dbError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center space-y-6">
          <span className="inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-red-50 text-red-500 mx-auto">
            <ShieldOff className="h-8 w-8" />
          </span>
          <div className="space-y-2">
            <h1 className="font-display text-2xl font-bold">Session Expired</h1>
            <p className="text-sm text-muted-foreground">
              Your admin session could not be verified. This happens when the database
              is temporarily unreachable or your session has expired.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <form action={signOutAction}>
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition-all hover:opacity-90 active:scale-[0.99]"
              >
                Sign out and sign in again
              </button>
            </form>
            <Link
              href="https://www.sagarlad.com"
              target="_blank"
              className="inline-flex items-center justify-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ExternalLink className="h-4 w-4" /> Visit sagarlad.com
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // If we hit a DB error, render with fallback user data so the admin
  // panel still loads (JWT might be valid, DB just temporarily down).
  const user = session?.user ?? { name: "Admin", email: "", image: null };

  return (
    <div className="admin-panel min-h-screen bg-background flex">
      <ToastContainer />
      <ConfirmContainer />
      <PromptContainer />
      <OfflineSync />
      <ThemeToggle />
      <AdminSidebar
        nav={nav.map(({ label, href }) => ({ label, href }))}
        user={{ name: user.name, email: user.email, image: user.image }}
      />

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 inset-x-0 z-40 bg-card/95 backdrop-blur border-b border-border flex items-center justify-between px-4 h-14 shadow-sm">
        <span className="flex items-center gap-2.5 min-w-0">
          <span className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full ring-2 ring-border bg-muted grid place-items-center">
            {user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.image} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="font-display font-bold text-sm text-muted-foreground">
                {(user.name || "A").charAt(0).toUpperCase()}
              </span>
            )}
          </span>
          <span className="font-display font-bold text-base truncate">Sagar Lad Admin</span>
        </span>
        <div className="flex items-center gap-2">
          <Link href="https://www.sagarlad.com" target="_blank" className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground" aria-label="View site">
            <ExternalLink className="w-4 h-4" />
          </Link>
          <form action={signOutAction}>
            <button type="submit" className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground" aria-label="Sign out">
              Sign out
            </button>
          </form>
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
