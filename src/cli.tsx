#!/usr/bin/env node
import "dotenv/config";
import { useEffect, useMemo, useState } from "react";
import { Box, Text, render, useApp, useInput } from "ink";
import type { LlmClient } from "./clients/types";
import { commands } from "./commands/registry";
import { getSuggestions, normalizeInput, parseInput, resolveCommand } from "./commands/utils";
import { FatalError } from "./errors";
import type { ScanCache } from "./scan/types";
import { useHistory } from "./hooks/useHistory";
import { useStatus } from "./hooks/useStatus";
import { useCallMode } from "./hooks/useCallMode";
import { StatusLine } from "./ui/status-line";
import { HistoryLog } from "./ui/history-log";
import { CommandInput } from "./ui/command-input";
import { EndpointPicker } from "./ui/endpoint-picker";
import { PayloadInput } from "./ui/payload-input";

const SUGGESTION_LIMIT = 6;

const App = () => {
  const { exit } = useApp();
  const [input, setInput] = useState("");
  const [client, setClient] = useState<LlmClient | null>(null);
  const [scanCache, setScanCache] = useState<ScanCache | null>(null);
  const { history, log } = useHistory();
  const { status, setStatus, clearStatus } = useStatus();
  const {
    callState,
    filteredEndpoints,
    enterCallMode,
    exitCallMode,
    setFilter,
    moveSelection,
    selectCurrent,
    setPayloadDraft,
    submitPayload,
  } = useCallMode({ scanCache, log, setStatus, clearStatus });

  const suggestions = useMemo(
    () => (callState.mode === "idle" ? getSuggestions(input, commands) : []),
    [callState.mode, input],
  );
  const limitedSuggestions = suggestions.slice(0, SUGGESTION_LIMIT);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    setSelectedIndex(0);
  }, [input, suggestions.length]);

  useInput((_, key) => {
    if (callState.mode !== "idle") {
      return;
    }
    if (!limitedSuggestions.length) {
      return;
    }

    if (key.upArrow) {
      setSelectedIndex((prev) =>
        prev <= 0 ? limitedSuggestions.length - 1 : prev - 1,
      );
    }

    if (key.downArrow) {
      setSelectedIndex((prev) =>
        prev >= limitedSuggestions.length - 1 ? 0 : prev + 1,
      );
    }

    if (key.tab) {
      const selected = limitedSuggestions[selectedIndex];
      if (selected) {
        setInput(selected.id);
      }
    }

    if (key.escape) {
      setInput("");
    }
  });

  const handleChange = (value: string) => {
    setInput(normalizeInput(value));
  };

  const handleSubmit = (value: string) => {
    const normalized = normalizeInput(value);
    const parsed = parseInput(normalized);
    const command = resolveCommand(parsed.raw, commands);

    log(`> ${normalized}`);

    if (!command) {
      log(`Unknown command: ${parsed.command}. Type /help for options.`);
      setInput("");
      return;
    }

    const result = command.run(
      {
        client,
        setClient,
        scanCache,
        setScanCache,
        setStatus,
        clearStatus,
        enterCallMode,
        log,
        exit,
      },
      parsed.args,
    );
    void Promise.resolve(result).catch((error) => {
      if (error instanceof FatalError) {
        log(`Fatal: ${error.message}`);
        exit(error);
        return;
      }
      const message = error instanceof Error ? error.message : String(error);
      log(`Command failed: ${message}`);
    });
    setInput("");
  };

  const showSuggestions =
    callState.mode === "idle" && !normalizeInput(input).slice(1).includes(" ");

  return (
    <Box flexDirection="column" padding={1}>
      <Text color="cyanBright">ai-http-cli</Text>
      <Text dimColor>Type / to see commands. Tab autocompletes. Up/Down to select.</Text>
      <Text dimColor>All inputs must start with /.</Text>
      <HistoryLog history={history} />
      
      <StatusLine status={status} />

      {callState.mode === "select" ? (
        <EndpointPicker
          endpoints={filteredEndpoints}
          filter={callState.filter}
          selectedIndex={callState.selectedIndex}
          onFilterChange={setFilter}
          onMove={moveSelection}
          onSelect={selectCurrent}
          onExit={exitCallMode}
        />
      ) : callState.mode === "payload" && callState.selectedEndpoint ? (
        <PayloadInput
          endpoint={callState.selectedEndpoint}
          payloadDraft={callState.payloadDraft}
          onChange={setPayloadDraft}
          onSubmit={submitPayload}
          onExit={exitCallMode}
        />
      ) : (
        <CommandInput value={input} onChange={handleChange} onSubmit={handleSubmit} />
      )}

      {showSuggestions && limitedSuggestions.length > 0 ? (
        <Box flexDirection="column" marginLeft={2} marginTop={1}>
          {limitedSuggestions.map((entry, index) => (
            <Text key={`${entry.id}-${index}`} color={index === selectedIndex ? "cyan" : undefined}>
              {index === selectedIndex ? ">" : " "} {entry.id} - {entry.description}
            </Text>
          ))}
        </Box>
      ) : null}
    </Box>
  );
};

render(<App />);
