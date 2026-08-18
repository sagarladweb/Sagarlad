import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Sagar Lad — Author, Investor & Educator";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 80px",
          background: "#111110",
          color: "#f5f4f0",
        }}
      >
        <div
          style={{
            display: "flex",
            width: "100%",
            alignItems: "flex-end",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                fontSize: 28,
                color: "#ffcb00",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
              }}
            >
              Sagar Lad
            </div>
            <div
              style={{
                fontSize: 64,
                fontWeight: 700,
                lineHeight: 1.1,
                maxWidth: 900,
              }}
            >
              The question is not how to get rich — it&apos;s how to get aware.
            </div>
            <div style={{ fontSize: 26, color: "#9a998f", marginTop: 20 }}>
              Author · Investor · Public Speaker
            </div>
          </div>
        </div>
      </div>
    ),
    size
  );
}
