import { describeClient } from "../clients/describe-client";
import { createOllamaClient, DEFAULT_OLLAMA_HOST } from "../clients/ollama-client";
import { createOpenAiClient } from "../clients/openai-client";
import type { CommandContext } from "./types";

export const runInit = async ({
  client,
  log,
  setClient,
  setStatus,
  clearStatus,
}: CommandContext) => {
  if (client) {
    log(`Already initialized with ${describeClient(client)}.`);
    return;
  }

  const openAiKey = process.env.OPENAI_API_KEY?.trim();
  const openAiBaseUrl = process.env.OPENAI_BASE_URL?.trim();
  const ollamaHost = process.env.OLLAMA_HOST?.trim() || DEFAULT_OLLAMA_HOST;

  if (openAiKey) {
    setStatus({ text: "Initializing OpenAI client...", state: "pending" });
    try {
      const openAiClient = createOpenAiClient(openAiKey, openAiBaseUrl);
      await openAiClient.healthCheck();
      setClient(openAiClient);
      clearStatus();
      log(`Initialized ${describeClient(openAiClient)} for this session.`);
      return;
    } catch (error) {
      clearStatus();
      log("Failed to initialize OpenAI client.");
      const message = error instanceof Error ? error.message : String(error);
      log(`OpenAI error: ${message}`);
    }
  } else {
    log("OPENAI_API_KEY not set.");
  }

  setStatus({ text: "Trying to initialize Ollama client...", state: "pending" });
  try {
    const ollamaClient = createOllamaClient(ollamaHost);
    await ollamaClient.healthCheck();
    setClient(ollamaClient);
    clearStatus();
    log(`Initialized ${describeClient(ollamaClient)} for this session.`);
  } catch (error) {
    clearStatus();
    const message = error instanceof Error ? error.message : String(error);
    log(`Initialization failed: ${message}`);
    log(`Attempted Ollama at ${ollamaHost}.`);
    log("Set OPENAI_API_KEY or start Ollama to continue.");
  }
};
