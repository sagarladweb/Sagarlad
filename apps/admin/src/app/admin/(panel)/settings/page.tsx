import { auth } from "@/lib/auth";
import { SettingsTabs } from "@/components/admin/SettingsTabs";

export const metadata = { title: "Settings · Sagar Lad Admin" };
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await auth();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your profile, sign-in credentials and security options.
        </p>
      </header>
      <SettingsTabs
        session={{
          name: session?.user?.name ?? null,
          email: session?.user?.email ?? null,
          image: session?.user?.image ?? null,
        }}
      />
    </div>
  );
}
