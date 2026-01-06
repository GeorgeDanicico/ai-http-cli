import type { EndpointPayload } from "../scan/types";

const looksLikeJson = (value: string): boolean => {
  const trimmed = value.trim();
  return trimmed.startsWith("{") || trimmed.startsWith("[");
};

/**
 * Builds a JSON payload draft from a cached payload schema.
 */
export const buildMockPayloadDraft = (payload: EndpointPayload): string => {
  if (!payload) {
    return "";
  }

  if (typeof payload === "string") {
    if (looksLikeJson(payload)) {
      return payload;
    }
    return JSON.stringify({ payload: `<${payload}>` });
  }

  const mock: Record<string, string> = {};
  for (const [key, typeHint] of Object.entries(payload)) {
    mock[key] = `<${typeHint}>`;
  }

  return JSON.stringify(mock);
};
