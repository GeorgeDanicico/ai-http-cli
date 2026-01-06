import { Box, Text } from "ink";
import TextInput from "ink-text-input";

type CommandInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
};

export const CommandInput = ({ value, onChange, onSubmit }: CommandInputProps) => {
  return (
    <Box marginTop={1}>
      <Text color="green">{"> "}</Text>
      <TextInput value={value} onChange={onChange} onSubmit={onSubmit} />
    </Box>
  );
};
