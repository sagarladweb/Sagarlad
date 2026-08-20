import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { SiteFrame } from "@/components/SiteFrame";
import { SITE } from "@/lib/site";

// Self-hosted fonts — never depend on Google Fonts being reachable at build
// or serve time, so CSS always loads. Files in src/app/fonts/.
const beVietnamPro = localFont({
  variable: "--font-be-vietnam-pro",
  src: [
    { path: "./fonts/bvp-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/bvp-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/bvp-600.woff2", weight: "600", style: "normal" },
    { path: "./fonts/bvp-700.woff2", weight: "700", style: "normal" },
  ],
  display: "swap",
});

const rethinkSans = localFont({
  variable: "--font-rethink-sans",
  src: [
    { path: "./fonts/rethink-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/rethink-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/rethink-600.woff2", weight: "600", style: "normal" },
    { path: "./fonts/rethink-700.woff2", weight: "700", style: "normal" },
    { path: "./fonts/rethink-800.woff2", weight: "800", style: "normal" },
  ],
  display: "swap",
});

const greatVibes = localFont({
  variable: "--font-great-vibes",
  src: [
    { path: "./fonts/greatvibes-400.woff2", weight: "400", style: "normal" },
  ],
  display: "swap",
});

export const metadata: Metadata = {
  title: SITE.title,
  description: SITE.description,
  keywords: [
    "Sagar Lad",
    "personal finance",
    "money management",
    "career advice",
    "awareness",
    "investing",
    "books",
    "productivity",
    "India",
  ],
  metadataBase: new URL(SITE.url),
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: SITE.name,
    description: SITE.description,
    type: "website",
    siteName: SITE.name,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.name,
    description: SITE.description,
  },
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${beVietnamPro.variable} ${rethinkSans.variable} ${greatVibes.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <SiteFrame>{children}</SiteFrame>
      </body>
    </html>
  );
}
