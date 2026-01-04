import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import type { ControllerCandidate } from "./types";

const IGNORE_DIRS = new Set([
  ".git",
  "node_modules",
  "dist",
  "build",
  "target",
  "out",
  ".idea",
  ".gradle",
]);

const MAX_SOURCE_BYTES = 250_000;

const REST_CONTROLLER_PATTERN = /@RestController\b/;
const MAPPING_PATTERN = /@(GetMapping|PostMapping|PutMapping|DeleteMapping|PatchMapping|RequestMapping)\b/;

const isIgnoredDir = (dirName: string): boolean => IGNORE_DIRS.has(dirName);

const walkJavaFiles = async (rootDir: string): Promise<string[]> => {
  const entries = await readdir(rootDir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const resolvedPath = path.join(rootDir, entry.name);

    if (entry.isDirectory()) {
      if (isIgnoredDir(entry.name)) {
        continue;
      }
      files.push(...(await walkJavaFiles(resolvedPath)));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith(".java")) {
      files.push(resolvedPath);
    }
  }

  return files;
};

export const collectControllerCandidates = async (
  rootDir: string,
): Promise<{ candidates: ControllerCandidate[]; skippedFiles: string[] }> => {
  const javaFiles = await walkJavaFiles(rootDir);
  const candidates: ControllerCandidate[] = [];
  const skippedFiles: string[] = [];

  for (const filePath of javaFiles) {
    try {
      const stats = await stat(filePath);
      if (stats.size > MAX_SOURCE_BYTES) {
        skippedFiles.push(filePath);
        continue;
      }

      const source = await readFile(filePath, "utf8");
      if (!REST_CONTROLLER_PATTERN.test(source)) {
        continue;
      }
      if (!MAPPING_PATTERN.test(source)) {
        continue;
      }

      candidates.push({ path: filePath, source });
    } catch {
      skippedFiles.push(filePath);
    }
  }

  return { candidates, skippedFiles };
};
