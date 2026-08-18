import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function VideosPage() {
  redirect("/admin/content?tab=videos");
}