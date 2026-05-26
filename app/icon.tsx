import { ImageResponse } from "next/og";
import { readFile } from "fs/promises";
import { join } from "path";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default async function Icon() {
  const font = await readFile(
    join(process.cwd(), "public/fonts/InstrumentSerif-Regular.woff2")
  );

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
          fontFamily: "Instrument Serif",
          fontSize: 28,
          fontWeight: 400,
          color: "#17181d",
          letterSpacing: "-0.5px",
        }}
      >
        EB
      </div>
    ),
    {
      width: 64,
      height: 64,
      fonts: [
        {
          name: "Instrument Serif",
          data: font,
          style: "normal",
          weight: 400,
        },
      ],
    }
  );
}
