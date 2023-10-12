import { eventTrigger } from "@trigger.dev/sdk";
import { client, openai } from "@/trigger";
import { z } from "zod";
import { load } from "cheerio";

const MAX_HEADING_LENGTH = 200;
const MAX_HEADING_COUNT = 10;

// Make sure to run `wrangler dev --remote` to test locally
const WORKER_URL =
  process.env.NODE_ENV === "development"
    ? "http://127.0.0.1:8787"
    : "https://puppeteer.tedspare.workers.dev";

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
      voice: z.string().optional(),
    }) as any,
  }),
  integrations: {
    openai,
  },
  run: async (payload, io, _) => {
    const { url, voice } = payload;

    try {
      const initialScreenshotStatus = await io.createStatus("screenshot", {
        label: "Initial screenshot",
        state: "loading",
      });

      // Fetch initial screenshot in parallel with other tasks
      fetch(WORKER_URL, {
        method: "POST",
        body: JSON.stringify({ url }),
      })
        .then((res) => res.text())
        .then((screenshot) => {
          initialScreenshotStatus.update("screenshotted", {
            label: "Initial screenshot",
            state: "success",
            data: {
              url: screenshot,
            },
          });
        });

      const fetchHeadingsStatus = await io.createStatus("headings", {
        label: "Fetch headings",
        state: "loading",
      });

      // Fetch and clean headings
      const page = await fetch(url);
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

      headings.splice(MAX_HEADING_COUNT);

      fetchHeadingsStatus.update("headings-fetched", {
        label: "Fetch headings",
        state: "success",
      });

      const prefix = `
        You're a copywriting pro.
        You'll re-write the following landing page headings${
          voice ? " in the style of " + voice : ""
        }!
        Limit prose.
        Retain the rough length of headings.
        Retain the order of the data.
      `;
      const prompt = `${prefix.trim()}\n\n${headings.join("\n")}`;

      const aiStatus = await io.createStatus("new-headings", {
        label: "Generate new headings",
        state: "loading",
      });

      // Call the OpenAI API to generate new headings
      const response = await io.openai.createChatCompletion(
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

      aiStatus.update("new-headings-complete", {
        label: "Generate new headings",
        state: "success",
      });

      const finalScreenshotStatus = await io.createStatus("remix", {
        label: "Final screenshot",
        state: "loading",
      });

      const newScreenshotRes = await fetch(WORKER_URL, {
        method: "POST",
        body: JSON.stringify({
          url,
          newHeadings,
        }),
      });
      const newScreenshot = await newScreenshotRes.text();

      await finalScreenshotStatus.update("remixed", {
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
