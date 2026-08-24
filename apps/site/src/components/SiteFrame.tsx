"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ScrollTopButton } from "@/components/ui/ScrollTopButton";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";

const ScrollAnimations = dynamic(
  () => import("@/components/home/ScrollAnimations").then((m) => m.ScrollAnimations),
  { ssr: false }
);

const NewsletterPopup = dynamic(
  () => import("@/components/NewsletterPopup").then((m) => m.NewsletterPopup),
  { ssr: false }
);

export function SiteFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    // Deter saving media: block right-click "Save image as..." and dragging
    // on images/videos. A deterrent, not a hard guarantee — anything a browser
    // can render can be captured, but this removes the casual download paths.
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
      {!isAdmin && <Navbar />}
      <main className="flex-1">
        {children}
        {!isAdmin && <ScrollAnimations />}
      </main>
      {!isAdmin && <ScrollTopButton />}
      {!isAdmin && <Footer />}
      {!isAdmin && pathname === "/" && <NewsletterPopup />}
    </>
  );
}
