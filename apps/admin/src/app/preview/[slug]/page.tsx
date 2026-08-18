import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPostBySlug } from "@/lib/content";
import { requireAdmin } from "@/lib/requireAdmin";
import { PostArticle } from "@/components/blog/PostArticle";
import { ReadingProgress } from "@/components/blog/ReadingProgress";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

type Props = { params: Promise<{ slug: string }> };

// Renders a post exactly as the live site does — full site frame, real
// styles, real client scripts — even when it's still a draft. Admin-only and
// force-dynamic so the preview always reflects the latest saved content.
export default async function PreviewPage({ params }: Props) {
  const session = await requireAdmin();
  if (!session) notFound();

  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  return (
    <div className="min-h-screen bg-background">
      <ReadingProgress />
      <PostArticle post={post} showComments={false} />
    </div>
  );
}
