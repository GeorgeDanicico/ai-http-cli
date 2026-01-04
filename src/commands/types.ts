import type { LlmClient } from "../clients/types";
import type { ScanCache } from "../scan/types";

export type CommandContext = {
  client: LlmClient | null;
  setClient: (client: LlmClient | null) => void;
  scanCache: ScanCache | null;
  setScanCache: (cache: ScanCache | null) => void;
  log: (message: string) => void;
  exit: () => void;
};

export type Command = {
  id: string;
  description: string;
  aliases?: string[];
  run: (context: CommandContext, args: string[]) => Promise<void> | void;
};
