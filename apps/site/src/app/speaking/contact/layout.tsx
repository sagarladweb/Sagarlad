import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Speaking Contact",
  description:
    "Book Sagar Lad for keynotes, panels, corporate events and speaking engagements.",
  path: "/speaking/contact",
});

export default function SpeakingContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
