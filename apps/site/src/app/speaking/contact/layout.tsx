import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Speaking Inquiry",
  description:
    "Book Sagar Lad for keynotes, panels, and corporate events on money, career, and leadership.",
  path: "/speaking/contact",
});

export default function SpeakingContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
