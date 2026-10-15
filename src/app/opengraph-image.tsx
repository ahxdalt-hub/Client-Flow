import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Marketloom — Shopify Store Research Pack";

const mark = (
  <svg width="44" height="44" viewBox="0 0 64 64" fill="none">
    <path
      d="M23 24 A9 9 0 0 1 41 24"
      stroke="#fbf9f5"
      strokeWidth="5"
      strokeLinecap="round"
    />
    <path
      d="M14 24 H50 L45 50 H19 Z"
      fill="#fbf9f5"
      stroke="#fbf9f5"
      strokeWidth="4"
      strokeLinejoin="round"
    />
    <path
      d="M16 33 H48 M17 42 H47 M27 23 V51 M37 23 V51"
      stroke="#191713"
      strokeWidth="3.5"
      strokeLinecap="round"
    />
  </svg>
);

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "#fbf9f5",
          backgroundImage:
            "linear-gradient(to right, rgba(230,224,212,0.55) 1px, transparent 1px), linear-gradient(to bottom, rgba(230,224,212,0.55) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: "#191713",
              overflow: "hidden",
              display: "flex",
            }}
          >
            {mark}
          </div>
          <div style={{ fontSize: 30, fontWeight: 700, color: "#191713" }}>
            Marketloom
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontSize: 68,
              fontWeight: 700,
              color: "#191713",
              lineHeight: 1.08,
              maxWidth: 940,
              letterSpacing: -1.5,
            }}
          >
            Find your next Shopify client without a blank spreadsheet.
          </div>
          <div style={{ fontSize: 28, color: "#454039", maxWidth: 820 }}>
            A structured research pack for freelancers and agencies · One-time
            ₹199
          </div>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          {["CSV + XLSX", "Free sample", "No subscription"].map((chip) => (
            <div
              key={chip}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "10px 20px",
                borderRadius: 999,
                border: "1px solid #e6e0d4",
                background: "#ffffff",
                fontSize: 20,
                color: "#454039",
                fontWeight: 600,
              }}
            >
              {chip}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
