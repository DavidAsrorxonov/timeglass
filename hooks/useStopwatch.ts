"use client";

import { useCallback, useState } from "react";
import type { LapEntry, StopwatchStatus } from "@/types";

export function useStopwatch() {
  const [status, setStatus] = useState<StopwatchStatus>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [laps, setLaps] = useState<LapEntry[]>([]);

  const start = useCallback(() => {
    setStatus("running");
  }, []);

  const stop = useCallback(() => {
    setStatus("paused");
  }, []);

  const reset = useCallback(() => {
    setStatus("idle");
    setElapsed(0);
    setLaps([]);
  }, []);

  const lap = useCallback(() => {
    setLaps((previous) => [
      {
        index: previous.length + 1,
        lapTime: elapsed,
        totalTime: elapsed,
      },
      ...previous,
    ]);
  }, [elapsed]);

  return {
    status,
    elapsed,
    laps,
    start,
    stop,
    reset,
    lap,
  };
}
