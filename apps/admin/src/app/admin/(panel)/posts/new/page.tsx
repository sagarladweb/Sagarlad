import { prisma } from "@/lib/db";
import { PostForm } from "@/components/admin/PostForm";
import { getNewsletterInsertItems } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function NewPostPage() {
  const [categories, insertItems] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    getNewsletterInsertItems(),
  ]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold">New post</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Write your post and publish it when you&apos;re ready.
        </p>
      </header>
      <PostForm categories={categories} insertItems={insertItems} />
    </div>
  );
}