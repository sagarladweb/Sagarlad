import { SocialManager } from "@/components/admin/SocialManager";
import { assertPhase2 } from "@/lib/phase";

export const dynamic = "force-dynamic";

export default function SocialsPage() {
  assertPhase2();
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold">Social Links</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Edit links here and they&apos;ll update across the whole site — footer,
          home &quot;Find Sagar On&quot; section and the homepage structured data.
        </p>
      </header>
      <SocialManager />
    </div>
  );
}