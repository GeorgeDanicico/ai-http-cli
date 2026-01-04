import { afterEach, describe, expect, it } from "bun:test";
import { mkdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { detectProjectType } from "../src/scan/project-detector";
import { parseEndpointsFromModel } from "../src/scan/endpoint-parser";

const createTempDir = async (files: string[]): Promise<string> => {
  const dir = path.join(os.tmpdir(), "ai-http-cli-");
  await mkdir(dir, { recursive: true });
  const uniqueDir = path.join(
    dir,
    `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  );
  await mkdir(uniqueDir, { recursive: true });

  for (const file of files) {
    const filePath = path.join(uniqueDir, file);
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, "placeholder", "utf8");
  }

  return uniqueDir;
};

describe("detectProjectType", () => {
  let tempDir: string | null = null;

  afterEach(async () => {
    if (tempDir) {
      await rm(tempDir, { recursive: true, force: true });
      tempDir = null;
    }
  });

  it("detects java by build files", async () => {
    tempDir = await createTempDir(["pom.xml"]);
    const type = await detectProjectType(tempDir);
    expect(type).toBe("java");
  });

  it("detects python by marker files", async () => {
    tempDir = await createTempDir(["pyproject.toml"]);
    const type = await detectProjectType(tempDir);
    expect(type).toBe("python");
  });

  it("returns unknown when no markers are present", async () => {
    tempDir = await createTempDir([]);
    const type = await detectProjectType(tempDir);
    expect(type).toBe("unknown");
  });
});

describe("parseEndpointsFromModel", () => {
  it("normalizes methods and paths", () => {
    const content = JSON.stringify({
      endpoints: [
        { method: "get", path: "api/users", operation: "listUsers", payload: null },
        {
          method: "POST",
          path: "/users",
          operation: "createUser",
          payload: { name: "String", age: "int" },
        },
      ],
    });
    const endpoints = parseEndpointsFromModel(content, "UserController.java");
    expect(endpoints.length).toBe(2);
    expect(endpoints[0]?.method).toBe("GET");
    expect(endpoints[0]?.path).toBe("/api/users");
    expect(endpoints[1]?.payload).toEqual({ name: "String", age: "int" });
  });

  it("accepts array response", () => {
    const content = JSON.stringify([{ method: "GET", path: "/health", operation: null }]);
    const endpoints = parseEndpointsFromModel(content, "HealthController.java");
    expect(endpoints.length).toBe(1);
    expect(endpoints[0]?.path).toBe("/health");
  });

  it("throws on invalid content", () => {
    expect(() => parseEndpointsFromModel("no json here", "Bad.java")).toThrow();
  });
});
