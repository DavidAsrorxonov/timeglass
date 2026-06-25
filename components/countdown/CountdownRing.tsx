"use client";

import { motion, useReducedMotion } from "framer-motion";
import { CircularProgress } from "@/components/ui/CircularProgress";
import type { TimerStatus } from "@/types";

type CountdownRingProps = {
  remainingMs: number;
  progress: number;
  status: TimerStatus;
};

export function formatDuration(ms: number) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0",
  )}:${String(seconds).padStart(2, "0")}`;
}

const STATUS_LABELS: Record<TimerStatus, string> = {
  idle: "Ready",
  running: "Running",
  paused: "Paused",
  done: "Done",
};

export function CountdownRing({
  remainingMs,
  progress,
  status,
}: CountdownRingProps) {
  const reduceMotion = useReducedMotion();
  const isDanger = status === "running" && progress > 0 && progress <= 0.1;
  const isDone = status === "done";

  return (
    <div className="relative mx-auto flex aspect-square w-full max-w-[300px] items-center justify-center sm:max-w-[330px]">
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={
          isDone && !reduceMotion ? { scale: [1, 1.035, 1] } : undefined
        }
        transition={{ duration: 0.8, repeat: isDone ? Infinity : 0 }}
      >
        <CircularProgress
          value={progress}
          size={300}
          strokeWidth={14}
          danger={isDanger}
          success={isDone}
          className="h-full w-full"
        />
      </motion.div>

      <div className="relative z-10 flex flex-col items-center justify-center text-center">
        <p className="font-mono text-xs uppercase tracking-[0.35em] text-(--text-muted)">
          {STATUS_LABELS[status]}
        </p>

        <p className="mt-3 font-mono text-4xl font-semibold text-foreground sm:text-5xl">
          {formatDuration(remainingMs)}
        </p>

        {isDanger && (
          <p className="mt-3 text-sm font-medium text-(--accent-danger)">
            Almost finished
          </p>
        )}
      </div>
    </div>
  );
}
