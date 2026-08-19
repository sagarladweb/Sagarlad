import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ebookDownloadSchema } from "@/lib/validations";
import { rateLimitByIp, getClientIp } from "@/lib/rate-limit";
import { logAudit } from "@/lib/audit";
import { downloadEbook, EBOOK_MIME_TYPES } from "@/lib/storage";

export const runtime = "nodejs";

const EXT_BY_TYPE: Record<string, string> = {
  "application/pdf": "pdf",
  "application/epub+zip": "epub",
  "application/vnd.amazon.ebook": "azw3",
  "application/x-mobipocket-ebook": "mobi",
};

// Proxy a fetch body through an explicit pull-based ReadableStream (the pattern
// the Next docs use for streaming). Passing the undici body straight to
// NextResponse stalls without flushing in this Next version.
async function* upstreamToIterator(upstream: Response) {
  const reader = upstream.body!.getReader();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      yield value;
    }
  } finally {
    reader.releaseLock();
  }
}

function iteratorToStream(iterator: AsyncGenerator<Uint8Array>) {
  return new ReadableStream({
    async pull(controller) {
      const { value, done } = await iterator.next();
      if (done) {
        controller.close();
      } else {
        controller.enqueue(value);
      }
    },
    cancel() {
      iterator.return?.(undefined);
    },
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const ip = getClientIp(request);

  const rl = await rateLimitByIp(ip, 5, 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many requests. Please try again in a moment." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
    );
  }

  const book = await prisma.book.findUnique({ where: { id } });
  if (!book || !book.published || book.type !== "EBOOK") {
    return NextResponse.json({ error: "This eBook is not available for download." }, { status: 404 });
  }
  if (!book.fileKey && !book.buyUrl) {
    return NextResponse.json({ error: "This eBook is not available for download." }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = ebookDownloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const { name, email, subscribe } = parsed.data;

  await logAudit("EBOOK_DOWNLOAD", {
    ip,
    meta: { kind: "EBOOK_DOWNLOAD", bookId: id, bookTitle: book.title, email, name, subscribe },
  });

  // Optional newsletter signup on the download gate. Already subscribed → no-op;
  // previously unsubscribed → flip the flag back; otherwise create a subscriber.
  if (subscribe) {
    const existing = await prisma.newsletterSubscriber.findUnique({ where: { email } });
    if (existing) {
      if (existing.unsubscribed) {
        await prisma.newsletterSubscriber.update({
          where: { id: existing.id },
          data: { unsubscribed: false, name: existing.name || name, acceptedTerms: true },
        });
      }
    } else {
      await prisma.newsletterSubscriber.create({
        data: { email, name, acceptedTerms: true },
      });
    }
  }

  // Proxy the file through the server so the real URL never reaches the browser.
  // Primary source is the private bucket; legacy `buyUrl` is the fallback.
  if (book.fileKey) {
    const fetched = await downloadEbook(book.fileKey);
    if (!fetched.data) {
      return NextResponse.json({ error: "The eBook file is currently unavailable." }, { status: 502 });
    }
    const contentType = fetched.contentType ?? EBOOK_MIME_TYPES[book.fileKey.split(".").pop()?.toLowerCase() ?? ""] ?? "application/octet-stream";
    const ext = contentType.split("/").pop()?.split("+")[0] ?? "pdf";
    const safe = book.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
    const fileName = `${safe || "ebook"}.${ext}`;
    return new NextResponse(await fetched.data.arrayBuffer(), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  }

  // archive.org is slow to warm up; give the legacy buyUrl fallback a generous
  // window so a legit download isn't aborted mid-stream. The primary fileKey
  // path (Supabase private bucket) streams instantly. Rate limiting caps abuse.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 300_000);
  try {
    const upstream = await fetch(book.buyUrl!, { signal: controller.signal });
    if (!upstream.ok) {
      return NextResponse.json({ error: "The eBook file is currently unavailable." }, { status: 502 });
    }
    const contentType = upstream.headers.get("content-type") ?? "application/octet-stream";
    const ext = EXT_BY_TYPE[contentType] ?? "pdf";
    const safe = book.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
    const fileName = `${safe || "ebook"}.${ext}`;

    return new NextResponse(iteratorToStream(upstreamToIterator(upstream)), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } finally {
    clearTimeout(timer);
  }
}