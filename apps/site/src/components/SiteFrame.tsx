"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ScrollTopButton } from "@/components/ui/ScrollTopButton";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { RssBanner } from "@/components/RssBanner";
import { AnnouncementBar } from "@/components/AnnouncementBar";

const PageEntrance = dynamic(
  () => import("@/components/PageEntrance").then((m) => m.PageEntrance),
  { ssr: false }
);

const ScrollAnimations = dynamic(
  () => import("@/components/home/ScrollAnimations").then((m) => m.ScrollAnimations),
  { ssr: false }
);

const NewsletterPopup = dynamic(
  () => import("@/components/NewsletterPopup").then((m) => m.NewsletterPopup),
  { ssr: false }
);

type AnnouncementBarData = {
  id: string;
  title: string;
  barText?: string | null;
  barLink?: string | null;
  buttonLink?: string | null;
  barStyle?: string;
  barSpeed?: number;
  barBgColor?: string | null;
  barColor?: string | null;
};

export function SiteFrame({
  children,
  announcement,
}: {
  children: React.ReactNode;
  announcement?: AnnouncementBarData | null;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const isAdmin = pathname.startsWith("/admin");
  const isBarPreview = searchParams.get("announce_preview") === "bar";
  const previewId = searchParams.get("id");
  const [previewAnnouncement, setPreviewAnnouncement] = useState<AnnouncementBarData | null>(null);

  useEffect(() => {
    if (!isBarPreview || !previewId || announcement) return;
    fetch(`/api/announcements?id=${previewId}`)
      .then((r) => r.json())
      .then((d) => { if (d.announcement) setPreviewAnnouncement(d.announcement); })
      .catch(() => {});
  }, [isBarPreview, previewId, announcement]);

  const effectiveAnnouncement = announcement || previewAnnouncement;
  const showRss = pathname === "/" || pathname === "/blog";
  const barText = effectiveAnnouncement?.barText || effectiveAnnouncement?.title || null;
  const barLink = effectiveAnnouncement?.barLink || effectiveAnnouncement?.buttonLink || null;
  const shouldShowBar = barText && (effectiveAnnouncement || isBarPreview);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    router.prefetch("/blog");
    router.prefetch("/about");
  }, [router]);

  useEffect(() => {
    const MEDIA = "img, video, svg, picture, canvas";
    function block(e: Event) {
      const el = e.target as HTMLElement | null;
      if (el && el.closest(MEDIA)) e.preventDefault();
    }
    document.addEventListener("contextmenu", block, true);
    document.addEventListener("dragstart", block, true);
    return () => {
      document.removeEventListener("contextmenu", block, true);
      document.removeEventListener("dragstart", block, true);
    };
  }, []);

  return (
    <>
      {!isAdmin && <GoogleAnalytics />}
      {!isAdmin && shouldShowBar && (
        <AnnouncementBar
          text={barText}
          link={barLink}
          barStyle={effectiveAnnouncement?.barStyle || "scrolling"}
          speed={effectiveAnnouncement?.barSpeed || 30}
          bgColor={effectiveAnnouncement?.barBgColor}
          textColor={effectiveAnnouncement?.barColor}
        />
      )}
      {!isAdmin && <Navbar />}
      <main className="flex-1">
        {children}
        {!isAdmin && <ScrollAnimations />}
        {!isAdmin && <PageEntrance />}
      </main>
      {!isAdmin && <ScrollTopButton />}
      {!isAdmin && <Footer />}
      {!isAdmin && pathname === "/" && <NewsletterPopup />}
      {!isAdmin && showRss && <RssBanner />}
    </>
  );
}
