import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/db";
import { PostForm } from "@/components/admin/PostForm";

export const dynamic = "force-dynamic";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [post, categories] = await Promise.all([
    prisma.post.findUnique({ where: { slug } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!post) notFound();

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-3">
        <Link
          href="/admin/posts"
          className="p-2 rounded-full border border-border hover:bg-muted transition-colors"
          aria-label="Back to posts"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="font-display text-2xl font-bold">Edit post</h1>
          <p className="mt-1 text-sm text-muted-foreground">{post.title}</p>
        </div>
      </header>
      <PostForm
        categories={categories}
        initial={{
          id: post.id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt ?? "",
          content: post.content,
          coverImage: post.coverImage ?? "",
          categoryId: post.categoryId,
          featured: post.featured,
          published: post.published,
          scheduledAt: post.scheduledAt?.toISOString() ?? null,
        }}
      />
    </div>
  );
}