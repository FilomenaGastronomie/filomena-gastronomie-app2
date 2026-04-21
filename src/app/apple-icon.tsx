import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

export default function AppleIcon() {
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
          fontSize: 64,
          fontWeight: 700,
          letterSpacing: 6,
          borderRadius: 36,
        }}
      >
        FG
      </div>
    ),
    size,
  );
}
