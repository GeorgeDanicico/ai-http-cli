# ai-http-cli Research Notes

## Overview
ai-http-cli is an interactive terminal UI (Ink + React) that scans Spring Boot Java projects for HTTP endpoints and caches them for the current session. It uses a configured LLM (OpenAI or Ollama) to parse controller source files and extract endpoint definitions, including HTTP method, path, handler name, and optional payload shape.

## Runtime and Tooling
- Runtime: Bun (with Node compatibility).
- Language: TypeScript (ES modules).
- UI: Ink + ink-text-input for a terminal UI with slash commands.
- LLM Clients: OpenAI and Ollama.
- Progress display: cli-spinner for a status line spinner.

## Command Flow
All commands are entered with a leading `/`.
- `/init`: Initializes the LLM client.
  - If `OPENAI_API_KEY` is set, it tries OpenAI first.
  - On failure (or missing key), it falls back to Ollama.
  - Shows status messages with a spinner while initializing.
- `/scan`: Scans the current working directory for Spring Boot endpoints.
  - Java only; Python/unknown project types are rejected.
  - Shows status messages with a spinner while parsing and calling the model.
  - Caches results in-session.
- `/list-endpoints`: Lists endpoints from the last scan (method, path, handler, payload).
- `/call`: Interactive endpoint caller for the cached scan (defaults to `http://localhost:8080`).
- `/help`, `/exit`: Utility commands.

## LLM Selection
The LLM is chosen at runtime:
- If `OPENAI_API_KEY` is set, OpenAI is attempted first.
- If OpenAI fails or the key is missing, it falls back to Ollama.
- Model name defaults:
  - OpenAI: `gpt-4o-mini`
  - Ollama: `llama3.1`
- Override via env: `AI_HTTP_CLI_MODEL` (global), or `OPENAI_MODEL`, `OLLAMA_MODEL`.

## Scan Workflow
1. **Project detection** (`src/scan/project-detector.ts`):
   - Java markers (e.g., `pom.xml`, `build.gradle`, `src/main/java`).
   - Python markers (e.g., `pyproject.toml`, `requirements.txt`).
2. **Candidate discovery** (`src/scan/file-scanner.ts`):
   - Recursively finds `.java` files (excluding common build/IDE dirs).
   - Filters for files with `@RestController` and mapping annotations.
   - Skips very large files (> 250 KB).
3. **LLM extraction** (`src/scan/llm-extractor.ts`):
   - Sends each candidate file to the model with a strict JSON schema request.
   - Parses JSON response and normalizes methods/paths.
   - Dedupe by `method + path`.
4. **Cache results** (`ScanCache`):
   - Stored in the CLI session for `/list-endpoints`.

## Endpoint Schema
Defined in `src/scan/types.ts`:
```
type Endpoint = {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "OPTIONS" | "HEAD";
  path: string;
  operation: string | null; // handler method name
  payload: Record<string, string> | string | null;
  sourceFile: string;
};
```

## UI Behavior
- Status line is shown above history output.
- Spinner is displayed for `"pending"` status only.
- History log remains for command output; status is ephemeral.
- `/call` opens a selectable list with arrow navigation and an optional payload input step.

## Environment Variables
Core settings (documented in `.env.example` and `README.md`):
- `OPENAI_API_KEY`, `OPENAI_BASE_URL`
- `OLLAMA_HOST`
- `AI_HTTP_CLI_MODEL`
- Optional: `OPENAI_MODEL`, `OLLAMA_MODEL`

## Key Files
- `src/cli.tsx`: Ink UI, command execution, status line/spinner.
- `src/commands/registry.ts`: Command registration.
- `src/commands/init.ts`: LLM client initialization.
- `src/commands/scan.ts`: Scan orchestration + caching.
- `src/commands/list-endpoints.ts`: Cache display.
- `src/scan/*`: Detection, file scanning, LLM extraction, parsing, types.
- `src/clients/*`: OpenAI and Ollama clients + factory logic.

## Tests
- `tests/scan-utils.test.ts`: Project detection + JSON parsing.
- `tests/commands-utils.test.ts`: Command parsing and suggestions.

## Current Limitations
- Only Spring Boot Java projects are supported.
- Only `@RestController` and mapping annotations are targeted.
- Payload shapes are inferred by the LLM and may be incomplete.
- No persistence beyond the running CLI session.
