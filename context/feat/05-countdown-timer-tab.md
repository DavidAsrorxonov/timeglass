# Timeglass — Phase 5: Countdown Timer Tab

## 1. Purpose

This document explains **Phase 5 — Countdown Timer Tab** for the **Timeglass** project.

The goal of this phase is to build the countdown timer feature. Users should be able to set a custom countdown duration, start the timer, pause it, resume it, reset it, and receive an audio/notification alert when the countdown finishes.

This phase builds on the shared infrastructure from earlier phases, especially:

- `useTimer`
- `useNotifications`
- `AudioManager`
- `CircularProgress`
- `GlassPanel`
- LocalStorage-safe browser logic

---

## 2. Phase Goal

By the end of this phase, Timeglass should have a working Countdown Timer tab with:

- Custom hour, minute, and second input
- Preset quick buttons
- Circular countdown progress ring
- Large remaining time display
- Start, pause, resume, and reset controls
- Accurate countdown logic using `Date.now()` delta
- Completion sound using the Web Audio API
- Browser notification when permission is granted
- Visual danger state when time is almost finished
- Completion animation
- Clean responsive layout

---

## 3. Files Created in This Phase

Phase 5 should create or update these files:

```txt
components/
└── countdown/
    ├── CountdownTab.tsx
    ├── CountdownInput.tsx
    └── CountdownRing.tsx

components/
└── ui/
    └── CircularProgress.tsx

hooks/
└── useTimer.ts
```

Also update:

```txt
components/layout/AppShell.tsx
lib/audio.ts
hooks/useNotifications.ts
```

---

## 4. Countdown Timer Overview

The Countdown Timer tab allows users to choose a duration and count down to zero.

Basic layout:

```txt
┌────────────────────────────────────┐
│          Countdown Timer           │
│                                    │
│          [Progress Ring]           │
│             00:10:00               │
│                                    │
│      [Start / Pause] [Reset]       │
│                                    │
│       HH       MM       SS         │
│     [ 00 ]   [ 10 ]   [ 00 ]       │
│                                    │
│  [5m] [10m] [15m] [30m] [1h]       │
└────────────────────────────────────┘
```

The countdown should feel smooth, focused, and simple.

---

## 5. Countdown States

The timer should support four states:

```ts
type TimerStatus = "idle" | "running" | "paused" | "done";
```

### State meanings

| State     | Meaning                          |
| --------- | -------------------------------- |
| `idle`    | No active countdown is running   |
| `running` | Countdown is actively decreasing |
| `paused`  | Countdown is temporarily stopped |
| `done`    | Countdown reached zero           |

---

## 6. Step 5.1 — CircularProgress Component

Create:

```txt
components/ui/CircularProgress.tsx
```

This is a reusable SVG progress ring. It will be used by:

- Countdown Timer
- Pomodoro Timer

### Required props

```ts
interface CircularProgressProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  danger?: boolean;
  success?: boolean;
}
```

`value` should be between `0` and `1`.

### Example implementation

```tsx
"use client";

import { motion } from "framer-motion";

interface CircularProgressProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  danger?: boolean;
  success?: boolean;
}

export function CircularProgress({
  value,
  size = 280,
  strokeWidth = 12,
  className = "",
  danger = false,
  success = false,
}: CircularProgressProps) {
  const safeValue = Math.min(1, Math.max(0, value));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - safeValue);

  const color = success
    ? "var(--accent-success)"
    : danger
      ? "var(--accent-danger)"
      : "var(--accent-primary)";

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      role="img"
      aria-label="Countdown progress"
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="transparent"
        stroke="rgba(255,255,255,0.1)"
        strokeWidth={strokeWidth}
      />

      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="transparent"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        animate={{ strokeDashoffset: dashOffset }}
        transition={{ duration: 0.25, ease: "linear" }}
        style={{
          rotate: -90,
          transformOrigin: "50% 50%",
          filter: `drop-shadow(0 0 14px ${color})`,
        }}
      />
    </svg>
  );
}
```

### Behavior

- Full ring means full time remaining.
- Ring decreases clockwise as time passes.
- Ring becomes red when almost finished.
- Ring becomes green briefly when completed.

---

## 7. Step 5.2 — Time Formatting Helper

The countdown needs a simple helper to format milliseconds.

