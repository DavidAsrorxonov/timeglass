"use client";

import { useCallback, useState } from "react";
import type { TimerStatus } from "@/types";

export function useTimer() {
  const [status, setStatus] = useState<TimerStatus>("idle");
  const [remainingMs, setRemainingMs] = useState(0);
  const [durationMs, setDurationMs] = useState(0);

  const startTimer = useCallback((duration: number) => {
    setDurationMs(duration);
    setRemainingMs(duration);
    setStatus("running");
  }, []);

  const pause = useCallback(() => {
    setStatus("paused");
  }, []);

  const resume = useCallback(() => {
    setStatus("running");
  }, []);

  const reset = useCallback(() => {
    setStatus("idle");
    setRemainingMs(0);
    setDurationMs(0);
  }, []);

  const progress = durationMs > 0 ? remainingMs / durationMs : 0;

  return {
    status,
    remainingMs,
    durationMs,
    progress,
    startTimer,
    pause,
    resume,
    reset,
  };
}
