# Timeglass — Phase 6: Stopwatch Tab

## 1. Purpose

This document explains **Phase 6 — Stopwatch Tab** for the **Timeglass** project.

The goal of this phase is to build the stopwatch feature. Users should be able to start, stop, reset, and record laps with accurate timing. The stopwatch should show elapsed time with millisecond precision and display a clean lap history.

This phase builds on the shared app structure from earlier phases, especially:

- `AppShell`
- `GlassPanel`
- Shared TypeScript types
- Framer Motion animations
- Reusable UI patterns
- Stopwatch hook infrastructure

---

## 2. Phase Goal

By the end of this phase, Timeglass should have a working Stopwatch tab with:

- Large elapsed time display
- Start / stop button
- Reset button
- Lap button
- Accurate timing using `performance.now()`
- Lap recording
- Lap time and total time display
- Best lap highlighting
- Worst lap highlighting
- Scrollable lap list
- Copy laps button
- Smooth lap entry animation
- Responsive layout

---

## 3. Files Created in This Phase

Phase 6 should create or update these files:

```txt
components/
└── stopwatch/
    ├── StopwatchTab.tsx
    └── LapList.tsx

hooks/
└── useStopwatch.ts
```

Also update:

```txt
components/layout/AppShell.tsx
types/index.ts
```

---

## 4. Stopwatch Overview

The Stopwatch tab is used for counting upward from zero.

Basic layout:

```txt
┌────────────────────────────────────┐
│             Stopwatch              │
│                                    │
│          00:00:00.000              │
│                                    │
│       [Lap] [Start / Stop]         │
│              [Reset]               │
│                                    │
│  ┌──────────────────────────────┐  │
│  │ #   Lap Time     Total Time  │  │
│  │ 1   00:05.230    00:05.230   │  │
│  │ 2   00:04.810    00:10.040   │  │
│  └──────────────────────────────┘  │
└────────────────────────────────────┘
```

The stopwatch should feel precise, fast, and clean.

---

## 5. Stopwatch States

The stopwatch should support three main states:

```ts
type StopwatchStatus = "idle" | "running" | "paused";
```

### State meanings

| State     | Meaning                                     |
| --------- | ------------------------------------------- |
| `idle`    | Stopwatch is at zero and not started        |
| `running` | Stopwatch is actively counting              |
| `paused`  | Stopwatch is stopped but keeps elapsed time |

---

## 6. Step 6.1 — Update Types

Update:

```txt
types/index.ts
```

Make sure these types exist:

```ts
export interface LapEntry {
  index: number;
  lapTime: number;
  totalTime: number;
}

export type StopwatchStatus = "idle" | "running" | "paused";
```

### Field meanings

| Field       | Meaning                                    |
| ----------- | ------------------------------------------ |
| `index`     | Lap number                                 |
| `lapTime`   | Time since the previous lap                |
| `totalTime` | Total elapsed time since stopwatch started |

---

## 7. Step 6.2 — Time Formatting Helper

The stopwatch needs a helper to format milliseconds into a readable time string.

Recommended format:

```txt
HH:MM:SS.mmm
```

Example:

```ts
export function formatStopwatchTime(ms: number) {
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
```

For lap list display, a shorter format can also be used:

```txt
MM:SS.mmm
```

But the main display should use:

```txt
HH:MM:SS.mmm
```

---

## 8. Step 6.3 — useStopwatch Hook

Update:

```txt
hooks/useStopwatch.ts
```

This hook controls the stopwatch logic.

### Required behavior

The hook should:

- Use `performance.now()` for precision
- Start counting from zero
- Pause without losing elapsed time
- Resume from the paused time
- Reset to zero
- Record laps
- Calculate lap time since the previous lap
- Calculate total time since the start
- Clean up animation frames
- Avoid unnecessary work when not running

### Recommended implementation

