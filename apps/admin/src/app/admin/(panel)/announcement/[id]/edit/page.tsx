import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { AnnouncementForm } from "@/components/admin/AnnouncementForm";

export const metadata: Metadata = { title: "Edit Announcement · Admin" };
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function EditAnnouncementPage({ params }: Props) {
  const { id } = await params;
  const announcement = await prisma.announcement.findUnique({ where: { id } });
  if (!announcement) notFound();

  const serialized = {
    ...announcement,
    eventDate: announcement.eventDate?.toISOString() ?? null,
    createdAt: announcement.createdAt.toISOString(),
  };

  return (
    <div className="h-full">
      <AnnouncementForm initial={serialized} />
    </div>
  );
}
