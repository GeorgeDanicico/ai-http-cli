import { Box, Text } from "ink";
import type { StatusMessage, StatusState } from "./types";
import cliSpinners from "cli-spinners";
import { useSpinner } from "../hooks/useSpinner";

const statusColor: Record<StatusState, string> = {
  pending: "yellow",
  info: "cyan",
  error: "red",
  success: "green",
};

type StatusLineProps = {
  status: StatusMessage | null;
};

export const StatusLine = ({ status }: StatusLineProps) => {
  const spinner = useSpinner(cliSpinners.dots);

  if (!status) {
    return null;
  }

  return (
    <Box marginTop={1}>
      <Text color={statusColor[status.state]}>
        {status.state === "pending" ? `${spinner} ` : ""}
        {status.text}
      </Text>
    </Box>
  );
};
