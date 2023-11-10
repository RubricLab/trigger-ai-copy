import { ImageResponse } from "next/og";
import { validateUrl } from "./utils";
import { voices } from "./constants";
import { Voice } from "./types";

export const runtime = "edge";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");
  const voice = searchParams.get("voice") as Voice;

  let image: any;

  if (url && voice) {
    const parsedUrl = validateUrl(url);
    if (parsedUrl) {
      const siteName = new URL(parsedUrl)
        .toString()
        .replace(/https:\/\//g, "")
        .replace(/\.|\//g, "");
      const fileName = `${siteName}-${
        voice ? voices[voice].value : "index"
      }.jpeg`;
      image = `${process.env.NEXT_PUBLIC_BUCKET_URL}/${fileName}`;
    }
  } else {
    image = await fetch(new URL("/public/og.png", import.meta.url)).then(
      (res) => res.arrayBuffer()
    );
  }

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
          src={image}
          alt="Screenshot of website"
        />
      </div>
    ),
    {
      width: 1200,
      height: 630,
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
