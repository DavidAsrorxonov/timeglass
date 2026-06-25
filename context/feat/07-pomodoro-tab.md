# Timeglass — Phase 7: Pomodoro Tab

## 1. Purpose

This document explains **Phase 7 — Pomodoro Tab** for the **Timeglass** project.

The goal of this phase is to build the Pomodoro productivity module. Users should be able to start a focus session, move into a break session, track completed Pomodoros, and view simple daily productivity stats.

The Pomodoro tab reuses infrastructure and components from previous phases, especially:

- `useTimer`
- `usePomodoro`
- `CircularProgress`
- `GlassPanel`
- `AudioManager`
- `useNotifications`
- LocalStorage persistence

---

## 2. Phase Goal

By the end of this phase, Timeglass should have a working Pomodoro tab with:

- Classic 25-minute focus timer
- 5-minute short break timer
- Long break prompt after 4 focus sessions
- Start button
- Pause / resume behavior
- Skip button
- Reset button
- Circular progress ring
- Focus and break phase labels
- Pomodoro cycle counter
- Tomato-style session indicators
- Daily completed Pomodoro count
- Total focus minutes
- Streak tracking
- LocalStorage persistence for stats
- Completion sound
- Browser notification when permission is granted

---

## 3. Files Created in This Phase

Phase 7 should create or update these files:

```txt
components/
└── pomodoro/
    ├── PomodoroTab.tsx
    └── PomodoroRing.tsx

hooks/
└── usePomodoro.ts
```

Also update:

```txt
components/layout/AppShell.tsx
components/ui/CircularProgress.tsx
hooks/useTimer.ts
hooks/useNotifications.ts
lib/audio.ts
types/index.ts
lib/storage-keys.ts
```

---

## 4. Pomodoro Overview

The Pomodoro technique is a simple productivity method:

1. Focus for 25 minutes
2. Take a 5-minute break
3. Repeat
4. After 4 focus sessions, take a longer break

Basic layout:

```txt
┌──────────────────────────────────────┐
│              Pomodoro                │
│                                      │
│          Phase: FOCUS                │
│                                      │
│          [Progress Ring]             │
│              25:00                   │
│                                      │
│      [Start/Pause] [Skip] [Reset]    │
│                                      │
│        🍅 🍅 ○ ○    Session 2 of 4    │
│                                      │
│  ┌────────────────────────────────┐  │
│  │ Today: 3 Pomodoros             │  │
│  │ Focus Time: 75 minutes         │  │
│  │ Streak: 🔥 4 days              │  │
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘
```

The design should feel calm, focused, and motivating.

---

## 5. Pomodoro Phases

The Pomodoro module uses these phases:

```ts
type PomodoroPhase = "idle" | "focus" | "break";
```

### Phase meanings

| Phase   | Meaning                         |
| ------- | ------------------------------- |
| `idle`  | No active Pomodoro session      |
| `focus` | User is in a focus work session |
| `break` | User is in a rest break session |

---

## 6. Pomodoro Durations

Use these durations for the first version:

```ts
const FOCUS_DURATION = 25 * 60 * 1000;
const SHORT_BREAK_DURATION = 5 * 60 * 1000;
const LONG_BREAK_DURATION = 15 * 60 * 1000;
const SESSIONS_BEFORE_LONG_BREAK = 4;
```

### First version behavior

- Focus session: 25 minutes
- Short break: 5 minutes
- Long break: 15 minutes
- Long break appears after 4 completed focus sessions

---

## 7. Step 7.1 — Update Types

Update:

```txt
types/index.ts
```

Make sure these types exist:

```ts
export type PomodoroPhase = "idle" | "focus" | "break";

export interface PomodoroSession {
  completedPomodoros: number;
  totalFocusMinutes: number;
  streak: number;
  lastDate?: string;
}
```

### Field meanings

| Field                | Meaning                                             |
| -------------------- | --------------------------------------------------- |
| `completedPomodoros` | Total completed Pomodoro sessions                   |
| `totalFocusMinutes`  | Total focus minutes completed                       |
| `streak`             | Number of days with at least one completed Pomodoro |
| `lastDate`           | Last date when a Pomodoro was completed             |

---

## 8. Step 7.2 — Update Storage Keys

Update:

```txt
lib/storage-keys.ts
```

Make sure this key exists:

```ts
POMODORO_STATS: "timeglass:pomodoro-stats";
```

