import type { Metadata } from "next";
import { AnnouncementForm } from "@/components/admin/AnnouncementForm";

export const metadata: Metadata = { title: "New Announcement · Admin" };

export default function NewAnnouncementPage() {
  return (
    <div className="h-full">
      <AnnouncementForm />
    </div>
  );
}
