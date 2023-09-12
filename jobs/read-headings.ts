import { eventTrigger } from "@trigger.dev/sdk";
import { client } from "@/trigger";
import { z } from "zod";
import { load } from "cheerio";

const MAX_HEADING_LENGTH = 200;

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
      const page = await fetch(url);

      io.logger.info("Page fetched");

      const data = await page.text();
      const queryFunction = load(data);
      const headingElements = queryFunction("h1, h2, h3");

      io.logger.info("Headings collected");

      const headings: { tag: string; text: string }[] = [];

      headingElements.each((_, element) => {
        const elementText = queryFunction(element)?.text?.();

        if (typeof elementText === "string" && elementText.trim() !== "") {
          headings.push({
            tag: element.tagName.trim().toUpperCase(),
            text: elementText
              .trim()
              .replace(/\s+/g, " ")
              .substring(0, MAX_HEADING_LENGTH),
          });
        }
      });

      return {
        message: "Fetched headings!",
        headings,
      };
    } catch (error) {
      io.logger.error("Failed to read page", { error });

      throw new Error("Failed to read page");
    }
  },
});
