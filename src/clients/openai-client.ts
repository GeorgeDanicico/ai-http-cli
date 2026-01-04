import OpenAI from "openai";
import type { OpenAiClient } from "./types";

export const DEFAULT_OPENAI_BASE_URL = "https://api.openai.com/v1";

export const createOpenAiClient = (apiKey: string, baseUrl?: string): OpenAiClient => {
  if (!apiKey.trim()) {
    throw new Error("OPENAI_API_KEY is required for OpenAI usage.");
  }

  const resolvedBaseUrl = baseUrl?.trim() || DEFAULT_OPENAI_BASE_URL;
  const client = new OpenAI({
    apiKey: apiKey.trim(),
    baseURL: resolvedBaseUrl,
  });

  return {
    kind: "openai",
    client,
    baseUrl: resolvedBaseUrl,
    healthCheck: async () => {
      await client.models.list();
    },
  };
};
