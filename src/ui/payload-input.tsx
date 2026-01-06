import { Box, Text, useInput } from "ink";
import TextInput from "ink-text-input";
import type { Endpoint } from "../scan/types";

type PayloadInputProps = {
  endpoint: Endpoint;
  payloadDraft: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onExit: () => void;
};

export const PayloadInput = ({
  endpoint,
  payloadDraft,
  onChange,
  onSubmit,
  onExit,
}: PayloadInputProps) => {
  useInput((_, key) => {
    if (key.escape) {
      onExit();
    }
  });

  return (
    <Box flexDirection="column" marginTop={1}>
      <Text>
        Payload for {endpoint.method} {endpoint.path} (Enter to call, Esc to cancel)
      </Text>
      <Box marginTop={1}>
        <Text dimColor>Body: </Text>
        <TextInput value={payloadDraft} onChange={onChange} onSubmit={onSubmit} />
      </Box>
    </Box>
  );
};
