import { ContentHub } from "@/components/admin/ContentHub";
import { assertPhase2 } from "@/lib/phase";

export const dynamic = "force-dynamic";

export default async function ContentAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  assertPhase2();
  const { tab } = await searchParams;
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold">Content</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage topics, books, videos and the quote library from one place.
        </p>
      </header>
      <ContentHub initialTab={tab} />
    </div>
  );
}