# ai-http-cli

Interactive CLI that will scan Spring Boot codebases for callable endpoints and run them with mock data (scanning and execution are placeholders for now).

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

### Available commands
- `/init` - Initialize the session (OpenAI if `OPENAI_API_KEY` is set, otherwise Ollama)
- `/scan` - Scan a Spring Boot codebase (placeholder)
- `/help` - List commands
- `/exit` - Quit the CLI
