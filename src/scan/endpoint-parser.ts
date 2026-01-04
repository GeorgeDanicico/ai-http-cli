import type { Endpoint, EndpointPayload, HttpMethod } from "./types";

const ALLOWED_METHODS: HttpMethod[] = [
  "GET",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
  "OPTIONS",
  "HEAD",
];

const normalizeMethod = (value: unknown): HttpMethod | null => {
  if (typeof value !== "string") {
    return null;
  }
  const upper = value.toUpperCase();
  return ALLOWED_METHODS.includes(upper as HttpMethod) ? (upper as HttpMethod) : null;
};

const normalizePath = (value: unknown): string | null => {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
};

const normalizePayload = (value: unknown): EndpointPayload => {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "object" && !Array.isArray(value)) {
    const payload: Record<string, string> = {};
    for (const [key, entry] of Object.entries(value)) {
      payload[key] = typeof entry === "string" ? entry : JSON.stringify(entry);
    }
    return payload;
  }
  return null;
};

const extractJsonBlock = (content: string): string => {
  const firstCurly = content.indexOf("{");
  const lastCurly = content.lastIndexOf("}");
  const firstBracket = content.indexOf("[");
  const lastBracket = content.lastIndexOf("]");
  if (
    firstBracket !== -1 &&
    lastBracket > firstBracket &&
    (firstCurly === -1 || firstBracket < firstCurly)
  ) {
    return content.slice(firstBracket, lastBracket + 1);
  }

  if (firstCurly !== -1 && lastCurly > firstCurly) {
    return content.slice(firstCurly, lastCurly + 1);
  }

  throw new Error("No JSON content found in model response.");
};

export const parseEndpointsFromModel = (content: string, sourceFile: string): Endpoint[] => {
  const jsonText = extractJsonBlock(content);
  const parsed = JSON.parse(jsonText) as unknown;
  const entries = Array.isArray(parsed)
    ? parsed
    : typeof parsed === "object" && parsed !== null
      ? (parsed as { endpoints?: unknown }).endpoints
      : null;

  if (!Array.isArray(entries)) {
    return [];
  }

  const endpoints: Endpoint[] = [];
  for (const entry of entries) {
    if (typeof entry !== "object" || entry === null) {
      continue;
    }
    const raw = entry as Record<string, unknown>;
    const method = normalizeMethod(raw.method);
    const path = normalizePath(raw.path);
    if (!method || !path) {
      continue;
    }
    endpoints.push({
      method,
      path,
      operation: typeof raw.operation === "string" ? raw.operation : null,
      payload: normalizePayload(raw.payload),
      sourceFile,
    });
  }

  return endpoints;
};