```ts
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

  const tick = useCallback(() => {
    if (startTimeRef.current === null) {
      return;
    }

    const currentElapsed =
      accumulatedRef.current + (performance.now() - startTimeRef.current);

    setElapsed(currentElapsed);

    frameRef.current = requestAnimationFrame(tick);
  }, []);

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

    if (startTimeRef.current !== null) {
      accumulatedRef.current += performance.now() - startTimeRef.current;
    }

    startTimeRef.current = null;
    setElapsed(accumulatedRef.current);
    setStatus("paused");
  }, [clearFrame, status]);

  const reset = useCallback(() => {
    clearFrame();

    startTimeRef.current = null;
    accumulatedRef.current = 0;
    lastLapTotalRef.current = 0;

    setElapsed(0);
    setLaps([]);
    setStatus("idle");
  }, [clearFrame]);

  const lap = useCallback(() => {
    if (status !== "running") {
      return;
    }

    const totalTime = elapsed;
    const lapTime = totalTime - lastLapTotalRef.current;
    lastLapTotalRef.current = totalTime;

    setLaps((previous) => [
      {
        index: previous.length + 1,
        lapTime,
        totalTime,
      },
      ...previous,
    ]);
  }, [elapsed, status]);

  useEffect(() => {
    return () => {
      clearFrame();
    };
  }, [clearFrame]);

  const bestLapIndex = useMemo(() => {
    if (laps.length === 0) {
      return null;
    }

    return laps.reduce((bestIndex, lap, index, array) => {
      return lap.lapTime < array[bestIndex].lapTime ? index : bestIndex;
    }, 0);
  }, [laps]);

  const worstLapIndex = useMemo(() => {
    if (laps.length === 0) {
      return null;
    }

    return laps.reduce((worstIndex, lap, index, array) => {
      return lap.lapTime > array[worstIndex].lapTime ? index : worstIndex;
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
```

---

## 9. Why Use `performance.now()`?

The stopwatch should use:

```ts
performance.now();
```

instead of:

```ts
Date.now();
```

### Reason

`performance.now()` is better for measuring elapsed time because it is more precise and is not affected by system clock changes.

For example, if the user's computer clock changes while the stopwatch is running, `performance.now()` is still stable for timing.

---

## 10. Step 6.4 — LapList Component

Create:

```txt
components/stopwatch/LapList.tsx
```

This component displays all recorded laps.

### Required props

```ts
interface LapListProps {
  laps: LapEntry[];
  bestLapIndex: number | null;
  worstLapIndex: number | null;
  onCopy: () => void;
}
```

### Required features

- Show lap number
- Show lap time
- Show total time
- Highlight best lap
- Highlight worst lap
- Empty state
- Copy laps button
- Scrollable list
- New lap animation

### Example implementation

```tsx
"use client";

import { Clipboard, Flag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { LapEntry } from "@/types";

interface LapListProps {
  laps: LapEntry[];
  bestLapIndex: number | null;
  worstLapIndex: number | null;
  onCopy: () => void;
}

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
  if (laps.length === 0) {
    return (
      <div className="glass-panel mt-6 p-6 text-center">
        <Flag className="mx-auto text-(--text-muted)" size={28} />
        <p className="mt-3 text-lg font-medium text-foreground">No laps yet</p>
        <p className="mt-1 text-sm text-(--text-muted)">
          Start the stopwatch and press Lap to record split times.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-panel mt-6 overflow-hidden">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Laps</h3>
          <p className="text-sm text-(--text-muted)">
            Best lap is green. Worst lap is red.
          </p>
        </div>

        <button
          type="button"
          onClick={onCopy}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-foreground transition hover:border-(--accent-primary)"
        >
          <Clipboard size={16} />
          Copy
        </button>
      </div>

      <div className="max-h-80 overflow-y-auto">
        <div className="grid grid-cols-[0.6fr_1fr_1fr] border-b border-white/10 px-5 py-3 text-xs uppercase tracking-[0.2em] text-(--text-muted)">
          <span>#</span>
          <span>Lap Time</span>
          <span>Total Time</span>
        </div>

        <AnimatePresence initial={false}>
          {laps.map((lap, index) => {
            const isBest = index === bestLapIndex && laps.length > 1;
            const isWorst = index === worstLapIndex && laps.length > 1;

            const textClass = isBest
              ? "text-[var(--accent-success)]"
              : isWorst
                ? "text-[var(--accent-danger)]"
                : "text-[var(--text-primary)]";

            return (
              <motion.div
                key={lap.index}
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
                className={`grid grid-cols-[0.6fr_1fr_1fr] px-5 py-3 font-mono text-sm ${textClass}`}
              >
                <span>{lap.index}</span>
                <span>{formatLapTime(lap.lapTime)}</span>
                <span>{formatLapTime(lap.totalTime)}</span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
```

---

## 11. Step 6.5 — StopwatchTab Component

Create:

```txt
components/stopwatch/StopwatchTab.tsx
```

This is the main Stopwatch screen.

### Responsibilities

`StopwatchTab` should:

- Use `useStopwatch`
- Display elapsed time
- Start stopwatch
- Stop stopwatch
- Reset stopwatch
- Record laps
- Render lap list
- Copy lap data to clipboard
- Disable invalid actions
- Show clean visual states

