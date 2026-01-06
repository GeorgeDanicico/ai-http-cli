# ai-http-cli

Interactive CLI that scans Spring Boot Java codebases for REST endpoints using an LLM and lists them for the current session.

## Requirements
- Bun

## Setup
```bash
bun install
```

## Environment
Create a local `.env` (not committed) with your OpenAI key or rely on a local Ollama instance. See `.env.example` for a template.

```bash
OPENAI_API_KEY=your-token
# Optional overrides
OPENAI_BASE_URL=https://api.openai.com/v1
OLLAMA_HOST=http://127.0.0.1:11434
# Optional model overrides
AI_HTTP_CLI_MODEL=gpt-4o-mini
# OPENAI_MODEL=gpt-4o-mini
# OLLAMA_MODEL=llama3.1
```

## Run (dev)
```bash
bun run dev
```

## Build and run
```bash
bun run build
bun run start
```

## Usage
- All inputs must start with `/`.
- Type `/` to see suggestions.
- Use `Tab` to autocomplete and `Up/Down` to select a suggestion.
- If `OPENAI_API_KEY` is unset and Ollama is unreachable, `/init` exits the CLI.
- `/scan` only supports Spring Boot Java projects and will error on other project types.

### Scan behavior
- Detects Java projects via build markers (Maven/Gradle) or `src/main/java`.
- Looks for `@RestController` files with mapping annotations.
- Uses the configured LLM to extract method, path, handler name, and optional payload shape.
- Caches results in-session for `/list-endpoints`.

### Available commands
- `/init` - Initialize the session (OpenAI if `OPENAI_API_KEY` is set, otherwise Ollama)
- `/scan` - Scan a Spring Boot codebase (Java + @RestController only)
- `/list-endpoints` - List endpoints found in the last scan
- `/call` - Interactively call an endpoint from the last scan (defaults to http://localhost:8080)
- `/help` - List commands
- `/exit` - Quit the CLI
