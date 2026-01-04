import { Ollama } from "ollama";
import type { OllamaClient } from "./types";

export const DEFAULT_OLLAMA_HOST = "http://127.0.0.1:11434";

export const createOllamaClient = (host: string): OllamaClient => {
  const trimmedHost = host.trim().replace(/\/$/, "");
  const resolvedHost = trimmedHost.match(/^https?:\/\//)
    ? trimmedHost
    : `http://${trimmedHost}`;
  const client = new Ollama({ host: resolvedHost });

  return {
    kind: "ollama",
    client,
    host: resolvedHost,
    healthCheck: async () => {
      await client.list();
    },
  };
};
