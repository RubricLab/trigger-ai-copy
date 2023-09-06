"use server";

import { client } from "@/trigger";

export async function sendText(data: FormData) {
  const heading1 = data.get("heading1");

  const res = await client.sendEvent({
    name: "generate.event",
    payload: {
      heading1,
    },
  });

  return res;
}
