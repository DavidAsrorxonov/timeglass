"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { TimerStatus } from "@/types";

type UseTimerOptions = {
  onComplete?: () => void;
};

export function useTimer(options: UseTimerOptions = {}) {
  const { onComplete } = options;

  const [status, setStatus] = useState<TimerStatus>("idle");
  const [remainingMs, setRemainingMs] = useState(0);
  const [durationMs, setDurationMs] = useState(0);

  const completedRef = useRef(false);
  const endTimeRef = useRef<number | null>(null);
  const frameRef = useRef<number | null>(null);
  const onCompleteRef = useRef(onComplete);
  const pausedRemainingRef = useRef(0);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const clearFrame = useCallback(() => {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
  }, []);

  const tick = useCallback(function tickFrame() {
    if (endTimeRef.current === null) {
      return;
    }

    const remaining = Math.max(0, endTimeRef.current - Date.now());
    setRemainingMs(remaining);

    if (remaining <= 0) {
      clearFrame();
      endTimeRef.current = null;
      pausedRemainingRef.current = 0;
      setStatus("done");

      if (!completedRef.current) {
        completedRef.current = true;
        onCompleteRef.current?.();
      }

      return;
    }

    frameRef.current = requestAnimationFrame(tickFrame);
  }, [clearFrame]);

  const startTimer = useCallback(
    (duration: number) => {
      if (duration <= 0) {
        return;
      }

      clearFrame();
      completedRef.current = false;
      pausedRemainingRef.current = duration;
      endTimeRef.current = Date.now() + duration;

      setDurationMs(duration);
      setRemainingMs(duration);
      setStatus("running");

      frameRef.current = requestAnimationFrame(tick);
    },
    [clearFrame, tick],
  );

  const pause = useCallback(() => {
    if (status !== "running") {
      return;
    }

    clearFrame();
    pausedRemainingRef.current =
      endTimeRef.current === null
        ? remainingMs
        : Math.max(0, endTimeRef.current - Date.now());
    endTimeRef.current = null;
    setRemainingMs(pausedRemainingRef.current);
    setStatus("paused");
  }, [clearFrame, remainingMs, status]);

  const resume = useCallback(() => {
    if (status !== "paused" || pausedRemainingRef.current <= 0) {
      return;
    }

    clearFrame();
    endTimeRef.current = Date.now() + pausedRemainingRef.current;
    setStatus("running");

    frameRef.current = requestAnimationFrame(tick);
  }, [clearFrame, status, tick]);

  const reset = useCallback(() => {
    clearFrame();
    completedRef.current = false;
    endTimeRef.current = null;
    pausedRemainingRef.current = 0;

    setStatus("idle");
    setRemainingMs(0);
    setDurationMs(0);
  }, [clearFrame]);

  useEffect(() => {
    return () => {
      clearFrame();
    };
  }, [clearFrame]);

  const progress =
    durationMs > 0 ? Math.max(0, Math.min(1, remainingMs / durationMs)) : 0;

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