This can be inside `CountdownRing.tsx`, `useTimer.ts`, or a future utility file.

```ts
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
```

### Example output

```txt
00:05:00
00:10:30
01:00:00
```

---

## 8. Step 5.3 — useTimer Hook

Update:

```txt
hooks/useTimer.ts
```

This hook controls the countdown logic.

### Required behavior

The hook should:

- Start a countdown from a duration in milliseconds
- Pause the countdown
- Resume the countdown
- Reset the countdown
- Calculate remaining time using `Date.now()`
- Avoid relying only on `setInterval`
- Trigger `onComplete` when the timer reaches zero
- Avoid calling `onComplete` multiple times
- Clean up animation frames

### Recommended implementation

```ts
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { TimerStatus } from "@/types";

interface UseTimerOptions {
  onComplete?: () => void;
}

export function useTimer(options: UseTimerOptions = {}) {
  const { onComplete } = options;

  const [status, setStatus] = useState<TimerStatus>("idle");
  const [durationMs, setDurationMs] = useState(0);
  const [remainingMs, setRemainingMs] = useState(0);

  const endTimeRef = useRef<number | null>(null);
  const pausedRemainingRef = useRef(0);
  const frameRef = useRef<number | null>(null);
  const completedRef = useRef(false);

  const clearFrame = useCallback(() => {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
  }, []);

  const tick = useCallback(() => {
    if (endTimeRef.current === null) {
      return;
    }

    const remaining = Math.max(0, endTimeRef.current - Date.now());

    setRemainingMs(remaining);

    if (remaining <= 0) {
      clearFrame();
      setStatus("done");
      endTimeRef.current = null;

      if (!completedRef.current) {
        completedRef.current = true;
        onComplete?.();
      }

      return;
    }

    frameRef.current = requestAnimationFrame(tick);
  }, [clearFrame, onComplete]);

  const startTimer = useCallback(
    (duration: number) => {
      if (duration <= 0) {
        return;
      }

      clearFrame();

      completedRef.current = false;
      setDurationMs(duration);
      setRemainingMs(duration);
      setStatus("running");

      endTimeRef.current = Date.now() + duration;
      frameRef.current = requestAnimationFrame(tick);
    },
    [clearFrame, tick],
  );

  const pause = useCallback(() => {
    if (status !== "running") {
      return;
    }

    clearFrame();
    pausedRemainingRef.current = remainingMs;
    endTimeRef.current = null;
    setStatus("paused");
  }, [clearFrame, remainingMs, status]);

  const resume = useCallback(() => {
    if (status !== "paused") {
      return;
    }

    setStatus("running");
    endTimeRef.current = Date.now() + pausedRemainingRef.current;
    frameRef.current = requestAnimationFrame(tick);
  }, [status, tick]);

  const reset = useCallback(() => {
    clearFrame();

    completedRef.current = false;
    endTimeRef.current = null;
    pausedRemainingRef.current = 0;

    setStatus("idle");
    setDurationMs(0);
    setRemainingMs(0);
  }, [clearFrame]);

  useEffect(() => {
    return () => {
      clearFrame();
    };
  }, [clearFrame]);

  const progress =
    durationMs > 0 ? Math.max(0, Math.min(1, remainingMs / durationMs)) : 0;

  return {
    status,
    durationMs,
    remainingMs,
    progress,
    startTimer,
    pause,
    resume,
    reset,
  };
}
```

### Why use `Date.now()`?

Using `Date.now()` makes the countdown more accurate than simply subtracting one second every `setInterval`.

If the browser slows down or skips frames, the remaining time still calculates correctly from the real end time.

---

## 9. Step 5.4 — CountdownRing Component

Create:

```txt
components/countdown/CountdownRing.tsx
```

This component displays the progress ring and remaining time.

### Required props

```ts
interface CountdownRingProps {
  remainingMs: number;
  progress: number;
  status: TimerStatus;
}
```

### Example implementation

```tsx
"use client";

import { motion } from "framer-motion";
import type { TimerStatus } from "@/types";
import { CircularProgress } from "@/components/ui/CircularProgress";

interface CountdownRingProps {
  remainingMs: number;
  progress: number;
  status: TimerStatus;
}

function formatDuration(ms: number) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0",
  )}:${String(seconds).padStart(2, "0")}`;
}

