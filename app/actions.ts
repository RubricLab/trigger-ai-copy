"use server";

import { client } from "@/trigger";

export async function callTrigger(url: string) {
  const res = await client.sendEvent({
    name: "remix.event",
    payload: {
      url,
    },
  });

  return res;
}