### Example implementation

```tsx
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
    if (stopwatch.laps.length === 0) {
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
    <GlassPanel className="p-6 lg:p-8" glow>
      <div className="text-center">
        <p className="text-sm uppercase tracking-[0.35em] text-(--accent-glow)">
          Stopwatch
        </p>

        <h2 className="mt-3 text-3xl font-semibold text-foreground">
          Track time with precision.
        </h2>

        <p className="mt-3 text-sm text-(--text-muted)">
          Record laps, compare split times, and copy your results.
        </p>
      </div>

      <div className="mt-10 text-center">
        <p className="font-mono text-5xl font-semibold tracking-tight text-foreground sm:text-7xl">
          {displayTime}
        </p>

        <p className="mt-3 text-sm uppercase tracking-[0.25em] text-(--text-muted)">
          {stopwatch.status}
        </p>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={stopwatch.lap}
          disabled={!isRunning}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 px-6 py-3 font-medium text-foreground transition hover:border-(--accent-primary) disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Flag size={18} />
          Lap
        </button>

        <button
          type="button"
          onClick={handlePrimaryAction}
          className="inline-flex items-center gap-2 rounded-full bg-(--accent-primary) px-6 py-3 font-medium text-white shadow-[0_0_24px_rgba(124,107,255,0.35)] transition hover:bg-(--accent-glow)"
        >
          {isRunning ? <Pause size={18} /> : <Play size={18} />}
          {isRunning ? "Stop" : hasElapsed ? "Resume" : "Start"}
        </button>

        <button
          type="button"
          onClick={stopwatch.reset}
          disabled={!hasElapsed && stopwatch.laps.length === 0}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 px-6 py-3 font-medium text-foreground transition hover:border-(--accent-danger) disabled:cursor-not-allowed disabled:opacity-40"
        >
          <RotateCcw size={18} />
          Reset
        </button>
      </div>

      {copyStatus === "copied" && (
        <p className="mt-4 text-center text-sm text-(--accent-success)">
          Laps copied to clipboard.
        </p>
      )}

      <LapList
        laps={stopwatch.laps}
        bestLapIndex={stopwatch.bestLapIndex}
        worstLapIndex={stopwatch.worstLapIndex}
        onCopy={copyLaps}
      />
    </GlassPanel>
  );
}
```

---

## 12. Step 6.6 — Connect StopwatchTab to AppShell

Update:

```txt
components/layout/AppShell.tsx
```

Import:

```tsx
import { StopwatchTab } from "@/components/stopwatch/StopwatchTab";
```

Then replace the stopwatch placeholder:

```tsx
case "stopwatch":
  return <StopwatchTab />;
```

Now the Stopwatch tab should render when the user clicks the Stopwatch tab.

---

## 13. Step 6.7 — Lap Calculation Example

Example stopwatch flow:

```txt
Start
After 5 seconds → Lap 1
After 3 more seconds → Lap 2
After 4 more seconds → Lap 3
```

Expected lap data:

| Lap | Lap Time  | Total Time |
| --- | --------- | ---------- |
| 1   | 00:05.000 | 00:05.000  |
| 2   | 00:03.000 | 00:08.000  |
| 3   | 00:04.000 | 00:12.000  |

The app should calculate:

```ts
lapTime = currentTotalTime - previousLapTotalTime;
totalTime = currentTotalTime;
```

---

## 14. Step 6.8 — Best and Worst Lap Logic

Best lap means the shortest lap time.

Worst lap means the longest lap time.

Example:

| Lap | Lap Time |
| --- | -------- |
| 1   | 5s       |
| 2   | 3s       |
| 3   | 4s       |

Result:

```txt
Best lap: Lap 2
Worst lap: Lap 1
```

### Important rule

Do not highlight best/worst if there is only one lap.

Reason:

If there is only one lap, it is both the best and worst, which can look confusing.

---

## 15. Step 6.9 — Copy Laps Format

When the user clicks **Copy**, copied text should look like this:

```txt
Lap 1: 00:05.230 | Total: 00:05.230
Lap 2: 00:04.810 | Total: 00:10.040
Lap 3: 00:06.120 | Total: 00:16.160
```

This makes it easy to paste into notes, reports, or messages.

---

## 16. Step 6.10 — Empty State

If there are no laps, show an empty state.

Example text:

```txt
No laps yet
Start the stopwatch and press Lap to record split times.
```

The empty state should use:

- Muted text
- Small icon
- Glass panel style
- Friendly explanation

---

