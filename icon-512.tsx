import { ImageResponse } from "next/og";

export const size = {
  width: 512,
  height: 512,
};

export const contentType = "image/png";

export default function Icon512() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          height: "100%",
          width: "100%",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(135deg, rgba(183,93,42,1) 0%, rgba(92,45,22,1) 100%)",
          color: "white",
          fontSize: 94,
          fontWeight: 700,
          letterSpacing: 8,
        }}
      >
        FG
      </div>
    ),
    size,
  );
}
