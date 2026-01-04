export type OpenAiClient = {
  kind: "openai";
  apiKey: string;
  baseUrl: string;
  healthCheck: () => Promise<void>;
};

export type OllamaClient = {
  kind: "ollama";
  host: string;
  healthCheck: () => Promise<void>;
};

export type LlmClient = OpenAiClient | OllamaClient;
