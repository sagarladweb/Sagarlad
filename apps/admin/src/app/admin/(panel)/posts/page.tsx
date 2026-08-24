import { prisma } from "@/lib/db";
import { PostsClientTable } from "@/components/admin/PostsClientTable";

export const dynamic = "force-dynamic";

export default async function PostsPage() {
  const posts = await prisma.post.findMany({
    where: { deletedAt: null },
    select: {
      id: true,
      slug: true,
      title: true,
      published: true,
      scheduledAt: true,
      views: true,
      category: { select: { name: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return <PostsClientTable initialPosts={posts} />;
}