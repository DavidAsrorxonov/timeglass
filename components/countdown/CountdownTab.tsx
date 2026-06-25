"use client";

import { Pause, Play, RotateCcw } from "lucide-react";
import { useMemo, useState } from "react";
import { CountdownInput } from "@/components/countdown/CountdownInput";
import { CountdownRing } from "@/components/countdown/CountdownRing";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { useNotifications } from "@/hooks/useNotifications";
import { useTimer } from "@/hooks/useTimer";
import { AudioManager } from "@/lib/audio";

const PRESETS = [
  { label: "5m", value: 5 * 60 * 1000 },
  { label: "10m", value: 10 * 60 * 1000 },
  { label: "15m", value: 15 * 60 * 1000 },
  { label: "30m", value: 30 * 60 * 1000 },
  { label: "1h", value: 60 * 60 * 1000 },
];

type CountdownValue = {
  hours: number;
  minutes: number;
  seconds: number;
};

function inputToMs({ hours, minutes, seconds }: CountdownValue) {
  return (hours * 60 * 60 + minutes * 60 + seconds) * 1000;
}

function msToInput(durationMs: number): CountdownValue {
  const totalSeconds = Math.floor(durationMs / 1000);

  return {
    hours: Math.floor(totalSeconds / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

export function CountdownTab() {
  const [input, setInput] = useState<CountdownValue>({
    hours: 0,
    minutes: 10,
    seconds: 0,
  });

  const { sendNotification } = useNotifications();
  const timer = useTimer({
    onComplete: () => {
      AudioManager.playAlarmSound("digital");
      sendNotification("Timeglass Timer", {
        body: "Your countdown timer has finished.",
      });
    },
  });

  const selectedDuration = useMemo(() => inputToMs(input), [input]);
  const displayRemaining =
    timer.status === "idle" ? selectedDuration : timer.remainingMs;
  const displayProgress =
    timer.status === "idle" ? (selectedDuration > 0 ? 1 : 0) : timer.progress;
  const isRunning = timer.status === "running";
  const isPaused = timer.status === "paused";
  const canStart = selectedDuration > 0;

  const handlePrimaryAction = () => {
    if (isRunning) {
      timer.pause();
      return;
    }

    if (isPaused) {
      timer.resume();
      return;
    }

    void AudioManager.unlock();
    timer.startTimer(selectedDuration);
  };

  const handlePreset = (durationMs: number) => {
    if (isRunning) {
      return;
    }

    timer.reset();
    AudioManager.stopAllSounds();
    setInput(msToInput(durationMs));
  };

  const handleReset = () => {
    timer.reset();
    AudioManager.stopAllSounds();
  };

  return (
    <GlassPanel className="p-5 sm:p-6 lg:p-8" glow>
      <div className="mb-7 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.32em] text-(--accent-glow)">
          Countdown
        </p>
        <h2 className="mt-3 text-2xl font-semibold text-foreground sm:text-3xl">
          Countdown Timer
        </h2>
      </div>

      <CountdownRing
        remainingMs={displayRemaining}
        progress={displayProgress}
        status={timer.status}
      />

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={handlePrimaryAction}
          disabled={!canStart && !isRunning && !isPaused}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-(--accent-primary) px-6 py-3 text-sm font-semibold text-white shadow-[0_0_24px_rgba(124,107,255,0.35)] transition hover:bg-(--accent-glow) disabled:cursor-not-allowed disabled:opacity-40"
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
          onClick={handleReset}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-white/10 px-6 py-3 text-sm font-semibold text-foreground transition hover:border-(--accent-primary)"
        >
          <RotateCcw className="size-4" aria-hidden="true" />
          Reset
        </button>
      </div>

      <div className="mx-auto mt-8 max-w-xl">
        <CountdownInput
          hours={input.hours}
          minutes={input.minutes}
          seconds={input.seconds}
          onChange={setInput}
          disabled={isRunning}
        />

        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => handlePreset(preset.value)}
              disabled={isRunning}
              className="min-h-11 rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-foreground transition hover:border-(--accent-primary) disabled:cursor-not-allowed disabled:opacity-40"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>
    </GlassPanel>
  );
}