export function CountdownRing({
  remainingMs,
  progress,
  status,
}: CountdownRingProps) {
  const isDanger = status === "running" && progress > 0 && progress <= 0.1;
  const isDone = status === "done";

  return (
    <div className="relative mx-auto flex h-75 w-75 items-center justify-center">
      <motion.div
        animate={isDone ? { scale: [1, 1.04, 1] } : undefined}
        transition={{ duration: 0.8, repeat: isDone ? Infinity : 0 }}
      >
        <CircularProgress
          value={progress}
          size={300}
          strokeWidth={14}
          danger={isDanger}
          success={isDone}
        />
      </motion.div>

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <p className="text-sm uppercase tracking-[0.35em] text-(--text-muted)">
          {status}
        </p>

        <p className="mt-3 font-mono text-5xl font-semibold text-foreground">
          {formatDuration(remainingMs)}
        </p>
      </div>
    </div>
  );
}
```

### Display behavior

| Timer State | Ring Behavior                            |
| ----------- | ---------------------------------------- |
| `idle`      | Empty or full based on selected duration |
| `running`   | Ring decreases                           |
| `paused`    | Ring freezes                             |
| `done`      | Ring turns green and pulses              |

---

## 10. Step 5.5 — CountdownInput Component

Create:

```txt
components/countdown/CountdownInput.tsx
```

This component lets users set the countdown duration.

### Required props

```ts
interface CountdownInputProps {
  hours: number;
  minutes: number;
  seconds: number;
  onChange: (value: {
    hours: number;
    minutes: number;
    seconds: number;
  }) => void;
  disabled?: boolean;
}
```

### Required features

- Three number inputs: HH, MM, SS
- Validation
- Max values
- Clear labels
- Large readable digits
- Disabled state when timer is running

### Example implementation

```tsx
"use client";

interface CountdownValue {
  hours: number;
  minutes: number;
  seconds: number;
}

