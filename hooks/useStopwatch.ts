"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { LapEntry, StopwatchStatus } from "@/types";

export function useStopwatch() {
  const [status, setStatus] = useState<StopwatchStatus>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [laps, setLaps] = useState<LapEntry[]>([]);

  const startTimeRef = useRef<number | null>(null);
  const accumulatedRef = useRef(0);
  const lastLapTotalRef = useRef(0);
  const frameRef = useRef<number | null>(null);

  const clearFrame = useCallback(() => {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
  }, []);

  const getCurrentElapsed = useCallback(() => {
    if (startTimeRef.current === null) {
      return accumulatedRef.current;
    }

    return accumulatedRef.current + performance.now() - startTimeRef.current;
  }, []);

  const tick = useCallback(
    function tickFrame() {
      const currentElapsed = getCurrentElapsed();

      setElapsed(currentElapsed);
      frameRef.current = requestAnimationFrame(tickFrame);
    },
    [getCurrentElapsed],
  );

  const start = useCallback(() => {
    if (status === "running") {
      return;
    }

    clearFrame();
    startTimeRef.current = performance.now();
    setStatus("running");

    frameRef.current = requestAnimationFrame(tick);
  }, [clearFrame, status, tick]);

  const stop = useCallback(() => {
    if (status !== "running") {
      return;
    }

    clearFrame();
    accumulatedRef.current = getCurrentElapsed();
    startTimeRef.current = null;

    setElapsed(accumulatedRef.current);
    setStatus("paused");
  }, [clearFrame, getCurrentElapsed, status]);

  const reset = useCallback(() => {
    clearFrame();
    startTimeRef.current = null;
    accumulatedRef.current = 0;
    lastLapTotalRef.current = 0;

    setStatus("idle");
    setElapsed(0);
    setLaps([]);
  }, [clearFrame]);

  const lap = useCallback(() => {
    if (status !== "running") {
      return;
    }

    const totalTime = getCurrentElapsed();
    const lapTime = totalTime - lastLapTotalRef.current;
    lastLapTotalRef.current = totalTime;

    setElapsed(totalTime);
    setLaps((previous) => [
      {
        index: previous.length + 1,
        lapTime,
        totalTime,
      },
      ...previous,
    ]);
  }, [getCurrentElapsed, status]);

  useEffect(() => {
    return () => {
      clearFrame();
    };
  }, [clearFrame]);

  const bestLapIndex = useMemo(() => {
    if (laps.length === 0) {
      return null;
    }

    return laps.reduce((bestIndex, lap, index, allLaps) => {
      return lap.lapTime < allLaps[bestIndex].lapTime ? index : bestIndex;
    }, 0);
  }, [laps]);

  const worstLapIndex = useMemo(() => {
    if (laps.length === 0) {
      return null;
    }

    return laps.reduce((worstIndex, lap, index, allLaps) => {
      return lap.lapTime > allLaps[worstIndex].lapTime ? index : worstIndex;
    }, 0);
  }, [laps]);

  return {
    status,
    elapsed,
    laps,
    bestLapIndex,
    worstLapIndex,
    start,
    stop,
    reset,
    lap,
  };
}
