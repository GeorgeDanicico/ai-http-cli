# Repository Guidelines

This repository targets Bun as the package manager/runtime with Node compatibility and TypeScript for implementation. Use this guide to keep the layout and workflows consistent as the codebase grows.

## Project Structure & Module Organization
- `README.md` contains the project overview and usage notes.
- Expect `src/` for TypeScript source (with feature folders like `src/commands/` and `src/clients/`), `tests/` for automated checks, and `docs/` for deeper documentation.
- Build output should live in `dist/` and remain out of version control.
- Keep modules small and cohesive; prefer feature-oriented folders once there are multiple CLI commands or subcommands.

## Build, Test, and Development Commands
These scripts are now defined in `package.json` and should be kept consistent:
- `bun install` — install dependencies.
- `bun run dev` — run the local development entry (for example, watch mode).
- `bun run build` — compile TypeScript into `dist/`.
- `bun run start` — run the built CLI from `dist/`.
- `bun test` — execute the test suite with Bun’s test runner.
- `bun run lint` / `bun run format` — lint and format sources.

## Coding Style & Naming Conventions
- Use TypeScript throughout; avoid adding plain JavaScript files unless needed for tooling.
- Prefer ES modules, explicit types at module boundaries, and `type` aliases for shared shapes.
- Use 2-space indentation and keep file names kebab-case (for example, `http-client.ts`).
- Apply consistent formatting; if Prettier/ESLint are introduced, match their defaults and document any overrides.

## Testing Guidelines
- Use Bun’s built-in test runner (`bun test`).
- Name test files `*.test.ts` and keep them under `tests/` for now.
- Aim for coverage on core CLI flows and any parsing/validation utilities.

## Commit & Pull Request Guidelines
- Git history currently only includes “Initial commit,” so no convention is established.
- Use concise, imperative commit subjects (for example, “Add request config loader”); include issue references when helpful.
- Pull requests should include a short summary, relevant links, and a quick verification note (command + expected output).

## Configuration & Secrets
- If environment variables are needed, document them in `README.md` and provide a `.env.example`.
- Do not commit secrets; keep local overrides in `.env` or shell profiles.

## Keeping Docs Accurate
- Update `README.md` and this file whenever you add new scripts, directories, or tooling so contributors can onboard quickly.
