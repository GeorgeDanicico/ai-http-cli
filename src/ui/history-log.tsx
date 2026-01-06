import { Box, Text } from "ink";

type HistoryLogProps = {
  history: string[];
};

export const HistoryLog = ({ history }: HistoryLogProps) => {
  if (history.length === 0) {
    return null;
  }

  return (
    <Box flexDirection="column" marginTop={1}>
      {history.map((line, index) => (
        <Text key={`${index}-${line}`}>{line}</Text>
      ))}
    </Box>
  );
};