Full example:

```ts
export const STORAGE_KEYS = {
  ACTIVE_TAB: "timeglass:active-tab",
  TIMEZONES: "timeglass:timezones",
  CLOCK_FORMAT: "timeglass:clock-format",
  ALARMS: "timeglass:alarms",
  CALENDAR_EVENTS: "timeglass:calendar-events",
  POMODORO_STATS: "timeglass:pomodoro-stats",
  NOTIFICATION_PERMISSION: "timeglass:notification-permission",
} as const;
```

---

## 9. Step 7.3 — Streak Logic

Pomodoro streak should update when the user completes at least one focus session in a day.

### Helper functions

```ts
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
```

### Streak examples

| Previous completion date | Today | Result             |
| ------------------------ | ----- | ------------------ |
| Today                    | Today | Streak unchanged   |
| Yesterday                | Today | Streak + 1         |
| Older than yesterday     | Today | Streak resets to 1 |
| No previous date         | Today | Streak starts at 1 |

---

## 10. Step 7.4 — usePomodoro Hook

Update:

```txt
hooks/usePomodoro.ts
```

This hook controls Pomodoro-specific state and stats.

### Required behavior

The hook should:

- Track current phase
- Track cycle count
- Track whether long break is due
- Store Pomodoro stats in LocalStorage
- Update completed Pomodoros
- Update total focus minutes
- Update daily streak
- Reset current Pomodoro session
- Skip to next phase
- Support focus and break transitions

### Recommended implementation

```ts
"use client";

import { useCallback, useMemo, useState } from "react";
import type { PomodoroPhase, PomodoroSession } from "@/types";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import { useLocalStorage } from "@/hooks/useLocalStorage";

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
      completeFocusSession();
      return;
    }

    if (phase === "break") {
      completeBreakSession();
      return;
    }

    startFocus();
  }, [completeBreakSession, completeFocusSession, phase, startFocus]);

  const reset = useCallback(() => {
    setPhase("idle");
    setCycleCount(0);
    setUseLongBreak(false);
  }, []);

  return {
    phase,
    cycleCount,
    useLongBreak,
    currentDuration,
    stats,
    startFocus,
    startBreak,
    completeFocusSession,
    completeBreakSession,
    skipPhase,
    reset,
    clearStats,
  };
}
```

---

## 11. Step 7.5 — PomodoroRing Component

Create:

```txt
components/pomodoro/PomodoroRing.tsx
```

This component displays the current Pomodoro phase, remaining time, and circular progress.

### Required props

```ts
interface PomodoroRingProps {
  phase: PomodoroPhase;
  remainingMs: number;
  progress: number;
  isLongBreak?: boolean;
}
```

### Example implementation

```tsx
"use client";

import { motion } from "framer-motion";
import type { PomodoroPhase } from "@/types";
import { CircularProgress } from "@/components/ui/CircularProgress";

interface PomodoroRingProps {
  phase: PomodoroPhase;
  remainingMs: number;
  progress: number;
  isLongBreak?: boolean;
}

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
      ? "READY"
      : isBreak
        ? isLongBreak
          ? "LONG BREAK"
          : "BREAK"
        : "FOCUS";

  return (
    <div className="relative mx-auto flex h-75 w-75 items-center justify-center">
      <motion.div
        animate={
          phase === "focus" ? { scale: [1, 1.015, 1] } : { scale: [1, 1.01, 1] }
        }
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <CircularProgress
          value={progress}
          size={300}
          strokeWidth={14}
          success={isBreak}
        />
      </motion.div>

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <p className="text-sm uppercase tracking-[0.35em] text-(--text-muted)">
          {label}
        </p>

        <p className="mt-3 font-mono text-6xl font-semibold text-foreground">
          {formatDuration(remainingMs)}
        </p>

        <p className="mt-3 text-sm text-(--text-muted)">
          {isBreak ? "Rest and reset." : "Stay focused."}
        </p>
      </div>
    </div>
  );
}
```

### Color behavior

The ring should use:

| Phase | Color         |
| ----- | ------------- |
| Focus | Violet accent |
| Break | Green accent  |

This can be controlled through `CircularProgress`.

---

## 12. Step 7.6 — Session Indicator

The Pomodoro tab should show four small session indicators.

Example:

```txt
🍅 🍅 ○ ○
Session 2 of 4
```

### Helper logic

