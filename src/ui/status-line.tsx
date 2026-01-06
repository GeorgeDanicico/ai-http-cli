import { Box, Text } from "ink";
import type { StatusMessage, StatusState } from "./types";

const statusColor: Record<StatusState, string> = {
  pending: "yellow",
  info: "cyan",
  error: "red",
  success: "green",
};

type StatusLineProps = {
  status: StatusMessage | null;
  spinnerFrame: string;
};

export const StatusLine = ({ status, spinnerFrame }: StatusLineProps) => {
  if (!status) {
    return null;
  }

  return (
    <Box marginTop={1}>
      <Text color={statusColor[status.state]}>
        {status.state === "pending" && spinnerFrame ? `${spinnerFrame} ` : ""}
        {status.text}
      </Text>
    </Box>
  );
};
