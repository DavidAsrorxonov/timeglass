"use client";

import { Flag, Pause, Play, RotateCcw } from "lucide-react";
import { useMemo, useState } from "react";
import { LapList } from "@/components/stopwatch/LapList";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { useStopwatch } from "@/hooks/useStopwatch";

function formatStopwatchTime(ms: number) {
  const totalMilliseconds = Math.max(0, Math.floor(ms));
  const hours = Math.floor(totalMilliseconds / 3_600_000);
  const minutes = Math.floor((totalMilliseconds % 3_600_000) / 60_000);
  const seconds = Math.floor((totalMilliseconds % 60_000) / 1000);
  const milliseconds = totalMilliseconds % 1000;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0",
  )}:${String(seconds).padStart(2, "0")}.${String(milliseconds).padStart(
    3,
    "0",
  )}`;
}

function formatLapExport(ms: number) {
  const totalMilliseconds = Math.max(0, Math.floor(ms));
  const minutes = Math.floor(totalMilliseconds / 60_000);
  const seconds = Math.floor((totalMilliseconds % 60_000) / 1000);
  const milliseconds = totalMilliseconds % 1000;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
    2,
    "0",
  )}.${String(milliseconds).padStart(3, "0")}`;
}

export function StopwatchTab() {
  const stopwatch = useStopwatch();
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied">("idle");

  const isRunning = stopwatch.status === "running";
  const hasElapsed = stopwatch.elapsed > 0;
  const canReset = hasElapsed || stopwatch.laps.length > 0;

  const displayTime = useMemo(() => {
    return formatStopwatchTime(stopwatch.elapsed);
  }, [stopwatch.elapsed]);

  const handlePrimaryAction = () => {
    if (isRunning) {
      stopwatch.stop();
      return;
    }

    stopwatch.start();
  };

  const copyLaps = async () => {
    if (stopwatch.laps.length === 0 || !navigator.clipboard) {
      return;
    }

    const text = stopwatch.laps
      .slice()
      .reverse()
      .map((lap) => {
        return `Lap ${lap.index}: ${formatLapExport(
          lap.lapTime,
        )} | Total: ${formatLapExport(lap.totalTime)}`;
      })
      .join("\n");

    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus("copied");

      window.setTimeout(() => {
        setCopyStatus("idle");
      }, 1500);
    } catch {
      setCopyStatus("idle");
    }
  };

  return (
    <GlassPanel className="p-5 sm:p-6 lg:p-8" glow>
      <div className="text-center">
        <p className="font-mono text-xs uppercase tracking-[0.32em] text-(--accent-glow)">
          Stopwatch
        </p>
        <h2 className="mt-3 text-2xl font-semibold text-foreground sm:text-3xl">
          Stopwatch
        </h2>
      </div>

      <div className="mt-10 text-center">
        <p
          className="font-mono text-[2rem] font-semibold leading-none tracking-normal text-foreground sm:text-5xl md:text-6xl lg:text-7xl"
          aria-live="off"
        >
          {displayTime}
        </p>

        <p className="mt-4 font-mono text-xs uppercase tracking-[0.24em] text-(--text-muted)">
          {stopwatch.status}
        </p>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={stopwatch.lap}
          disabled={!isRunning}
          className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-white/10 px-6 py-3 text-sm font-semibold text-foreground transition hover:border-(--accent-primary) disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Flag className="size-4" aria-hidden="true" />
          Lap
        </button>

        <button
          type="button"
          onClick={handlePrimaryAction}
          className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-(--accent-primary) px-6 py-3 text-sm font-semibold text-white shadow-[0_0_24px_rgba(124,107,255,0.35)] transition hover:bg-(--accent-glow)"
        >
          {isRunning ? (
            <Pause className="size-4" aria-hidden="true" />
          ) : (
            <Play className="size-4" aria-hidden="true" />
          )}
          {isRunning ? "Stop" : hasElapsed ? "Resume" : "Start"}
        </button>

        <button
          type="button"
          onClick={stopwatch.reset}
          disabled={!canReset}
          className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-white/10 px-6 py-3 text-sm font-semibold text-foreground transition hover:border-(--accent-danger) disabled:cursor-not-allowed disabled:opacity-40"
        >
          <RotateCcw className="size-4" aria-hidden="true" />
          Reset
        </button>
      </div>

      {copyStatus === "copied" ? (
        <p className="mt-4 text-center text-sm text-(--accent-success)">
          Laps copied to clipboard.
        </p>
      ) : null}

      <LapList
        laps={stopwatch.laps}
        bestLapIndex={stopwatch.bestLapIndex}
        worstLapIndex={stopwatch.worstLapIndex}
        onCopy={copyLaps}
      />
    </GlassPanel>
  );
}
