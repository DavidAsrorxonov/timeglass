"use client";

import { useCallback, useState } from "react";
import type { PomodoroPhase, PomodoroSession } from "@/types";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { STORAGE_KEYS } from "@/lib/storage-keys";

const DEFAULT_SESSION: PomodoroSession = {
  completedPomodoros: 0,
  totalFocusMinutes: 0,
  streak: 0,
};

export function usePomodoro() {
  const [phase, setPhase] = useState<PomodoroPhase>("idle");
  const [cycleCount, setCycleCount] = useState(0);
  const [stats, setStats, clearStats] = useLocalStorage<PomodoroSession>(
    STORAGE_KEYS.POMODORO_STATS,
    DEFAULT_SESSION,
  );

  const startFocus = useCallback(() => {
    setPhase("focus");
  }, []);

  const startBreak = useCallback(() => {
    setPhase("break");
  }, []);

  const reset = useCallback(() => {
    setPhase("idle");
    setCycleCount(0);
  }, []);

  const completeFocusSession = useCallback(() => {
    setCycleCount((previous) => previous + 1);

    setStats((previous) => ({
      ...previous,
      completedPomodoros: previous.completedPomodoros + 1,
      totalFocusMinutes: previous.totalFocusMinutes + 25,
      lastDate: new Date().toISOString().slice(0, 10),
    }));

    setPhase("break");
  }, [setStats]);

  return {
    phase,
    cycleCount,
    stats,
    startFocus,
    startBreak,
    reset,
    completeFocusSession,
    clearStats,
  };
}
