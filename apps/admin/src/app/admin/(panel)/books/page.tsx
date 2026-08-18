import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function BooksPage() {
  redirect("/admin/content?tab=books");
}