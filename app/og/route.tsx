import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { validateUrl } from "../utils";
import { voices } from "../constants";
import { Voice } from "../types";

export const runtime = "edge";

export async function GET(request: NextRequest) {
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

  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          width: "100%",
          justifyContent: "flex-start",
          overflowY: "hidden",
          position: "relative",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt="Screenshot of website" />
        <div
          style={{
            background: "black",
            borderRadius: "0.5rem",
            color: "white",
            fontSize: "1rem",
            padding: "0.5rem",
            paddingLeft: "0.75rem",
            paddingRight: "0.75rem",
            position: "absolute",
            right: "0.5rem",
            bottom: "0.5rem",
            display: "flex",
          }}
        >
          copyai.rubric.sh
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
