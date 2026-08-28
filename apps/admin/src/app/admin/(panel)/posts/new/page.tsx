import { prisma } from "@/lib/db";
import { PostForm } from "@/components/admin/PostForm";

export const dynamic = "force-dynamic";

export default async function NewPostPage() {
  let categories: Awaited<ReturnType<typeof getCategories>> = [];

  try {
    categories = await getCategories();
  } catch (err) {
    console.warn("[admin posts/new] DB query failed:", (err as Error).message);
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold">New post</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Write your post and publish it when you&apos;re ready.
        </p>
      </header>
      <PostForm categories={categories} />
    </div>
  );
}

async function getCategories() {
  return prisma.category.findMany({ orderBy: { name: "asc" } });
}