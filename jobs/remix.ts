import { eventTrigger } from "@trigger.dev/sdk";
import { client, openai } from "@/trigger";
import { z } from "zod";
import { load } from "cheerio";

const MAX_HEADING_LENGTH = 200;
const MAX_HEADING_COUNT = 10;
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
        label: "Waiting for Cloudflare",
        state: "loading",
      });

      // Fetch initial screenshot in parallel with other tasks
      await io.runTask("initial-screenshot", async () => {
        await fetch(WORKER_URL, {
          method: "POST",
          body: JSON.stringify({ url }),
        })
          .then((res) => res.json())
          .then(({ fileUrl }) => {
            initialScreenshotStatus.update("screenshotted", {
              label: "Initial screenshot",
              state: "success",
              data: {
                url: fileUrl,
              },
            });
          });
      });

      const fetchHeadingsStatus = await io.createStatus("headings", {
        label: "Fetching headings with Trigger",
        state: "loading",
      });

      // Fetch and clean headings
      const headings = await io.runTask("fetch-site", async () => {
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

        return headings;
      });

      fetchHeadingsStatus.update("headings-fetched", {
        label: "Fetched headings with Trigger",
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
        label: "Waiting for OpenAI",
        state: "loading",
      });

      // Call the OpenAI API to generate new headings
      const openaiResponse = await io.openai.createChatCompletion(
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

      if (!openaiResponse?.choices?.length) {
        throw new Error("OpenAI failed to return a response");
      }

      const newHeadings = openaiResponse.choices[0].message?.content
        ?.split("\n")
        .map((text: string, index: number) => ({
          id: index,
          text,
        }));

      aiStatus.update("new-headings-complete", {
        label: "Generated new headings with OpenAI",
        state: "success",
      });

      const finalScreenshotStatus = await io.createStatus("remix", {
        label: "Waiting for second screenshot",
        state: "loading",
      });

      await io.runTask("new-screenshot", async () => {
        await fetch(WORKER_URL, {
          method: "POST",
          body: JSON.stringify({
            url,
            newHeadings,
          }),
        })
          .then((res) => res.json())
          .then(async ({ fileUrl }) => {
            await finalScreenshotStatus.update("remixed", {
              label: "New screenshot",
              state: "success",
              data: {
                url: fileUrl,
              },
            });
          });
      });

      return;
    } catch (error) {
      io.logger.error("Failed to remix page", { error });
      return { message: "error" };
    }
  },
});
