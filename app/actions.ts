"use server";

import { client } from "@/trigger";

export async function generateHeadings(headings: string[]) {
  const res = await client.sendEvent({
    name: "generate.event",
    payload: {
      headings,
    },
  });

  return res;
}

export async function readHeadings(url: string) {
  const res = await client.sendEvent({
    name: "read-headings.event",
    payload: {
      url,
    },
  });

  return res;
}
