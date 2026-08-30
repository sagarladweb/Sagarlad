import { prisma } from "@/lib/db";
import { PostsClientTable } from "@/components/admin/PostsClientTable";

export const dynamic = "force-dynamic";

export default async function PostsPage() {
  let posts: Awaited<ReturnType<typeof getPosts>> = [];

  try {
    posts = await getPosts();
  } catch (err) {
    console.warn("[admin posts] DB query failed:", (err as Error).message);
  }

  return <PostsClientTable initialPosts={posts} />;
}

async function getPosts() {
  return prisma.post.findMany({
    where: { deletedAt: null },
    select: {
      id: true,
      slug: true,
      title: true,
      published: true,
      scheduledAt: true,
      views: true,
      likes: true,
      category: { select: { name: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
}