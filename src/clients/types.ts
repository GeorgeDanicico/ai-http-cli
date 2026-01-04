import type OpenAI from "openai";
import type { Ollama } from "ollama";

export type OpenAiClient = {
  kind: "openai";
  client: OpenAI;
  baseUrl: string;
  healthCheck: () => Promise<void>;
};

export type OllamaClient = {
  kind: "ollama";
  client: Ollama;
  host: string;
  healthCheck: () => Promise<void>;
};

export type LlmClient = OpenAiClient | OllamaClient;
