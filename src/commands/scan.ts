import type { CommandContext } from "./types";
import { collectControllerCandidates } from "../scan/file-scanner";
import { detectProjectType } from "../scan/project-detector";
import { extractEndpointsFromCandidates } from "../scan/llm-extractor";

export const runScan = async ({ client, log, setScanCache }: CommandContext) => {
  if (!client) {
    log("No LLM client initialized. Run /init first.");
    return;
  }

  const rootDir = process.cwd();
  const projectType = await detectProjectType(rootDir);

  if (projectType === "python") {
    log("Unsupported project type: python. Only supported projects for now are java projects.");
    return;
  }

  if (projectType !== "java") {
    log("Unsupported project type. Only supported projects for now are java projects.");
    return;
  }

  log(`Scanning ${rootDir} for Spring Boot @RestController endpoints...`);

  const { candidates, skippedFiles } = await collectControllerCandidates(rootDir);
  if (candidates.length === 0) {
    setScanCache({
      rootDir,
      scannedAt: new Date().toISOString(),
      endpoints: [],
      candidateFiles: [],
      skippedFiles,
    });
    log("No controller candidates found.");
    return;
  }

  log(`Found ${candidates.length} controller candidate(s). Calling the model...`);

  const { endpoints, errors, model } = await extractEndpointsFromCandidates(client, candidates);

  setScanCache({
    rootDir,
    scannedAt: new Date().toISOString(),
    endpoints,
    candidateFiles: candidates.map((candidate) => candidate.path),
    skippedFiles,
  });

  log(`Model ${model} extracted ${endpoints.length} endpoint(s).`);
  if (errors.length) {
    log(`Skipped ${errors.length} file(s) due to parse errors.`);
  }
  if (skippedFiles.length) {
    log(`Skipped ${skippedFiles.length} file(s) due to size or read errors.`);
  }
  log("Run /list-endpoints to review the cached endpoints.");
};