```ts
const sessionInCycle = cycleCount % 4;
```

### Example render

```tsx
<div className="flex justify-center gap-2">
  {Array.from({ length: 4 }, (_, index) => {
    const completed = index < sessionInCycle;

    return (
      <span key={index} className="text-2xl">
        {completed ? "🍅" : "○"}
      </span>
    );
  })}
</div>
```

### Note

If the user completes exactly 4 sessions, `cycleCount % 4` becomes `0`. During the long break, it may be better to show all four tomatoes.

Example:

```ts
const sessionInCycle =
  cycleCount > 0 && cycleCount % 4 === 0 ? 4 : cycleCount % 4;
```

---

## 13. Step 7.7 — PomodoroTab Component

Create:

```txt
components/pomodoro/PomodoroTab.tsx
```

This is the main Pomodoro screen.

### Responsibilities

`PomodoroTab` should:

- Use `usePomodoro`
- Use `useTimer`
- Start focus timer
- Pause timer
- Resume timer
- Skip phase
- Reset session
- Complete focus session
- Complete break session
- Update stats
- Render Pomodoro ring
- Render controls
- Render session indicators
- Render stats panel
- Play sound on phase completion
- Send browser notification when permission is granted

### Example implementation

```tsx
"use client";

import { Pause, Play, RotateCcw, SkipForward } from "lucide-react";
import { useEffect, useMemo } from "react";
import { PomodoroRing } from "@/components/pomodoro/PomodoroRing";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { useNotifications } from "@/hooks/useNotifications";
import { usePomodoro, FOCUS_DURATION } from "@/hooks/usePomodoro";
import { useTimer } from "@/hooks/useTimer";
import { AudioManager } from "@/lib/audio";

export function PomodoroTab() {
  const pomodoro = usePomodoro();
  const { sendNotification } = useNotifications();

  const timer = useTimer({
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
      timer.startTimer(pomodoro.currentDuration);
    }
  }, [pomodoro.phase, pomodoro.currentDuration]);

  const isRunning = timer.status === "running";
  const isPaused = timer.status === "paused";
  const isIdle = pomodoro.phase === "idle";

  const displayRemaining = isIdle ? FOCUS_DURATION : timer.remainingMs;
  const displayProgress = isIdle ? 1 : timer.progress;

  const sessionInCycle = useMemo(() => {
    if (pomodoro.cycleCount > 0 && pomodoro.cycleCount % 4 === 0) {
      return 4;
    }

    return pomodoro.cycleCount % 4;
  }, [pomodoro.cycleCount]);

  const handlePrimaryAction = () => {
    if (isRunning) {
      timer.pause();
      return;
    }

    if (isPaused) {
      timer.resume();
      return;
    }

    if (isIdle) {
      pomodoro.startFocus();
    }
  };

  const handleSkip = () => {
    timer.reset();
    pomodoro.skipPhase();
  };

  const handleReset = () => {
    timer.reset();
    AudioManager.stopAllSounds();
    pomodoro.reset();
  };

  return (
    <GlassPanel className="p-6 lg:p-8" glow>
      <div className="text-center">
        <p className="text-sm uppercase tracking-[0.35em] text-(--accent-glow)">
          Pomodoro
        </p>

        <h2 className="mt-3 text-3xl font-semibold text-foreground">
          Focus deeply, then rest.
        </h2>

        <p className="mt-3 text-sm text-(--text-muted)">
          Classic 25-minute focus sessions with short breaks.
        </p>
      </div>

      <div className="mt-8">
        <PomodoroRing
          phase={pomodoro.phase}
          remainingMs={displayRemaining}
          progress={displayProgress}
          isLongBreak={pomodoro.useLongBreak}
        />
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={handlePrimaryAction}
          className="inline-flex items-center gap-2 rounded-full bg-(--accent-primary) px-6 py-3 font-medium text-white shadow-[0_0_24px_rgba(124,107,255,0.35)] transition hover:bg-(--accent-glow)"
        >
          {isRunning ? <Pause size={18} /> : <Play size={18} />}
          {isRunning ? "Pause" : isPaused ? "Resume" : "Start"}
        </button>

        <button
          type="button"
          onClick={handleSkip}
          disabled={isIdle}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 px-6 py-3 font-medium text-foreground transition hover:border-(--accent-primary) disabled:cursor-not-allowed disabled:opacity-40"
        >
          <SkipForward size={18} />
          Skip
        </button>

        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 px-6 py-3 font-medium text-foreground transition hover:border-(--accent-danger)"
        >
          <RotateCcw size={18} />
          Reset
        </button>
      </div>

      <div className="mt-8 text-center">
        <div className="flex justify-center gap-2">
          {Array.from({ length: 4 }, (_, index) => {
            const completed = index < sessionInCycle;

            return (
              <span key={index} className="text-2xl">
                {completed ? "🍅" : "○"}
              </span>
            );
          })}
        </div>

        <p className="mt-2 text-sm text-(--text-muted)">
          Session {sessionInCycle || 1} of 4
        </p>
      </div>

      <div className="mx-auto mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">
        <div className="glass-panel p-4 text-center">
          <p className="text-sm text-(--text-muted)">Completed</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">
            {pomodoro.stats.completedPomodoros}
          </p>
        </div>

        <div className="glass-panel p-4 text-center">
          <p className="text-sm text-(--text-muted)">Focus Minutes</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">
            {pomodoro.stats.totalFocusMinutes}
          </p>
        </div>

        <div className="glass-panel p-4 text-center">
          <p className="text-sm text-(--text-muted)">Streak</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">
            🔥 {pomodoro.stats.streak}
          </p>
        </div>
      </div>
    </GlassPanel>
  );
}
```

