import type { Spinner } from "cli-spinners";
import { useEffect, useRef, useState } from "react";

export function useSpinner(spinnerDef: any) {
  const spinner = useRef(spinnerDef);
  const [frame, setFrame] = useState("");

  useEffect(() => {
    let i = 0;
    const { frames, interval } = spinner.current;
    const id = setInterval(() => setFrame(frames[i++ % frames.length]), interval);
    return () => clearInterval(id);
  }, []);

  return frame;
}