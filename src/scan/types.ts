export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "OPTIONS" | "HEAD";

export type EndpointPayload = Record<string, string> | string | null;

export type Endpoint = {
  method: HttpMethod;
  path: string;
  operation: string | null;
  payload: EndpointPayload;
  sourceFile: string;
};

export type ScanCache = {
  rootDir: string;
  scannedAt: string;
  endpoints: Endpoint[];
  candidateFiles: string[];
  skippedFiles: string[];
};

export type ControllerCandidate = {
  path: string;
  source: string;
};
