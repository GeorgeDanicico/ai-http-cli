import type { OpenAiClient } from "./types";

const DEFAULT_BASE_URL = "https://api.openai.com/v1";

export const createOpenAiClient = (apiKey: string, baseUrl?: string): OpenAiClient => {
  if (!apiKey.trim()) {
    throw new Error("OPENAI_API_KEY is required for OpenAI usage.");
  }

  return {
    kind: "openai",
    apiKey: apiKey.trim(),
    baseUrl: baseUrl?.trim() || DEFAULT_BASE_URL,
    healthCheck: async () => {},
  };
};
