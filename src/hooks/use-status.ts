import { useCallback, useEffect, useState } from "react";
import { Spinner } from "cli-spinner";
import type { StatusMessage } from "../ui/types";

export const useStatus = () => {
  const [status, setStatus] = useState<StatusMessage | null>(null);
  const [spinnerFrame, setSpinnerFrame] = useState("");

  const clearStatus = useCallback(() => {
    setStatus(null);
  }, []);

  useEffect(() => {
    if (!status || status.state !== "pending") {
      setSpinnerFrame("");
      return;
    }

    const spinner = new Spinner({
      text: "%s",
      onTick: (message: string) => setSpinnerFrame(message),
    });
    spinner.setSpinnerString(0);
    spinner.setSpinnerDelay(80);
    spinner.start();

    return () => {
      spinner.stop();
    };
  }, [status?.state, status?.text]);

  return { status, setStatus, clearStatus, spinnerFrame };
};
