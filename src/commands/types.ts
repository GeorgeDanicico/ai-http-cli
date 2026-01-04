export type CommandContext = {
  log: (message: string) => void;
  exit: () => void;
};

export type Command = {
  id: string;
  description: string;
  aliases?: string[];
  run: (context: CommandContext, args: string[]) => Promise<void> | void;
};
