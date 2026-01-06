import { useCallback, useState } from "react";

export const useHistory = () => {
  const [history, setHistory] = useState<string[]>([]);

  const log = useCallback((message: string) => {
    setHistory((prev) => [...prev, message]);
  }, []);

  return { history, log };
};
