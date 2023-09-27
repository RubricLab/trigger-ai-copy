import { eventTrigger } from "@trigger.dev/sdk";
import { client } from "@/trigger";
import { z } from "zod";
import { load } from "cheerio";
import { Heading } from "@/types";

const MAX_HEADING_LENGTH = 200;
const MAX_HEADING_COUNT = 50;
const WORKER_URL = "https://puppeteer.tedspare.workers.dev";

/**
 * Trigger.dev job to collect headings from a server-side rendered website
 */
client.defineJob({
  id: "read-headings",
  name: "Read headings from a server-side rendered website",
  version: "0.0.1",
  trigger: eventTrigger({
    name: "read-headings.event",
    schema: z.object({
      url: z.string().url(),
    }) as any,
  }),
  run: async (payload, io, _) => {
    const { url } = payload;

    try {
      const res = await fetch(WORKER_URL, {
        method: "POST",
        body: JSON.stringify({ url }),
      });

      const screenshot = await res.text();

      await io.createStatus("screenshot", {
        label: "Initial screenshot",
        state: "success",
        data: {
          url: screenshot,
        },
      });

      // Fetch the page by URL
      const page = await fetch(url);

      // Query the page for heading elements
      const data = await page.text();
      const queryFunction = load(data);
      const headingElements = queryFunction("h1, h2, h3");

      const headings: Heading[] = [];

      headingElements.each((_, element) => {
        const elementText = queryFunction(element)?.text?.();
        const elementIndex = queryFunction(element).index();

        if (typeof elementText === "string" && elementText.trim() !== "") {
          headings.push({
            // Clean up heading text
            id: elementIndex,
            text: elementText
              .trim()
              .replace(/\s+/g, " ")
              .substring(0, MAX_HEADING_LENGTH),
          });
        }
      });

      // Limit the number of headings
      headings.splice(MAX_HEADING_COUNT);

      await io.createStatus("headings", {
        label: "Fetch headings",
        state: "success",
      });

      const newHeadings = await client.sendEvent({
        name: "generate.event",
        payload: {
          headings,
        },
      });

      await io.createStatus("new-headings", {
        label: "Generate new headings",
        state: "success",
        data: {
          headings: newHeadings,
        },
      });

      return;
    } catch (error) {
      io.logger.error("Failed to read page", { error });

      throw new Error("Failed to read page");
    }
  },
});