## 17. Step 6.11 — Button Rules

The Stopwatch tab buttons should behave like this:

| Button       | Idle                        | Running | Paused   |
| ------------ | --------------------------- | ------- | -------- |
| Start / Stop | Start                       | Stop    | Resume   |
| Lap          | Disabled                    | Enabled | Disabled |
| Reset        | Disabled if no elapsed time | Enabled | Enabled  |

### Notes

- Lap should only work while running.
- Reset should clear elapsed time and laps.
- Stop should pause the stopwatch.
- Resume should continue from the paused elapsed time.

---

## 18. Step 6.12 — Animation Rules

Use Framer Motion for:

- New lap entry slide-in
- Lap list appearance
- Button tap effects
- Optional display animation

Recommended lap entry animation:

```tsx
initial={{ opacity: 0, y: -12 }}
animate={{ opacity: 1, y: 0 }}
exit={{ opacity: 0, y: -12 }}
```

The stopwatch numbers update very quickly, so avoid heavy animations on every millisecond update.

---

## 19. Step 6.13 — Accessibility Rules

Stopwatch accessibility rules:

- Use real `<button>` elements
- Disable unavailable actions clearly
- Use text labels with icons
- Do not use icons alone
- Show stopwatch status as text
- Copy button should be keyboard accessible
- Lap list should have clear columns
- Best/worst lap should not rely only on color if possible
- Avoid heavy flashing or fast visual effects

Possible later improvement:

```txt
Add “Best” and “Worst” labels next to highlighted laps.
```

---

## 20. Step 6.14 — Responsive Rules

### Desktop

```txt
Large stopwatch display
Buttons in one row
Lap list below
Centered max-width panel
```

### Tablet

```txt
Same as desktop
Slightly smaller display if needed
```

### Mobile

```txt
Display scales down
Buttons wrap into multiple rows
Lap list remains scrollable
Touch targets remain large
```

Minimum touch target:

```txt
44px height
```

---

## 21. Step 6.15 — Performance Notes

Stopwatch performance rules:

1. Use `performance.now()` for timing.
2. Use `requestAnimationFrame` only while running.
3. Cancel animation frame when stopped, reset, or unmounted.
4. Avoid expensive calculations on every frame.
5. Do not animate every digit change.
6. Keep lap list simple.
7. Add simple virtualization later only if there are more than 50 laps.

### Optional future improvement

If lap count becomes very high, use simple windowing:

```txt
Show only the visible lap rows plus a small buffer.
```

For the first version, a normal scrollable list is enough.

---

## 22. What This Phase Does Not Include

This phase does not include:

- Countdown Timer changes
- Pomodoro Timer
- Alarm System
- Calendar System
- Saved stopwatch history
- Multiple stopwatch sessions
- Export to CSV
- Advanced charts
- Cloud sync
- Background stopwatch tracking after browser is closed

Those can be considered later if needed.

---

## 23. Important Limitation

The stopwatch is browser-based.

It should work while the app is open and active. If the browser tab is closed, the first version does not need to keep stopwatch history or continue tracking in the background.

A future version can add saved sessions or session recovery, but that is not required for Phase 6.

---

## 24. Completion Checklist

Phase 6 is complete when:

- [ ] `StopwatchTab.tsx` exists
- [ ] `LapList.tsx` exists
- [ ] `useStopwatch.ts` has accurate stopwatch logic
- [ ] Stopwatch uses `performance.now()`
- [ ] Stopwatch display shows `HH:MM:SS.mmm`
- [ ] Start button works
- [ ] Stop button works
- [ ] Resume behavior works
- [ ] Reset button works
- [ ] Lap button works only while running
- [ ] Lap time is calculated correctly
- [ ] Total time is calculated correctly
- [ ] Lap list renders correctly
- [ ] Best lap is highlighted
- [ ] Worst lap is highlighted
- [ ] Best/worst are not highlighted when only one lap exists
- [ ] Empty state appears when there are no laps
- [ ] Copy laps button works
- [ ] Copied text format is readable
- [ ] `StopwatchTab` is connected to `AppShell`
- [ ] Layout works on desktop, tablet, and mobile
- [ ] No TypeScript errors
- [ ] No ESLint errors

---

## 25. Recommended Next Phase

After the Stopwatch tab is complete, move to:

**Phase 7 — Pomodoro Tab**

That phase should include:

- Focus timer
- Break timer
- 25/5 Pomodoro cycle
- Long break prompt after 4 sessions
- Pomodoro ring
- Session stats
- Daily streak tracking
- LocalStorage persistence
