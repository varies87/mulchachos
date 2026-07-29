import { ImageResponse } from "next/og";

// The card that shows when the site is shared in a text or on social. Built at
// request time so there is no image file to maintain.
export const alt = "Preston Hollow Mulchachos — mulch and rock, delivered and spread";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "#F5EFE7",
          color: "#453738",
        }}
      >
        <div style={{ fontSize: 30, letterSpacing: 4, textTransform: "uppercase", color: "#B7655D" }}>
          Preston Hollow Mulchachos
        </div>
        <div style={{ fontSize: 104, fontWeight: 800, lineHeight: 1.05, marginTop: 24, display: "flex", flexDirection: "column" }}>
          <span>Fresh beds</span>
          <span style={{ color: "#B7655D" }}>by the weekend.</span>
        </div>
        <div style={{ fontSize: 34, marginTop: 32, color: "#6F5D5E" }}>
          Mulch &amp; rock, delivered and spread across DFW.
        </div>
      </div>
    ),
    size
  );
}
