import { useCallback, useEffect, useState } from "react";
import type { StatusMessage } from "../ui/types";

export const useStatus = () => {
  const [status, setStatus] = useState<StatusMessage | null>(null);

  const clearStatus = useCallback(() => {
    setStatus(null);
  }, []);

  return { status, setStatus, clearStatus };
};
