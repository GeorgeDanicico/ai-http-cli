import type { Command } from "./types";

export const normalizeInput = (value: string): string => {
  const trimmedStart = value.trimStart();
  if (trimmedStart === "") {
    return "";
  }

  const withoutLeadingSlash = trimmedStart.replace(/^\/+/, "");
  return `/${withoutLeadingSlash}`;
};

export const parseInput = (value: string): { command: string; args: string[]; raw: string } => {
  const normalized = normalizeInput(value).trim();
  const [command, ...args] = normalized.split(/\s+/);
  return {
    command: command ?? "",
    args,
    raw: normalized,
  };
};

export const resolveCommand = (value: string, available: Command[]): Command | undefined => {
  const { command } = parseInput(value);
  return available.find(
    (entry) => entry.id === command || entry.aliases?.includes(command),
  );
};

export const getSuggestions = (value: string, available: Command[]): Command[] => {
  const normalized = normalizeInput(value);

  if (!normalized) {
    return []
  }

  const [commandToken] = normalized.slice(1).split(/\s+/);
  const needle = commandToken?.toLowerCase() ?? "";

  if (!needle) {
    return available;
  }

  return available.filter((entry) => {
    const idMatches = entry.id.toLowerCase().startsWith(`/${needle}`);
    const aliasMatches = entry.aliases?.some((alias) =>
      alias.toLowerCase().startsWith(`/${needle}`),
    );

    return idMatches || Boolean(aliasMatches);
  });
};
