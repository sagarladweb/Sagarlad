import { NewsletterManager } from "@/components/admin/NewsletterManager";
import { assertPhase2 } from "@/lib/phase";

export const dynamic = "force-dynamic";

export default function NewsletterPage() {
  assertPhase2();
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold">Newsletter</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Compose a broadcast. It&apos;s queued and delivered within Brevo&apos;s
          300/day free limit — overflow goes out automatically on later days.
        </p>
      </header>
      <NewsletterManager />
    </div>
  );
}
