import { ImageResponse } from "next/og";

import { activePrice } from "@/lib/pricing";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "ClientFlow Outreach Kit — client acquisition templates for Indian freelancers";

const INK = "#14110E";
const CLAY = "#B24D26";
const BASE = "#FBFAF7";
const MUTED = "#6B655D";

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
          background: BASE,
          padding: 72,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 13,
              background: INK,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ width: 18, height: 18, borderRadius: 6, background: CLAY }} />
          </div>
          <div style={{ color: INK, fontSize: 30, fontWeight: 700, display: "flex", alignItems: "center" }}>
            Client<span style={{ color: CLAY, display: "contents" }}>Flow</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 66, fontWeight: 700, color: INK, lineHeight: 1.1, letterSpacing: "-1px" }}>
            Steady clients, not another
          </div>
          <div style={{ fontSize: 66, fontWeight: 700, color: CLAY, lineHeight: 1.1, letterSpacing: "-1px" }}>
            cold month.
          </div>
          <div style={{ marginTop: 24, fontSize: 27, color: MUTED, display: "flex" }}>
            20 templates &amp; scripts in 6 files — ₹{activePrice()} introductory
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 56, height: 6, borderRadius: 3, background: INK }} />
          <div style={{ width: 90, height: 6, borderRadius: 3, background: CLAY }} />
          <div style={{ fontSize: 20, color: MUTED, marginLeft: 12 }}>
            Cold emails · DMs · Follow-ups · Proposals · Pricing
          </div>
        </div>
      </div>
    ),
    size,
  );
}
