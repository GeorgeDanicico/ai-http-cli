import { Box, Text, useInput } from "ink";
import TextInput from "ink-text-input";
import type { Endpoint } from "../scan/types";

type EndpointPickerProps = {
  endpoints: Endpoint[];
  filter: string;
  selectedIndex: number;
  onFilterChange: (value: string) => void;
  onSelect: () => void;
  onMove: (delta: number) => void;
  onExit: () => void;
};

export const EndpointPicker = ({
  endpoints,
  filter,
  selectedIndex,
  onFilterChange,
  onSelect,
  onMove,
  onExit,
}: EndpointPickerProps) => {
  useInput((_, key) => {
    if (key.upArrow) {
      onMove(-1);
    }
    if (key.downArrow) {
      onMove(1);
    }
    if (key.escape) {
      onExit();
    }
  });

  return (
    <Box flexDirection="column" marginTop={1}>
      <Text>Select an endpoint (Enter to choose, Esc to cancel).</Text>
      <Box marginTop={1}>
        <Text dimColor>Filter: </Text>
        <TextInput value={filter} onChange={onFilterChange} onSubmit={onSelect} />
      </Box>

      {endpoints.length === 0 ? (
        <Box marginTop={1}>
          <Text dimColor>No endpoints match the current filter.</Text>
        </Box>
      ) : (
        <Box flexDirection="column" marginTop={1} marginLeft={2}>
          {endpoints.map((endpoint, index) => {
            const selected = index === selectedIndex;
            const suffix = endpoint.operation ? ` - ${endpoint.operation}` : "";
            return (
              <Text key={`${endpoint.method}-${endpoint.path}-${index}`} color={selected ? "cyan" : undefined}>
                {selected ? ">" : " "} {endpoint.method} {endpoint.path}
                {suffix}
              </Text>
            );
          })}
        </Box>
      )}
    </Box>
  );
};
