"use client";

import { motion } from "framer-motion";
import { CircularProgress } from "@/components/ui/CircularProgress";
import type { PomodoroPhase } from "@/types";

type PomodoroRingProps = {
  phase: PomodoroPhase;
  remainingMs: number;
  progress: number;
  isLongBreak?: boolean;
};

function formatDuration(ms: number) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
    2,
    "0",
  )}`;
}

export function PomodoroRing({
  phase,
  remainingMs,
  progress,
  isLongBreak = false,
}: PomodoroRingProps) {
  const isBreak = phase === "break";
  const label =
    phase === "idle"
      ? "Ready"
      : isBreak
        ? isLongBreak
          ? "Long Break"
          : "Break"
        : "Focus";
  const helperText =
    phase === "idle"
      ? "Start when you are ready."
      : isBreak
        ? "Rest and reset."
        : "Stay with one task.";
  const animation =
    phase === "idle" ? undefined : { scale: isBreak ? [1, 1.01, 1] : [1, 1.015, 1] };

  return (
    <div
      className="relative mx-auto flex size-[17rem] items-center justify-center sm:size-[19rem]"
      aria-label={`${label} timer, ${formatDuration(remainingMs)} remaining`}
    >
      <motion.div
        animate={animation}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <CircularProgress
          value={progress}
          size={288}
          strokeWidth={14}
          success={isBreak}
          className="size-[17rem] sm:size-[18rem]"
        />
      </motion.div>

      <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.28em] text-(--text-muted)">
          {label}
        </p>

        <p className="mt-3 font-mono text-5xl font-semibold leading-none text-foreground sm:text-6xl">
          {formatDuration(remainingMs)}
        </p>

        <p className="mt-3 text-sm text-(--text-muted)">{helperText}</p>
      </div>
    </div>
  );
}
