import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

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
  title: "Sagar Lad Admin",
  description: "Admin panel for sagarlad.com",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${beVietnamPro.variable} ${rethinkSans.variable} ${greatVibes.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <div className="hidden lg:block h-full flex-1">
          {children}
        </div>
        <div className="flex lg:hidden flex-1 min-h-screen items-center justify-center p-8 text-center text-muted-foreground">
          <p className="text-lg font-medium">The admin panel is only available on desktop devices.</p>
        </div>
      </body>
    </html>
  );
}
