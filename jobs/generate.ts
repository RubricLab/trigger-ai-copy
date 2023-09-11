import { eventTrigger } from "@trigger.dev/sdk";
import { client, openai } from "@/trigger";
import { z } from "zod";

/**
 * Trigger.dev job to generate copy with OpenAI's gpt-3.5-turbo model
 */
client.defineJob({
  id: "generate",
  name: "Generate copy with OpenAI",
  version: "0.0.1",
  trigger: eventTrigger({
    name: "generate.event",
    schema: z.object({
      headings: z.array(z.string()),
    }) as any,
  }),
  integrations: {
    openai,
  },
  run: async (payload, io, _) => {
    const prefix = `
    Re-write the following landing page heading(s) to be more impactful.
    Separate headings with a newline.
    `;
    const { headings } = payload;
    const prompt = `${prefix}\n\n${headings.join("\n")}`;

    io.logger.info("Generating text...");

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

    io.logger.info("Generated new headings!");

    if (!response?.choices?.length) {
      throw new Error("OpenAI failed to return a response");
    }

    return response.choices[0];
  },
});
