"use client";

import { Pause, Play, RotateCcw, SkipForward } from "lucide-react";
import { useEffect, useMemo } from "react";
import { PomodoroRing } from "@/components/pomodoro/PomodoroRing";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { useNotifications } from "@/hooks/useNotifications";
import { FOCUS_DURATION, usePomodoro } from "@/hooks/usePomodoro";
import { useTimer } from "@/hooks/useTimer";
import { AudioManager } from "@/lib/audio";

const STAT_ITEMS = [
  {
    key: "completedPomodoros",
    label: "Completed",
  },
  {
    key: "totalFocusMinutes",
    label: "Focus Minutes",
  },
  {
    key: "streak",
    label: "Day Streak",
  },
] as const;

export function PomodoroTab() {
  const pomodoro = usePomodoro();
  const { sendNotification } = useNotifications();

  const {
    status,
    remainingMs,
    progress,
    startTimer,
    pause,
    resume,
    reset,
  } = useTimer({
    onComplete: () => {
      AudioManager.playAlarmSound("gentle");

      if (pomodoro.phase === "focus") {
        sendNotification("Focus session complete", {
          body: "Nice work. Time for a break.",
        });

        pomodoro.completeFocusSession();
        return;
      }

      if (pomodoro.phase === "break") {
        sendNotification("Break complete", {
          body: "Break is over. Time to focus again.",
        });

        pomodoro.completeBreakSession();
      }
    },
  });

  useEffect(() => {
    if (pomodoro.phase === "focus" || pomodoro.phase === "break") {
      startTimer(pomodoro.currentDuration);
    }
  }, [pomodoro.currentDuration, pomodoro.phase, startTimer]);

  const isRunning = status === "running";
  const isPaused = status === "paused";
  const isIdle = pomodoro.phase === "idle";
  const displayRemaining = isIdle ? FOCUS_DURATION : remainingMs;
  const displayProgress = isIdle ? 1 : progress;

  const sessionInCycle = useMemo(() => {
    if (
      pomodoro.cycleCount > 0 &&
      pomodoro.cycleCount % 4 === 0 &&
      pomodoro.phase === "break"
    ) {
      return 4;
    }

    return pomodoro.cycleCount % 4;
  }, [pomodoro.cycleCount, pomodoro.phase]);

  const sessionLabel = sessionInCycle === 0 ? 1 : sessionInCycle;

  const handlePrimaryAction = () => {
    if (isRunning) {
      pause();
      return;
    }

    if (isPaused) {
      resume();
      return;
    }

    if (isIdle) {
      void AudioManager.unlock();
      pomodoro.startFocus();
    }
  };

  const handleSkip = () => {
    if (isIdle) {
      return;
    }

    reset();
    AudioManager.stopAllSounds();
    pomodoro.skipPhase();
  };

  const handleReset = () => {
    reset();
    AudioManager.stopAllSounds();
    pomodoro.reset();
  };

  return (
    <GlassPanel className="p-5 sm:p-6 lg:p-8" glow>
      <div className="mb-7 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.32em] text-(--accent-glow)">
          Pomodoro
        </p>
        <h2 className="mt-3 text-2xl font-semibold text-foreground sm:text-3xl">
          Focus deeply, then rest.
        </h2>
      </div>

      <PomodoroRing
        phase={pomodoro.phase}
        remainingMs={displayRemaining}
        progress={displayProgress}
        isLongBreak={pomodoro.useLongBreak}
      />

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={handlePrimaryAction}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-(--accent-primary) px-6 py-3 text-sm font-semibold text-white shadow-[0_0_24px_rgba(124,107,255,0.35)] transition hover:bg-(--accent-glow)"
        >
          {isRunning ? (
            <Pause className="size-4" aria-hidden="true" />
          ) : (
            <Play className="size-4" aria-hidden="true" />
          )}
          {isRunning ? "Pause" : isPaused ? "Resume" : "Start"}
        </button>

        <button
          type="button"
          onClick={handleSkip}
          disabled={isIdle}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-white/10 px-6 py-3 text-sm font-semibold text-foreground transition hover:border-(--accent-primary) disabled:cursor-not-allowed disabled:opacity-40"
        >
          <SkipForward className="size-4" aria-hidden="true" />
          Skip
        </button>

        <button
          type="button"
          onClick={handleReset}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-white/10 px-6 py-3 text-sm font-semibold text-foreground transition hover:border-(--accent-danger)"
        >
          <RotateCcw className="size-4" aria-hidden="true" />
          Reset
        </button>
      </div>

      <div className="mt-8 text-center">
        <div
          className="flex justify-center gap-2"
          aria-label={`${sessionInCycle} of 4 Pomodoro sessions completed in this cycle`}
        >
          {Array.from({ length: 4 }, (_, index) => {
            const completed = index < sessionInCycle;

            return (
              <span
                key={index}
                className={`size-3 rounded-full border transition ${
                  completed
                    ? "border-(--accent-danger) bg-(--accent-danger) shadow-[0_0_14px_rgba(248,113,113,0.45)]"
                    : "border-white/20 bg-white/5"
                }`}
                aria-hidden="true"
              />
            );
          })}
        </div>

        <p className="mt-3 text-sm text-(--text-muted)">
          Session {sessionLabel} of 4
        </p>
      </div>

      <div className="mx-auto mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">
        {STAT_ITEMS.map((item) => (
          <div
            key={item.key}
            className="rounded-lg border border-white/10 px-4 py-4 text-center"
          >
            <p className="text-sm text-(--text-muted)">{item.label}</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">
              {pomodoro.stats[item.key]}
            </p>
          </div>
        ))}
      </div>
    </GlassPanel>
  );
}
