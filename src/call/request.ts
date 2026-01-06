import type { Endpoint } from "../scan/types";

export const DEFAULT_CALL_BASE_URL = "http://localhost:8080";

export type CallResult = {
  status: number;
  statusText: string;
  body: string;
};

/**
 * Executes an HTTP call to a discovered endpoint.
 */
export const executeEndpointCall = async (
  endpoint: Endpoint,
  payload: unknown | null,
  baseUrl: string = DEFAULT_CALL_BASE_URL,
): Promise<CallResult> => {
  const url = new URL(endpoint.path, baseUrl);
  const init: RequestInit = {
    method: endpoint.method,
  };

  if (payload !== null && !["GET", "HEAD"].includes(endpoint.method)) {
    init.headers = { "Content-Type": "application/json" };
    init.body = JSON.stringify(payload);
  }

  const response = await fetch(url, init);
  const body = await response.text();

  return {
    status: response.status,
    statusText: response.statusText,
    body,
  };
};
