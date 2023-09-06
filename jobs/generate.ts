import { eventTrigger } from "@trigger.dev/sdk";
import { client, openai } from "@/trigger";
import { z } from "zod";

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
  run: async (payload, io, ctx) => {
    // This background function can take longer than a serverless timeout
    const response = await io.openai.backgroundCreateChatCompletion(
      "background-chat-completion",
      {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content:
              "write an impactful heading for a landing page of a SaaS selling Uber for dogs",
          },
        ],
      }
    );

    await io.logger.info("choices", response.choices);
  },
});
