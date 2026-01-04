import { fetchWithTimeout } from "./fetch-with-timeout";
import type { OllamaClient } from "./types";

export const DEFAULT_OLLAMA_HOST = "http://127.0.0.1:11434";
const HEALTHCHECK_TIMEOUT_MS = 1500;

export const createOllamaClient = (host: string): OllamaClient => {
  const trimmedHost = host.trim().replace(/\/$/, "");
  const resolvedHost = trimmedHost.match(/^https?:\/\//)
    ? trimmedHost
    : `http://${trimmedHost}`;

  return {
    kind: "ollama",
    host: resolvedHost,
    healthCheck: async () => {
      const response = await fetchWithTimeout(
        `${resolvedHost}/api/version`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        },
        HEALTHCHECK_TIMEOUT_MS,
      );

      if (!response.ok) {
        throw new Error(`Ollama responded with status ${response.status}.`);
      }
    },
  };
};
