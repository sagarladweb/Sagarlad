import { prisma, dbSafe } from "@/lib/db";
import { SITE, VISIBLE_POST_WHERE } from "@/lib/site";

export const dynamic = "force-dynamic";

const MAX_POSTS = 50;

function escapeXml(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const posts = await dbSafe(
    () =>
      prisma.post.findMany({
        where: VISIBLE_POST_WHERE,
        orderBy: { publishedAt: "desc" },
        take: MAX_POSTS,
        select: {
          title: true,
          slug: true,
          excerpt: true,
          publishedAt: true,
          updatedAt: true,
          coverImage: true,
          category: { select: { name: true } },
          author: { select: { name: true } },
        },
      }),
    []
  );

  const items = posts
    .map((post) => {
      const url = `${SITE.url}/blog/${post.slug}`;
      const description = post.excerpt
        ? escapeXml(post.excerpt)
        : "";
      const pubDate = post.publishedAt.toUTCString();
      const category = post.category?.name ? escapeXml(post.category.name) : "";
      const author = post.author?.name ?? SITE.name;

      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${description}</description>
      <pubDate>${pubDate}</pubDate>
      <dc:creator>${escapeXml(author)}</dc:creator>
      ${category ? `<category>${category}</category>` : ""}
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE.name)}</title>
    <link>${SITE.url}</link>
    <description>${escapeXml(SITE.description)}</description>
    <language>en-in</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE.url}/rss.xml" rel="self" type="application/rss+xml" />
    <image>
      <url>${SITE.url}${SITE.ogImage}</url>
      <title>${escapeXml(SITE.name)}</title>
      <link>${SITE.url}</link>
    </image>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
