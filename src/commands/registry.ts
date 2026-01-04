import { runInit } from "./init";
import type { Command } from "./types";

export const commands: Command[] = [
  {
    id: "/init",
    description: "Initialize the ai-http-cli session and LLM client",
    run: runInit,
  },
  {
    id: "/scan",
    description: "Scan a Spring Boot codebase for endpoints (placeholder)",
    run: ({ log }) => {
      log("Spring Boot scanning not implemented yet.");
    },
  },
  {
    id: "/help",
    description: "Show available commands",
    aliases: ["/commands", "/?"],
    run: ({ log }) => {
      log("Available commands:");
      for (const command of commands) {
        const aliasText = command.aliases?.length ? ` (aliases: ${command.aliases.join(", ")})` : "";
        log(`  ${command.id} - ${command.description}${aliasText}`);
      }
    },
  },
  {
    id: "/exit",
    description: "Exit the CLI",
    aliases: ["/quit"],
    run: ({ exit }) => {
      exit();
    },
  },
];
