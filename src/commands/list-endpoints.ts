import type { CommandContext } from "./types";
import type { EndpointPayload } from "../scan/types";

const formatPayload = (payload: EndpointPayload): string => {
  if (!payload) {
    return "";
  }
  if (typeof payload === "string") {
    return payload;
  }
  return JSON.stringify(payload);
};

export const runListEndpoints = ({ log, scanCache }: CommandContext) => {
  if (!scanCache) {
    log("No cached scan found. Run /scan first.");
    return;
  }

  const { endpoints, rootDir, scannedAt } = scanCache;
  if (endpoints.length === 0) {
    log(`Scan complete for ${rootDir} at ${scannedAt}. No endpoints found.`);
    return;
  }

  log(`Endpoints (${endpoints.length}) from ${rootDir} at ${scannedAt}:`);
  const sorted = [...endpoints].sort((a, b) => {
    if (a.path === b.path) {
      return a.method.localeCompare(b.method);
    }
    return a.path.localeCompare(b.path);
  });

  for (const endpoint of sorted) {
    const details: string[] = [];
    if (endpoint.operation) {
      details.push(`handler: ${endpoint.operation}`);
    }
    const payloadText = formatPayload(endpoint.payload);
    if (payloadText) {
      details.push(`payload: ${payloadText}`);
    }
    const detailText = details.length ? ` - ${details.join("; ")}` : "";
    log(`${endpoint.method} ${endpoint.path}${detailText}`);
  }
};
