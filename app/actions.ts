"use server";

import { client } from "@/trigger";

export async function callTrigger(url: string) {
  const res = await client.sendEvent({
    name: "generate.event",
    payload: {
      url,
    },
  });

  return res;
}
