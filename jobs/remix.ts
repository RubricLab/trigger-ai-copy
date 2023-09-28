import { eventTrigger } from "@trigger.dev/sdk";
import { client, openai } from "@/trigger";
import { z } from "zod";
import { load } from "cheerio";

const MAX_HEADING_LENGTH = 200;
const MAX_HEADING_COUNT = 50;
const WORKER_URL = "https://puppeteer.tedspare.workers.dev";

/**
 * Trigger.dev job to collect headings from a server-side rendered website
 */
client.defineJob({
  id: "remix",
  name: "Screenshot and remix a page's headings",
  version: "0.0.1",
  trigger: eventTrigger({
    name: "remix.event",
    schema: z.object({
      url: z.string().url(),
    }) as any,
  }),
  integrations: {
    openai,
  },
  run: async (payload, io, _) => {
    const { url } = payload;

    try {
      const screenshotRes = await fetch(WORKER_URL, {
        method: "POST",
        body: JSON.stringify({ url }),
      });
      const screenshot = await screenshotRes.text();

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

      const headings: string[] = [];

      headingElements.each((_, element) => {
        const elementText = queryFunction(element)?.text?.();

        if (typeof elementText === "string" && elementText.trim() !== "") {
          headings.push(
            elementText
              .trim()
              .replace(/\s+/g, " ")
              .substring(0, MAX_HEADING_LENGTH)
          );
        }
      });

      // Limit the number of headings
      headings.splice(MAX_HEADING_COUNT);

      await io.createStatus("headings", {
        label: "Fetch headings",
        state: "success",
      });

      const prefix = `
      Re-write each following landing page heading to be more impactful.
      Limit prose.
      Retain the order of the data.
      `;
      const prompt = `${prefix.trim()}\n\n${headings.join("\n")}`;

      await io.logger.info("Prompt", { prompt });

      // Call the OpenAI API to generate new headings
      const response = await io.openai.backgroundCreateChatCompletion(
        "openai-completions-api",
        {
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
        }
      );

      if (!response?.choices?.length) {
        throw new Error("OpenAI failed to return a response");
      }

      const newHeadings = response.choices[0].message?.content
        ?.split("\n")
        .map((text: string, index: number) => ({
          id: index,
          text,
        }));

      await io.createStatus("new-headings", {
        label: "Generate new headings",
        state: "success",
        data: {
          headings: newHeadings,
        },
      });

      const newScreenshotRes = await fetch(WORKER_URL, {
        method: "POST",
        body: JSON.stringify({
          url,
          newHeadings,
        }),
      });
      const newScreenshot = await newScreenshotRes.text();

      await io.createStatus("screenshot2", {
        label: "Final screenshot",
        state: "success",
        data: {
          url: newScreenshot,
        },
      });

      return { url: newScreenshot };
    } catch (error) {
      io.logger.error("Failed to remix page", { error });
      return { message: "error" };
    }
  },
});
