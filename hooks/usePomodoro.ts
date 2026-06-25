"use client";

import { useCallback, useMemo, useState } from "react";
import type { PomodoroPhase, PomodoroSession } from "@/types";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { STORAGE_KEYS } from "@/lib/storage-keys";

export const FOCUS_DURATION = 25 * 60 * 1000;
export const SHORT_BREAK_DURATION = 5 * 60 * 1000;
export const LONG_BREAK_DURATION = 15 * 60 * 1000;
export const SESSIONS_BEFORE_LONG_BREAK = 4;

const DEFAULT_SESSION: PomodoroSession = {
  completedPomodoros: 0,
  totalFocusMinutes: 0,
  streak: 0,
};

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function getYesterdayKey() {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return date.toISOString().slice(0, 10);
}

function calculateNextStreak(previousDate?: string, currentStreak = 0) {
  const today = getTodayKey();
  const yesterday = getYesterdayKey();

  if (previousDate === today) {
    return currentStreak;
  }

  if (previousDate === yesterday) {
    return currentStreak + 1;
  }

  return 1;
}

export function usePomodoro() {
  const [phase, setPhase] = useState<PomodoroPhase>("idle");
  const [cycleCount, setCycleCount] = useState(0);
  const [useLongBreak, setUseLongBreak] = useState(false);
  const [stats, setStats, clearStats] = useLocalStorage<PomodoroSession>(
    STORAGE_KEYS.POMODORO_STATS,
    DEFAULT_SESSION,
  );

  const currentDuration = useMemo(() => {
    if (phase === "focus") {
      return FOCUS_DURATION;
    }

    if (phase === "break") {
      return useLongBreak ? LONG_BREAK_DURATION : SHORT_BREAK_DURATION;
    }

    return FOCUS_DURATION;
  }, [phase, useLongBreak]);

  const startFocus = useCallback(() => {
    setPhase("focus");
    setUseLongBreak(false);
  }, []);

  const startBreak = useCallback((longBreak = false) => {
    setPhase("break");
    setUseLongBreak(longBreak);
  }, []);

  const reset = useCallback(() => {
    setPhase("idle");
    setCycleCount(0);
    setUseLongBreak(false);
  }, []);

  const completeFocusSession = useCallback(() => {
    const nextCycleCount = cycleCount + 1;
    const shouldUseLongBreak =
      nextCycleCount % SESSIONS_BEFORE_LONG_BREAK === 0;

    setCycleCount(nextCycleCount);

    setStats((previous) => {
      const today = getTodayKey();

      return {
        completedPomodoros: previous.completedPomodoros + 1,
        totalFocusMinutes: previous.totalFocusMinutes + 25,
        streak: calculateNextStreak(previous.lastDate, previous.streak),
        lastDate: today,
      };
    });

    startBreak(shouldUseLongBreak);
  }, [cycleCount, setStats, startBreak]);

  const completeBreakSession = useCallback(() => {
    setPhase("focus");
    setUseLongBreak(false);
  }, []);

  const skipPhase = useCallback(() => {
    if (phase === "focus") {
      startBreak(false);
      return;
    }

    if (phase === "break") {
      completeBreakSession();
      return;
    }

    startFocus();
  }, [completeBreakSession, phase, startBreak, startFocus]);

  return {
    phase,
    cycleCount,
    useLongBreak,
    currentDuration,
    stats,
    startFocus,
    startBreak,
    reset,
    completeFocusSession,
    completeBreakSession,
    skipPhase,
    clearStats,
  };
}
