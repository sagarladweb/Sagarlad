import { NewsletterManager } from "@/components/admin/NewsletterManager";
import { assertPhase2 } from "@/lib/phase";
import { getNewsletterInsertItems } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function NewsletterPage() {
  assertPhase2();
  const insert = await getNewsletterInsertItems();
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold">Newsletter</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Compose a broadcast. It&apos;s queued and delivered within Brevo&apos;s
          300/day free limit — overflow goes out automatically on later days.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <BrandKitCard />
        <div className="sm:col-span-2 rounded-2xl border border-border bg-card p-5">
          <h2 className="font-display text-sm font-bold">Sending rules</h2>
          <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
            <li>• One idea per letter. Short paragraphs, blank line between them.</li>
            <li>• Use the live preview — check both desktop and mobile before sending.</li>
            <li>• Send a test to your own inbox first; only broadcast once it looks right.</li>
            <li>• Preheader (the inbox snippet) is set automatically from your opening unless you write one.</li>
          </ul>
        </div>
      </div>

      <NewsletterManager insert={insert} />
    </div>
  );
}

function BrandKitCard() {
  const swatches = [
    { name: "Accent", hex: "#ffd51d", note: "Buttons, highlights" },
    { name: "Ink", hex: "#111110", note: "Headings, body" },
    { name: "Deep blue", hex: "#0d21a1", note: "Links on site" },
    { name: "Light blue", hex: "#3f88c5", note: "Supporting info" },
  ];
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h2 className="font-display text-sm font-bold">Brand kit</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        The email templates already apply these — keep to them for consistency.
      </p>
      <div className="mt-4 space-y-3">
        {swatches.map((s) => (
          <div key={s.name} className="flex items-center gap-3">
            <span
              className="h-6 w-6 shrink-0 rounded-full border border-black/10"
              style={{ background: s.hex }}
            />
            <div className="min-w-0">
              <p className="text-xs font-semibold">{s.name}</p>
              <p className="text-[10px] text-muted-foreground">
                {s.hex} · {s.note}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}