import { describe, expect, it } from "bun:test";
import { commands } from "../src/commands/registry";
import { getSuggestions, normalizeInput, resolveCommand } from "../src/commands/utils";

describe("normalizeInput", () => {
  it("ensures leading slash", () => {
    expect(normalizeInput("init")).toBe("/init");
  });

  it("keeps a single slash", () => {
    expect(normalizeInput("//scan")).toBe("/scan");
  });

  it("defaults to slash", () => {
    expect(normalizeInput("")).toBe("/");
  });

  it("trims leading spaces", () => {
    expect(normalizeInput("   /help")).toBe("/help");
  });
});

describe("getSuggestions", () => {
  it("returns all commands for bare slash", () => {
    expect(getSuggestions("/", commands).length).toBe(commands.length);
  });

  it("matches by prefix", () => {
    const matches = getSuggestions("/he", commands).map((entry) => entry.id);
    expect(matches).toContain("/help");
  });

  it("matches aliases", () => {
    const matches = getSuggestions("/qui", commands).map((entry) => entry.id);
    expect(matches).toContain("/exit");
  });
});

describe("resolveCommand", () => {
  it("resolves by id", () => {
    const command = resolveCommand("/help", commands);
    expect(command?.id).toBe("/help");
  });

  it("resolves by alias", () => {
    const command = resolveCommand("/quit", commands);
    expect(command?.id).toBe("/exit");
  });
});
