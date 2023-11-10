import { ImageResponse } from "next/og";

export const runtime = "edge";
export const contentType = "image/png";
export const size = {
  height: 630,
  width: 1200,
};

export default async function Image() {
  const image = await fetch(new URL("/public/og.png", import.meta.url)).then(
    (res) => res.arrayBuffer()
  );

  const poppinsMedium = await fetch(
    new URL("/public/Poppins-Medium.ttf", import.meta.url)
  ).then((res) => res.arrayBuffer());

  const poppinsSemibold = await fetch(
    new URL("/public/Poppins-SemiBold.ttf", import.meta.url)
  ).then((res) => res.arrayBuffer());

  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          display: "flex",
          flexDirection: "column",
          background: "black",
          height: "100%",
          width: "100%",
          justifyContent: "flex-start",
          overflowY: "hidden",
          padding: "2rem",
          paddingBottom: 0,
          position: "relative",
        }}
      >
        <div
          style={{
            width: "100%",
            color: "white",
            padding: "2rem",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              fontSize: "2rem",
              fontWeight: 600,
            }}
          >
            Remix your landing page copy with AI
          </span>
          <span
            style={{
              fontWeight: 500,
              color: "#94A3B8",
            }}
          >
            Try it at copyai.rubric.sh
          </span>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          style={{
            borderRadius: "1rem",
          }}
          src={image as any} //
          alt="Screenshot of website"
        />
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Poppins",
          data: poppinsMedium,
          weight: 500,
        },
        {
          name: "Poppins",
          data: poppinsSemibold,
          style: "normal",
          weight: 600,
        },
      ],
    }
  );
}
