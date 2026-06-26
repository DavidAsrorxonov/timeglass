"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Clipboard } from "lucide-react";
import { LapEmptyState } from "@/components/empty-states/LapEmptyState";
import type { LapEntry } from "@/types";

type LapListProps = {
  laps: LapEntry[];
  bestLapIndex: number | null;
  worstLapIndex: number | null;
  onCopy: () => void;
};

function formatLapTime(ms: number) {
  const totalMilliseconds = Math.max(0, Math.floor(ms));
  const minutes = Math.floor(totalMilliseconds / 60_000);
  const seconds = Math.floor((totalMilliseconds % 60_000) / 1000);
  const milliseconds = totalMilliseconds % 1000;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
    2,
    "0",
  )}.${String(milliseconds).padStart(3, "0")}`;
}

export function LapList({
  laps,
  bestLapIndex,
  worstLapIndex,
  onCopy,
}: LapListProps) {
  const reduceMotion = useReducedMotion();

  if (laps.length === 0) {
    return <LapEmptyState />;
  }

  return (
    <div className="glass-panel mt-6 overflow-hidden">
      <div className="flex flex-col gap-4 border-b border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Laps</h3>
          <p className="text-sm text-muted-foreground">
            Best and worst split times are labeled.
          </p>
        </div>

        <button
          type="button"
          onClick={onCopy}
          className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground transition hover:border-foreground"
        >
          <Clipboard className="size-4" aria-hidden="true" />
          Copy
        </button>
      </div>

      <div className="max-h-80 overflow-y-auto">
        <div className="grid grid-cols-[0.55fr_1fr_1fr] border-b border-border px-4 py-3 font-mono text-[0.68rem] uppercase tracking-[0.16em] text-muted-foreground sm:grid-cols-[0.45fr_1fr_1fr_0.8fr] sm:px-5">
          <span>#</span>
          <span>Lap Time</span>
          <span>Total Time</span>
          <span className="hidden sm:block">Marker</span>
        </div>

        <AnimatePresence initial={false}>
          {laps.map((lap, index) => {
            const isBest = index === bestLapIndex && laps.length > 1;
            const isWorst = index === worstLapIndex && laps.length > 1;
            const marker = isBest ? "Best" : isWorst ? "Worst" : "";
            const textClass = isBest
              ? "text-chart-1"
              : isWorst
                ? "text-destructive"
                : "text-foreground";

            return (
              <motion.div
                key={lap.index}
                initial={reduceMotion ? false : { opacity: 0, y: -12 }}
                animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: -12 }}
                transition={{
                  duration: reduceMotion ? 0 : 0.2,
                  ease: "easeOut",
                }}
                className={`grid grid-cols-[0.55fr_1fr_1fr] border-b border-border px-4 py-3 font-mono text-sm last:border-b-0 sm:grid-cols-[0.45fr_1fr_1fr_0.8fr] sm:px-5 ${textClass}`}
              >
                <span>{lap.index}</span>
                <span>{formatLapTime(lap.lapTime)}</span>
                <span>{formatLapTime(lap.totalTime)}</span>
                <span className="hidden text-xs font-semibold uppercase tracking-[0.14em] sm:block">
                  {marker}
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
