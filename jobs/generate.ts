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
      heading1: z.string(),
    }) as any,
  }),
  integrations: {
    openai,
  },
  run: async (payload, io, _) => {
    const prefix =
      "Re-write the following landing page heading(s) to be more impactful:";
    const headings = payload.heading1;
    const prompt = `${prefix}\n\n${headings}`;

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
      throw new Error("No response from OpenAI");
    }

    return response.choices[0];
  },
});
