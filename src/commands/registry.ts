import { runCall } from "./call";
import { runInit } from "./init";
import { runListEndpoints } from "./list-endpoints";
import { runScan } from "./scan";
import type { Command } from "./types";

export const commands: Command[] = [
  {
    id: "/init",
    description: "Initialize the ai-http-cli session and LLM client",
    run: runInit,
  },
  {
    id: "/scan",
    description: "Scan a Spring Boot codebase for endpoints",
    run: runScan,
  },
  {
    id: "/call",
    description: "Call an endpoint from the last scan",
    run: runCall,
  },
  {
    id: "/list-endpoints",
    description: "List endpoints found in the last scan",
    run: runListEndpoints,
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