---

## 14. Important Hook Dependency Note

The example uses:

```ts
useEffect(() => {
  if (pomodoro.phase === "focus" || pomodoro.phase === "break") {
    timer.startTimer(pomodoro.currentDuration);
  }
}, [pomodoro.phase, pomodoro.currentDuration]);
```

Depending on the final `useTimer` implementation, this may trigger lint dependency warnings.

A cleaner final implementation may use a stable action function:

```ts
const startCurrentPhaseTimer = () => {
  timer.startTimer(pomodoro.currentDuration);
};
```

Or the Pomodoro tab can control timer start directly when the user starts/skips/completes a phase.

The important behavior is:

```txt
When phase changes, the correct duration starts.
```

---

## 15. Step 7.8 — Connect PomodoroTab to AppShell

Update:

```txt
components/layout/AppShell.tsx
```

Import:

```tsx
import { PomodoroTab } from "@/components/pomodoro/PomodoroTab";
```

Then replace the Pomodoro placeholder:

```tsx
case "pomodoro":
  return <PomodoroTab />;
```

Now the Pomodoro tab should render when the user clicks the Pomodoro tab.

---

## 16. Step 7.9 — Phase Completion Behavior

When a focus session completes:

1. Play gentle sound
2. Send notification if allowed
3. Increment completed Pomodoros
4. Add 25 focus minutes
5. Update streak
6. Increment cycle count
7. Start break phase
8. Use long break if 4 focus sessions are completed

When a break completes:

1. Play gentle sound
2. Send notification if allowed
3. Start next focus phase

---

## 17. Step 7.10 — Long Break Behavior

After every 4 completed focus sessions:

```txt
Focus → Break should become Focus → Long Break
```

### First version behavior

The app can automatically start a 15-minute long break.

### Alternative behavior

The app can show a prompt:

```txt
You completed 4 sessions. Start a 15-minute long break?
```

For the first version, automatic long break is simpler.

---

## 18. Step 7.11 — Stats Panel

The Pomodoro stats panel should show:

| Stat          | Meaning                           |
| ------------- | --------------------------------- |
| Completed     | Total completed Pomodoro sessions |
| Focus Minutes | Total completed focus minutes     |
| Streak        | Number of active Pomodoro days    |

Example:

```txt
Completed: 8
Focus Minutes: 200
Streak: 🔥 3
```

### Storage

Stats should be stored in:

```ts
STORAGE_KEYS.POMODORO_STATS;
```

---

## 19. Step 7.12 — Button Rules

The Pomodoro tab buttons should behave like this:

| Button        | Idle     | Focus Running                   | Break Running                   | Paused                          |
| ------------- | -------- | ------------------------------- | ------------------------------- | ------------------------------- |
| Start / Pause | Start    | Pause                           | Pause                           | Resume                          |
| Skip          | Disabled | Skip to break                   | Skip to focus                   | Skip current phase              |
| Reset         | Enabled  | Reset all current session state | Reset all current session state | Reset all current session state |

### Notes

- Reset should not clear long-term stats.
- Reset should only reset the current Pomodoro session.
- A separate “Clear stats” option can be added later.

