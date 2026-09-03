"use client";

import { useState, useEffect } from "react";
import { User, ShieldCheck, LogOut, Clock, Activity, Mail } from "lucide-react";
import { ProfileForm } from "@/components/admin/ProfileForm";
import { SecuritySettings } from "@/components/admin/SecuritySettings";
import { SignOutButton } from "@/components/admin/SignOutButton";
import { SystemHealthWidget } from "@/components/admin/SystemHealthWidget";
import { NewsletterSettings } from "@/components/admin/NewsletterSettings";

type Tab = "profile" | "security" | "health" | "newsletter";
const VALID_TABS: Tab[] = ["profile", "security", "health", "newsletter"];

type SessionUser = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

const tabBtn = (active: boolean) =>
  `inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${
    active
      ? "bg-accent text-accent-foreground"
      : "text-muted-foreground hover:bg-muted hover:text-foreground"
  }`;

export function SettingsTabs({ session }: { session: SessionUser | null }) {
  const [tab, setTab] = useState<Tab>("profile");

  // Read tab from URL hash on mount
  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (VALID_TABS.includes(hash as Tab)) {
      setTab(hash as Tab);
    }
  }, []);

  // Update hash when tab changes
  const switchTab = (t: Tab) => {
    setTab(t);
    window.location.hash = t;
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Settings sections">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "profile"}
          onClick={() => switchTab("profile")}
          className={tabBtn(tab === "profile")}
        >
          <User className="h-4 w-4" /> Profile
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "security"}
          onClick={() => switchTab("security")}
          className={tabBtn(tab === "security")}
        >
          <ShieldCheck className="h-4 w-4" /> Security
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "newsletter"}
          onClick={() => switchTab("newsletter")}
          className={tabBtn(tab === "newsletter")}
        >
          <Mail className="h-4 w-4" /> Newsletter
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "health"}
          onClick={() => switchTab("health")}
          className={tabBtn(tab === "health")}
        >
          <Activity className="h-4 w-4" /> System Health
        </button>
      </div>

      {tab === "profile" ? (
        <>
          <ProfileForm
            initial={{
              name: session?.name ?? null,
              email: session?.email ?? null,
              image: session?.image ?? null,
            }}
            onOpenSecurity={() => setTab("security")}
          />

          {/* Session strip */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card card-grad px-5 py-4">
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4 shrink-0 text-accent" />
              Signed in as{" "}
              <span className="font-medium text-foreground">{session?.email}</span>
              <span aria-hidden="true" className="text-border">·</span>
              sessions last 7 days
            </p>
            <SignOutButton />
          </div>
        </>
      ) : tab === "security" ? (
        <div className="space-y-6">
          <div className="flex items-center gap-2 rounded-2xl border border-border bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
            <LogOut className="h-4 w-4 shrink-0 text-brand" />
            Signed in as <span className="font-medium text-foreground">{session?.email}</span>. Your
            session stays active for 7 days, so you won&apos;t need to sign in again on this device.
          </div>
          <SecuritySettings />
        </div>
      ) : tab === "newsletter" ? (
        <NewsletterSettings />
      ) : (
        <SystemHealthWidget />
      )}
    </div>
  );
}