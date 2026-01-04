import { describeClient } from "../clients/describe-client";
import { initClientFromEnv } from "../clients/factory";
import { DEFAULT_OLLAMA_HOST } from "../clients/ollama-client";
import type { CommandContext } from "./types";

export const runInit = async ({ client, log, setClient }: CommandContext) => {
  if (client) {
    log(`Already initialized with ${describeClient(client)}.`);
    return;
  }

  const openAiKey = process.env.OPENAI_API_KEY?.trim();
  const ollamaHost = process.env.OLLAMA_HOST?.trim() || DEFAULT_OLLAMA_HOST;

  try {
    const resolvedClient = await initClientFromEnv();
    setClient(resolvedClient);
    log(`Initialized ${describeClient(resolvedClient)} for this session.`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!openAiKey) {
      log("OPENAI_API_KEY not set.");
      log(`Attempted Ollama at ${ollamaHost}.`);
    }
    log(`Initialization failed: ${message}`);
    log("Set OPENAI_API_KEY or start Ollama to continue.");
  }
};
