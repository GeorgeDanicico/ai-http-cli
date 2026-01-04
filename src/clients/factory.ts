import { createOllamaClient, DEFAULT_OLLAMA_HOST } from "./ollama-client";
import { createOpenAiClient } from "./openai-client";
import type { LlmClient } from "./types";

export const initClientFromEnv = async (env: NodeJS.ProcessEnv = process.env): Promise<LlmClient> => {
  const openAiKey = env.OPENAI_API_KEY?.trim();

  if (openAiKey) {
    const openAiClient = createOpenAiClient(openAiKey, env.OPENAI_BASE_URL);
    try {
      await openAiClient.healthCheck();
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      throw new Error(`Unable to reach OpenAI at ${openAiClient.baseUrl}. ${reason}`);
    }
    return openAiClient;
  }

  const ollamaHost = env.OLLAMA_HOST?.trim() || DEFAULT_OLLAMA_HOST;
  const ollamaClient = createOllamaClient(ollamaHost);
  try {
    await ollamaClient.healthCheck();
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new Error(`Unable to reach Ollama at ${ollamaHost}. ${reason}`);
  }
  return ollamaClient;
};
