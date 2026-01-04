import type { LlmClient } from "../clients/types";
import type { ControllerCandidate, Endpoint } from "./types";
import { parseEndpointsFromModel } from "./endpoint-parser";

type ExtractionError = {
  filePath: string;
  message: string;
};

const DEFAULT_OPENAI_MODEL = "gpt-4o-mini";
const DEFAULT_OLLAMA_MODEL = "llama3.1";

const resolveModel = (client: LlmClient, env: NodeJS.ProcessEnv = process.env): string => {
  const override = env.AI_HTTP_CLI_MODEL?.trim();
  if (override) {
    return override;
  }

  if (client.kind === "openai") {
    return env.OPENAI_MODEL?.trim() || DEFAULT_OPENAI_MODEL;
  }

  return env.OLLAMA_MODEL?.trim() || DEFAULT_OLLAMA_MODEL;
};

const SYSTEM_PROMPT = [
  "You read Spring Boot @RestController source files and extract HTTP endpoints.",
  "Return JSON only with this schema:",
  '{ "endpoints": [{ "method": "GET|POST|PUT|PATCH|DELETE|OPTIONS|HEAD", "path": "/path", "operation": "handlerName", "payload": { "field": "Type" } | null }] }',
  "If no endpoints exist, return { \"endpoints\": [] }.",
  "Combine class-level @RequestMapping with method-level mapping to build the full path.",
  "Prefer handler method name for operation.",
  "Only include payload when a request body is required (e.g., @RequestBody or POST/PUT/PATCH).",
  "Do not include explanations or markdown.",
].join("\n");

const buildUserPrompt = (candidate: ControllerCandidate): string => {
  return [
    `File: ${candidate.path}`,
    "Source:",
    "```java",
    candidate.source,
    "```",
  ].join("\n");
};

const callOpenAi = async (
  client: LlmClient & { kind: "openai" },
  model: string,
  prompt: string,
): Promise<string> => {
  const response = await client.client.chat.completions.create({
    model,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: prompt },
    ],
    temperature: 0,
  });

  return response.choices[0]?.message?.content?.trim() ?? "";
};

const callOllama = async (
  client: LlmClient & { kind: "ollama" },
  model: string,
  prompt: string,
): Promise<string> => {
  const response = await client.client.chat({
    model,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: prompt },
    ],
    stream: false,
  });

  return response.message?.content?.trim() ?? "";
};

const dedupeEndpoints = (endpoints: Endpoint[]): Endpoint[] => {
  const seen = new Set<string>();
  const deduped: Endpoint[] = [];

  for (const endpoint of endpoints) {
    const key = `${endpoint.method} ${endpoint.path}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    deduped.push(endpoint);
  }

  return deduped;
};

export const extractEndpointsFromCandidates = async (
  client: LlmClient,
  candidates: ControllerCandidate[],
): Promise<{ endpoints: Endpoint[]; errors: ExtractionError[]; model: string }> => {
  const model = resolveModel(client);
  const endpoints: Endpoint[] = [];
  const errors: ExtractionError[] = [];

  for (const candidate of candidates) {
    try {
      const prompt = buildUserPrompt(candidate);
      const content =
        client.kind === "openai"
          ? await callOpenAi(client, model, prompt)
          : await callOllama(client, model, prompt);

      if (!content) {
        throw new Error("Model returned empty response.");
      }
      const parsed = parseEndpointsFromModel(content, candidate.path);
      endpoints.push(...parsed);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push({ filePath: candidate.path, message });
    }
  }

  return { endpoints: dedupeEndpoints(endpoints), errors, model };
};
