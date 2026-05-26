import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
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
          background: "#ffffff",
          fontSize: 26,
          fontWeight: 300,
          color: "#17181d",
          letterSpacing: "3px",
        }}
      >
        EB
      </div>
    ),
    { width: 64, height: 64 }
  );
}
