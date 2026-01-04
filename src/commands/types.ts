import type { LlmClient } from "../clients/types";

export type CommandContext = {
  client: LlmClient | null;
  setClient: (client: LlmClient | null) => void;
  log: (message: string) => void;
  exit: () => void;
};

export type Command = {
  id: string;
  description: string;
  aliases?: string[];
  run: (context: CommandContext, args: string[]) => Promise<void> | void;
};