---

## 20. Step 7.13 — Audio and Notifications

When a Pomodoro phase completes:

```ts
AudioManager.playAlarmSound("gentle");
```

When focus completes:

```txt
Notification: Focus session complete
Body: Nice work. Time for a break.
```

When break completes:

```txt
Notification: Break complete
Body: Break is over. Time to focus again.
```

### Important

The app should not request notification permission automatically. It should only send notifications if permission is already granted.

---

## 21. Step 7.14 — Visual States

### Idle

- Ring shows 25:00
- Label shows READY
- Start button is active

### Focus

- Ring uses violet accent
- Label shows FOCUS
- Timer counts down from 25:00
- Text encourages focus

### Break

- Ring uses green accent
- Label shows BREAK or LONG BREAK
- Timer counts down from 5:00 or 15:00
- Text encourages rest

### Paused

- Ring freezes
- Primary button shows Resume

---

## 22. Step 7.15 — Accessibility Rules

Pomodoro accessibility rules:

- Buttons should use real `<button>` elements
- Icons should be paired with text labels
- Timer phase should be visible as text
- Progress ring should have an accessible label
- Do not rely only on color to show focus vs break
- Avoid fast flashing animations
- Controls should be keyboard accessible
- Stats should be readable as normal text

---

## 23. Step 7.16 — Responsive Rules

### Desktop

```txt
Large ring centered
Controls in one row
Session indicators below
Stats in three columns
```

### Tablet

```txt
Same layout as desktop
Stats may stay in three columns or wrap
```

### Mobile

```txt
Ring scales down if needed
Controls wrap
Stats stack or use one column
Touch targets stay large
```

Minimum touch target:

```txt
44px height
```

---

## 24. Step 7.17 — Performance Notes

Pomodoro performance rules:

1. Reuse `useTimer` instead of creating new timer logic.
2. Use `requestAnimationFrame` only while active.
3. Avoid heavy animations on every timer tick.
4. Keep stats updates only on focus completion.
5. Keep LocalStorage writes minimal.
6. Stop sounds on reset.
7. Avoid duplicated completion callbacks.

---

## 25. Important Limitation

The Pomodoro timer is browser-based.

It should work while the app is open or active. The first version should not promise guaranteed Pomodoro alerts if:

- The browser is closed
- The tab is killed
- The device is off
- The operating system suspends the browser

This is the same limitation as the Countdown Timer and Alarm System.

---

## 26. What This Phase Does Not Include

This phase does not include:

- Custom focus duration
- Custom break duration
- Custom long break duration
- Task list
- Pomodoro history chart
- Daily analytics
- Cloud sync
- User account system
- Server push notifications
- Background Pomodoro tracking after browser close

These can be considered for future versions.

---

## 27. Completion Checklist

Phase 7 is complete when:

- [ ] `PomodoroTab.tsx` exists
- [ ] `PomodoroRing.tsx` exists
- [ ] `usePomodoro.ts` has Pomodoro phase logic
- [ ] Focus duration is 25 minutes
- [ ] Short break duration is 5 minutes
- [ ] Long break duration is 15 minutes
- [ ] Start button works
- [ ] Pause button works
- [ ] Resume behavior works
- [ ] Skip button works
- [ ] Reset button works
- [ ] Focus session completion moves to break
- [ ] Break completion moves to focus
- [ ] Long break happens after 4 completed focus sessions
- [ ] Pomodoro ring displays correct progress
- [ ] Phase label changes correctly
- [ ] Session indicators work
- [ ] Completed Pomodoro count updates
- [ ] Total focus minutes update
- [ ] Streak updates correctly
- [ ] Stats persist in LocalStorage
- [ ] Completion sound plays
- [ ] Browser notification sends if permission is granted
- [ ] Reset stops any active sound
- [ ] `PomodoroTab` is connected to `AppShell`
- [ ] Layout works on desktop, tablet, and mobile
- [ ] No TypeScript errors
- [ ] No ESLint errors

---

## 28. Recommended Next Phase

After the Pomodoro tab is complete, move to:

**Phase 8 — Alarm System Tab**

That phase should include:

- Alarm list
- Create alarm
- Edit alarm
- Delete alarm
- Enable / disable alarm
- Day-of-week selection
- Sound selection
- Snooze
- Dismiss
- Full-screen ringing overlay
