import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0b0d",
          borderRadius: 8,
          fontSize: 20,
          fontWeight: 700,
          color: "#f5f7fa",
        }}
      >
        A
        <span style={{ color: "#38bdf8" }}>.</span>
      </div>
    ),
    { ...size }
  );
}
