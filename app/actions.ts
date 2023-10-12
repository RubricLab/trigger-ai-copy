"use server";

import { client } from "@/trigger";

export async function callTrigger({
  url,
  voice,
}: {
  url: string;
  voice?: string;
}) {
  const res = await client.sendEvent({
    name: "remix.event",
    payload: {
      url,
      voice,
    },
  });

  return res;
}
