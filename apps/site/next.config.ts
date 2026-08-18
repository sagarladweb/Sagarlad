import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Versioned immutable build dir (see start-site.sh). A build into a fresh
  // dir can never delete the assets a running server is serving, which was
  // the root cause of "CSS not loading" (live server + rebuilt .next).
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  // server.mjs must see uncompressed HTML to re-indent it. Re-enable gzip in
  // server.mjs itself (zlib.gzipSync on the formatted body) if bandwidth ever
  // matters; do not turn this back on without decompressing in the server.
  compress: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "m.media-amazon.com",
      },
      {
        protocol: "https",
        hostname: "covers.openlibrary.org",
      },
      {
        protocol: "https",
        hostname: "*.archive.org",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
  async headers() {
    const isProd = process.env.NODE_ENV === "production";
    return [
      ...(isProd
        ? [
            {
              source: "/_next/static/(.*)",
              headers: [
                { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
              ],
            },
          ]
        : []),
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
