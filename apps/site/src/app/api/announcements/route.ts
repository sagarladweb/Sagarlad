import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  const announcements = await prisma.announcement.findMany({
    where: { active: true },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      description: true,
      imageUrl: true,
      buttonText: true,
      buttonLink: true,
      barText: true,
      barLink: true,
      barStyle: true,
      barSpeed: true,
      barBgColor: true,
      barColor: true,
      eventDate: true,
    },
  });
  return NextResponse.json({ announcements });
}
