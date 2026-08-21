import { NextResponse } from "next/server";
import { getPublishedBooks } from "@/lib/content";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    if (type && !["PUBLISHED", "READ", "EBOOK"].includes(type)) {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }
    const books = await getPublishedBooks(type as "PUBLISHED" | "READ" | "EBOOK" | undefined);
    return NextResponse.json({ books });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
