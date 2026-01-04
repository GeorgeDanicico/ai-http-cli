import type { LlmClient } from "./types";

export const describeClient = (client: LlmClient): string => {
  if (client.kind === "openai") {
    return `OpenAI (${client.baseUrl})`;
  }

  return `Ollama (${client.host})`;
};
