#!/usr/bin/env node
import "dotenv/config";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Box, Text, render, useApp, useInput } from "ink";
import TextInput from "ink-text-input";
import type { LlmClient } from "./clients/types";
import { commands } from "./commands/registry";
import { getSuggestions, normalizeInput, parseInput, resolveCommand } from "./commands/utils";
import { FatalError } from "./errors";
import type { ScanCache } from "./scan/types";

const SUGGESTION_LIMIT = 6;

const App = () => {
  const { exit } = useApp();
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [client, setClient] = useState<LlmClient | null>(null);
  const [scanCache, setScanCache] = useState<ScanCache | null>(null);

  const log = useCallback((message: string) => {
    setHistory((prev) => [...prev, message]);
  }, []);

  const suggestions = useMemo(() => getSuggestions(input, commands), [input]);
  const limitedSuggestions = suggestions.slice(0, SUGGESTION_LIMIT);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    setSelectedIndex(0);
  }, [input, suggestions.length]);

  useInput((_, key) => {
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
      { client, setClient, scanCache, setScanCache, log, exit },
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

  const showSuggestions = !normalizeInput(input).slice(1).includes(" ");

  return (
    <Box flexDirection="column" padding={1}>
      <Text color="cyanBright">ai-http-cli</Text>
      <Text dimColor>Type / to see commands. Tab autocompletes. Up/Down to select.</Text>
      <Text dimColor>All inputs must start with /.</Text>

      {history.length > 0 ? (
        <Box flexDirection="column" marginTop={1}>
          {history.map((line, index) => (
            <Text key={`${index}-${line}`}>{line}</Text>
          ))}
        </Box>
      ) : null}

      <Box marginTop={1}>
        <Text color="green">{"> "}</Text>
        <TextInput value={input} onChange={handleChange} onSubmit={handleSubmit} />
      </Box>

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
