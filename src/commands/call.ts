import type { CommandContext } from "./types";

export const runCall = ({ enterCallMode }: CommandContext) => {
  enterCallMode();
};