interface CountdownInputProps {
  hours: number;
  minutes: number;
  seconds: number;
  onChange: (value: CountdownValue) => void;
  disabled?: boolean;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function CountdownInput({
  hours,
  minutes,
  seconds,
  onChange,
  disabled = false,
}: CountdownInputProps) {
  const updateValue = (key: keyof CountdownValue, value: string) => {
    const numberValue = Number(value);

    const nextValue = {
      hours,
      minutes,
      seconds,
      [key]: Number.isNaN(numberValue)
        ? 0
        : key === "hours"
          ? clamp(numberValue, 0, 23)
          : clamp(numberValue, 0, 59),
    };

    onChange(nextValue);
  };

  return (
    <div className="grid grid-cols-3 gap-3">
      <label className="block">
        <span className="mb-2 block text-center text-xs uppercase tracking-[0.25em] text-(--text-muted)">
          Hours
        </span>
        <input
          type="number"
          min={0}
          max={23}
          value={hours}
          disabled={disabled}
          onChange={(event) => updateValue("hours", event.target.value)}
          className="glass-panel w-full px-3 py-4 text-center font-mono text-3xl text-foreground outline-none disabled:opacity-50"
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-center text-xs uppercase tracking-[0.25em] text-(--text-muted)">
          Minutes
        </span>
        <input
          type="number"
          min={0}
          max={59}
          value={minutes}
          disabled={disabled}
          onChange={(event) => updateValue("minutes", event.target.value)}
          className="glass-panel w-full px-3 py-4 text-center font-mono text-3xl text-foreground outline-none disabled:opacity-50"
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-center text-xs uppercase tracking-[0.25em] text-(--text-muted)">
          Seconds
        </span>
        <input
          type="number"
          min={0}
          max={59}
          value={seconds}
          disabled={disabled}
          onChange={(event) => updateValue("seconds", event.target.value)}
          className="glass-panel w-full px-3 py-4 text-center font-mono text-3xl text-foreground outline-none disabled:opacity-50"
        />
      </label>
    </div>
  );
}
```

---

## 11. Step 5.6 — Preset Buttons

The Countdown Timer should include quick preset buttons.

Recommended presets:

```ts
const PRESETS = [
  { label: "5m", value: 5 * 60 * 1000 },
  { label: "10m", value: 10 * 60 * 1000 },
  { label: "15m", value: 15 * 60 * 1000 },
  { label: "30m", value: 30 * 60 * 1000 },
  { label: "1h", value: 60 * 60 * 1000 },
];
```

When a user clicks a preset, it should update the input values.

Example helper:

```ts
function msToInput(durationMs: number) {
  const totalSeconds = Math.floor(durationMs / 1000);

  return {
    hours: Math.floor(totalSeconds / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}
```

---

## 12. Step 5.7 — CountdownTab Component

Create:

```txt
components/countdown/CountdownTab.tsx
```

This is the main Countdown Timer screen.

### Responsibilities

`CountdownTab` should:

- Store the selected input duration
- Convert HH/MM/SS to milliseconds
- Use `useTimer`
- Render `CountdownRing`
- Render timer controls
- Render `CountdownInput`
- Render preset buttons
- Play sound on completion
- Send notification on completion
- Disable inputs when running
- Reset safely

### Example implementation

```tsx
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

function inputToMs(hours: number, minutes: number, seconds: number) {
  return (hours * 60 * 60 + minutes * 60 + seconds) * 1000;
}

function msToInput(durationMs: number) {
  const totalSeconds = Math.floor(durationMs / 1000);

  return {
    hours: Math.floor(totalSeconds / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

export function CountdownTab() {
  const [input, setInput] = useState({
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

  const selectedDuration = useMemo(() => {
    return inputToMs(input.hours, input.minutes, input.seconds);
  }, [input.hours, input.minutes, input.seconds]);

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

    timer.startTimer(selectedDuration);
  };

  const handlePreset = (durationMs: number) => {
    if (isRunning) {
      return;
    }

    setInput(msToInput(durationMs));
  };

  const handleReset = () => {
    timer.reset();
    AudioManager.stopAllSounds();
  };

  return (
    <GlassPanel className="p-6 lg:p-8" glow>
      <div className="mb-8 text-center">
        <p className="text-sm uppercase tracking-[0.35em] text-(--accent-glow)">
          Countdown
        </p>
        <h2 className="mt-3 text-3xl font-semibold text-foreground">
          Set a timer and stay on track.
        </h2>
      </div>

      <CountdownRing
        remainingMs={displayRemaining}
        progress={displayProgress}
        status={timer.status}
      />

      <div className="mt-8 flex justify-center gap-3">
        <button
          type="button"
          onClick={handlePrimaryAction}
          disabled={!canStart && timer.status === "idle"}
          className="inline-flex items-center gap-2 rounded-full bg-(--accent-primary) px-6 py-3 font-medium text-white shadow-[0_0_24px_rgba(124,107,255,0.35)] transition hover:bg-(--accent-glow) disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isRunning ? <Pause size={18} /> : <Play size={18} />}
          {isRunning ? "Pause" : isPaused ? "Resume" : "Start"}
        </button>

        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 px-6 py-3 font-medium text-foreground transition hover:border-(--accent-primary)"
        >
          <RotateCcw size={18} />
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
              className="rounded-full border border-white/10 px-4 py-2 text-sm text-foreground transition hover:border-(--accent-primary) disabled:cursor-not-allowed disabled:opacity-40"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>
    </GlassPanel>
  );
}
```

---

## 13. Step 5.8 — Connect CountdownTab to AppShell

Update:

```txt
components/layout/AppShell.tsx
```

Import:

```tsx
import { CountdownTab } from "@/components/countdown/CountdownTab";
```

Then replace the countdown placeholder:

```tsx
case "countdown":
  return <CountdownTab />;
```

The Countdown Timer tab should now render when the user clicks the Timer tab.

---

## 14. Step 5.9 — Browser Notification Permission

The countdown can only send a browser notification if permission is already granted.

Do not request permission automatically when the timer ends.

Better flow:

1. Show notification permission banner later in cross-cutting features.
2. User clicks "Enable notifications."
3. `requestPermission()` runs.
4. Countdown can send notification after permission is granted.

For this phase, `sendNotification()` can silently do nothing if permission is not granted.

---

## 15. Step 5.10 — Audio Behavior

When the timer completes:

```ts
AudioManager.playAlarmSound("digital");
```

When the user resets:

```ts
AudioManager.stopAllSounds();
```

### Important browser note

Some browsers block audio until the user interacts with the page. Since the user clicks Start, this usually gives the app permission to play generated audio later.

---

## 16. Step 5.11 — Validation Rules

The countdown input should follow these rules:

| Field   | Minimum | Maximum |
| ------- | ------- | ------- |
| Hours   | 0       | 23      |
| Minutes | 0       | 59      |
| Seconds | 0       | 59      |

The timer should not start if:

```txt
hours = 0
minutes = 0
seconds = 0
```

Recommended max total duration:

```txt
23:59:59
```

This is enough for the first version.

---

## 17. Step 5.12 — Visual States

The Countdown Timer should show different visual states.

### Idle

- Ring is full if a duration is selected
- Time display shows selected duration
- Start button is visible

### Running

- Ring decreases
- Time display updates
- Start button becomes Pause
- Inputs are disabled

### Paused

- Ring freezes
- Button shows Resume
- Reset button remains available

### Done

- Ring turns green
- Completion sound plays
- Notification sends if allowed
- Reset button remains available

### Danger

When progress is below 10%:

```ts
progress <= 0.1;
```

The ring should turn danger red.

---

## 18. Step 5.13 — Accessibility Rules

Countdown Timer accessibility rules:

- Inputs should have clear labels
- Buttons should use real `<button>` elements
- Disabled buttons should be visibly disabled
- Progress ring should have `aria-label`
- Timer status should be visible as text
- Do not rely only on color for danger or done state
- Animation should not flash quickly
- Keyboard users should be able to operate all controls

---

## 19. Step 5.14 — Responsive Rules

### Desktop

```txt
Progress ring centered
Controls under ring
Inputs below controls
Preset buttons in one row
```

### Tablet

```txt
Same layout as desktop
Slightly smaller spacing
```

### Mobile

```txt
Progress ring scales down if needed
Inputs stay in 3 columns if possible
Preset buttons wrap
Buttons remain touch-friendly
```

Minimum touch target:

```txt
44px height
```

---

## 20. Step 5.15 — Performance Notes

Countdown Timer performance rules:

1. Use `requestAnimationFrame` only while timer is running.
2. Cancel animation frames when paused, reset, done, or unmounted.
3. Use `Date.now()` for real elapsed time.
4. Do not update unnecessary parent state every frame.
5. Keep progress ring SVG simple.
6. Avoid heavy animations during countdown.

---

## 21. What This Phase Does Not Include

This phase does not include:

- Stopwatch
- Pomodoro
- Alarm System
- Calendar
- Global keyboard shortcuts
- Notification permission banner
- Advanced timer history
- Multiple countdown timers
- Saved countdown presets
- Custom alarm sounds
- Background/closed-browser timer guarantees

These can be added later if needed.

---

## 22. Important Limitation

The countdown is a browser-based timer.

It should work while the app is open or active. However, with a frontend-only LocalStorage architecture, the app should not promise guaranteed alerts if:

- The browser is closed
- The tab is killed
- The device is off
- The operating system suspends the browser

This limitation should be clearly understood before building alarm-like behavior.

---

## 23. Completion Checklist

Phase 5 is complete when:

- [ ] `CountdownTab.tsx` exists
- [ ] `CountdownInput.tsx` exists
- [ ] `CountdownRing.tsx` exists
- [ ] `CircularProgress.tsx` exists
- [ ] `useTimer.ts` has accurate countdown logic
- [ ] User can input hours, minutes, and seconds
- [ ] Input values are validated
- [ ] Preset buttons work
- [ ] Timer can start
- [ ] Timer can pause
- [ ] Timer can resume
- [ ] Timer can reset
- [ ] Ring progress decreases correctly
- [ ] Remaining time display updates correctly
- [ ] Danger state appears near the end
- [ ] Done state appears when timer completes
- [ ] Completion sound plays
- [ ] Browser notification sends if permission is granted
- [ ] Reset stops any active sound
- [ ] Inputs are disabled while running
- [ ] `CountdownTab` is connected to `AppShell`
- [ ] Layout works on desktop, tablet, and mobile
- [ ] No TypeScript errors
- [ ] No ESLint errors

---

## 24. Recommended Next Phase

After the Countdown Timer tab is complete, move to:

**Phase 6 — Stopwatch Tab**

That phase should include:

- Stopwatch timing logic
- Millisecond display
- Start / stop / reset
- Lap recording
- Best and worst lap highlighting
- Copy laps button
