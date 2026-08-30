import { AnnouncementManager } from "@/components/admin/AnnouncementManager";

export const metadata = { title: "Announcement · Sagar Lad Admin" };
export const dynamic = "force-dynamic";

export default function AnnouncementPage() {
  return (
    <div className="h-full">
      <AnnouncementManager />
    </div>
  );
}
