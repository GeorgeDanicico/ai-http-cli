import { useCallback, useEffect, useMemo, useState } from "react";
import type { Endpoint } from "../scan/types";
import type { ScanCache } from "../scan/types";
import type { StatusMessage } from "../ui/types";
import { filterEndpoints } from "../call/filters";
import { buildMockPayloadDraft } from "../call/mock-payload";
import { executeEndpointCall } from "../call/request";

type CallMode = "idle" | "select" | "payload";

type CallState = {
  mode: CallMode;
  filter: string;
  selectedIndex: number;
  selectedEndpoint: Endpoint | null;
  payloadDraft: string;
};

type UseCallModeOptions = {
  scanCache: ScanCache | null;
  log: (message: string) => void;
  setStatus: (status: StatusMessage) => void;
  clearStatus: () => void;
};

type PayloadParseResult =
  | { ok: true; payload: unknown | null }
  | { ok: false; error: string };

const createInitialState = (): CallState => ({
  mode: "idle",
  filter: "",
  selectedIndex: 0,
  selectedEndpoint: null,
  payloadDraft: "",
});

/**
 * Parses a JSON payload draft for request submission.
 */
const parsePayloadDraft = (draft: string): PayloadParseResult => {
  if (!draft.trim()) {
    return { ok: true, payload: null };
  }

  try {
    return { ok: true, payload: JSON.parse(draft) };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, error: `Invalid JSON payload: ${message}` };
  }
};

export const useCallMode = ({
  scanCache,
  log,
  setStatus,
  clearStatus,
}: UseCallModeOptions) => {
  const [callState, setCallState] = useState<CallState>(createInitialState);

  const endpoints = scanCache?.endpoints ?? [];
  const filteredEndpoints = useMemo(
    () => filterEndpoints(endpoints, callState.filter),
    [endpoints, callState.filter],
  );

  useEffect(() => {
    if (callState.selectedIndex >= filteredEndpoints.length) {
      setCallState((prev) => ({
        ...prev,
        selectedIndex: Math.max(0, filteredEndpoints.length - 1),
      }));
    }
  }, [callState.selectedIndex, filteredEndpoints.length]);

  const exitCallMode = useCallback(() => {
    setCallState(createInitialState());
  }, []);

  const enterCallMode = useCallback(() => {
    if (!scanCache) {
      log("No cached scan found. Run /scan first.");
      return;
    }
    if (scanCache.endpoints.length === 0) {
      log("No endpoints available. Run /scan again after adding controllers.");
      return;
    }

    setCallState((prev) => ({
      ...prev,
      mode: "select",
      filter: "",
      selectedIndex: 0,
      selectedEndpoint: null,
      payloadDraft: "",
    }));
  }, [log, scanCache]);

  const setFilter = useCallback((value: string) => {
    setCallState((prev) => ({ ...prev, filter: value, selectedIndex: 0 }));
  }, []);

  const moveSelection = useCallback((delta: number) => {
    setCallState((prev) => {
      const maxIndex = Math.max(0, filteredEndpoints.length - 1);
      const nextIndex = Math.min(maxIndex, Math.max(0, prev.selectedIndex + delta));
      return { ...prev, selectedIndex: nextIndex };
    });
  }, [filteredEndpoints.length]);

  const beginPayload = useCallback((endpoint: Endpoint) => {
    setCallState((prev) => ({
      ...prev,
      mode: "payload",
      selectedEndpoint: endpoint,
      payloadDraft: buildMockPayloadDraft(endpoint.payload),
    }));
  }, []);

  const callEndpoint = useCallback(
    async (endpoint: Endpoint, payload: unknown | null) => {
      setStatus({ text: `Calling ${endpoint.method} ${endpoint.path}...`, state: "pending" });
      try {
        const result = await executeEndpointCall(endpoint, payload);
        log(`Response ${result.status} ${result.statusText}`);
        if (result.body) {
          log(result.body);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        log(`Request failed: ${message}`);
      } finally {
        clearStatus();
      }
    },
    [clearStatus, log, setStatus],
  );

  const selectCurrent = useCallback(async () => {
    const endpoint = filteredEndpoints[callState.selectedIndex];
    if (!endpoint) {
      log("No endpoint selected.");
      return;
    }

    log(`Selected endpoint: ${endpoint.method} ${endpoint.path}`)
    if (endpoint.payload) {
      beginPayload(endpoint);
      return;
    }

    await callEndpoint(endpoint, null);
    exitCallMode();
  }, [beginPayload, callEndpoint, callState.selectedIndex, exitCallMode, filteredEndpoints, log]);

  const setPayloadDraft = useCallback((draft: string) => {
    setCallState((prev) => ({ ...prev, payloadDraft: draft }));
  }, []);

  const submitPayload = useCallback(async () => {
    if (!callState.selectedEndpoint) {
      log("No endpoint selected.");
      return;
    }

    const parsed = parsePayloadDraft(callState.payloadDraft);
    if (!parsed.ok) {
      log(parsed.error);
      return;
    }

    log("Payload: " + callState.payloadDraft);

    await callEndpoint(callState.selectedEndpoint, parsed.payload);
    exitCallMode();
  }, [callEndpoint, callState.payloadDraft, callState.selectedEndpoint, exitCallMode, log]);

  return {
    callState,
    filteredEndpoints,
    enterCallMode,
    exitCallMode,
    setFilter,
    moveSelection,
    selectCurrent,
    setPayloadDraft,
    submitPayload,
  };
};
