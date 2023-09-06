import { TriggerClient } from "@trigger.dev/sdk";
import { OpenAI } from "@trigger.dev/openai";

export const client = new TriggerClient({
  id: "jobs-NnF0",
  apiKey: process.env.TRIGGER_API_KEY,
  apiUrl: process.env.TRIGGER_API_URL,
});

export const openai = new OpenAI({
  id: "openai",
  apiKey: process.env.OPENAI_API_KEY!,
});
