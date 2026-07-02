import { ImageResponse } from "next/og";
import { getProfile } from "@/lib/data/queries";

export const runtime = "edge";
export const alt = "Ahmedh M.R.R — Software Developer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const profile = await getProfile();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "80px",
          background: "#0a0b0d",
          color: "#f5f7fa",
        }}
      >
        <div
          style={{
            fontSize: 28,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: "#38bdf8",
            display: "flex",
          }}
        >
          {profile.title}
        </div>
        <div style={{ fontSize: 92, fontWeight: 700, marginTop: 24, display: "flex" }}>
          {profile.full_name}
        </div>
        <div
          style={{
            fontSize: 32,
            marginTop: 24,
            color: "#9aa3af",
            maxWidth: 900,
            display: "flex",
          }}
        >
          {profile.short_tagline}
        </div>
      </div>
    ),
    { ...size }
  );
}
