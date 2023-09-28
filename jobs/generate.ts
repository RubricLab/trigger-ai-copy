import { eventTrigger } from "@trigger.dev/sdk";
import { client, openai } from "@/trigger";
import { z } from "zod";

/**
 * Trigger.dev job to generate copy with OpenAI's GPT
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
    Re-write each following landing page heading to be more impactful.
    Limit prose.
    Retain the structure of the data.
    `;
    const { headings } = payload;
    const prompt = `${prefix}\n\n${headings.join("\n")}`;

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

    return {
      message: "Success!",
      headings: response.choices[0].message.content,
    };
  },
});
