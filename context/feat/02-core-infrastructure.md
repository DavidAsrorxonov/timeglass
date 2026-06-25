# Timeglass — Phase 2: Core Infrastructure

## 1. Purpose

This document explains **Phase 2 — Core Infrastructure** for the **Timeglass** project.

The goal of this phase is to build the shared technical foundation that all main features will use later. Before creating the World Clock, Countdown Timer, Stopwatch, Pomodoro, Alarm System, and Local Calendar, the project needs reusable types, hooks, storage utilities, notification logic, audio logic, and time calculation helpers.

This phase focuses on logic and reusable systems, not final UI design.

---

## 2. Phase Goal

By the end of this phase, Timeglass should have:

- Shared TypeScript types
- LocalStorage storage key constants
- A reusable LocalStorage hook
- A browser notification hook
- A Web Audio API sound manager
- A live clock hook
- A basic structure for future timer, stopwatch, alarm, Pomodoro, and calendar logic
- SSR-safe browser API handling for Next.js
- A clean infrastructure layer ready for feature modules

---

## 3. Files Created in This Phase

Phase 2 should create or prepare these files:

```txt
types/
└── index.ts

lib/
├── storage-keys.ts
├── audio.ts
└── timezones.ts

hooks/
├── useLocalStorage.ts
├── useNotifications.ts
├── useClock.ts
├── useTimer.ts
├── useStopwatch.ts
├── useAlarms.ts
└── usePomodoro.ts
```

Some hooks can start as basic versions first, then become more advanced during their feature phases.

---

## 4. Step 2.1 — Shared Types

Create:

```txt
types/index.ts
```

This file stores shared TypeScript interfaces and types used across the whole app.

```ts
export type TabId =
  | "clock"
  | "countdown"
  | "stopwatch"
  | "pomodoro"
  | "alarm"
  | "calendar";

export type AlarmSound = "bell" | "digital" | "gentle" | "pulse";

export type DayOfWeek = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";

export interface Timezone {
  id: string;
  city: string;
  region: string;
  offset: string;
  pinned: boolean;
}

export interface Alarm {
  id: string;
  label: string;
  time: string;
  days: DayOfWeek[];
  enabled: boolean;
  sound: AlarmSound;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time?: string;
  color: string;
}

export interface PomodoroSession {
  completedPomodoros: number;
  totalFocusMinutes: number;
  streak: number;
  lastDate?: string;
}

export interface LapEntry {
  index: number;
  lapTime: number;
  totalTime: number;
}

export type TimerStatus = "idle" | "running" | "paused" | "done";

export type StopwatchStatus = "idle" | "running" | "paused";

export type PomodoroPhase = "idle" | "focus" | "break";
```

### Why this is important

Shared types help keep the project consistent. For example, the Alarm System, Alarm Card, Alarm Modal, and LocalStorage hook can all use the same `Alarm` interface.

---

## 5. Step 2.2 — Storage Key Constants

Create:

```txt
lib/storage-keys.ts
```

This file keeps all LocalStorage keys in one place.

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

### Why this is important

Using constants avoids spelling mistakes and makes storage easier to manage.

Instead of writing:

```ts
localStorage.getItem("alarms");
```

Use:

```ts
localStorage.getItem(STORAGE_KEYS.ALARMS);
```

This is cleaner and safer.

---

## 6. Step 2.3 — LocalStorage Hook

Create:

```txt
hooks/useLocalStorage.ts
```

This hook should allow any feature to save, read, update, and remove data from LocalStorage.

### Required behavior

The hook should:

- Be generic: `useLocalStorage<T>()`
- Accept a key and default value
- Return value, setter, and remover
- Save data as JSON
- Read data from JSON
- Handle broken JSON safely
- Avoid crashing during SSR
- Sync data across browser tabs using the `storage` event

### Basic implementation

```ts
"use client";

import { useCallback, useEffect, useState } from "react";

type UseLocalStorageReturn<T> = [
  T,
  (value: T | ((previous: T) => T)) => void,
  () => void,
];

export function useLocalStorage<T>(
  key: string,
  defaultValue: T,
): UseLocalStorageReturn<T> {
  const readValue = useCallback((): T => {
    if (typeof window === "undefined") {
      return defaultValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : defaultValue;
    } catch {
      return defaultValue;
    }
  }, [key, defaultValue]);

  const [storedValue, setStoredValue] = useState<T>(readValue);

  const setValue = useCallback(
    (value: T | ((previous: T) => T)) => {
      if (typeof window === "undefined") {
        return;
      }

      try {
        setStoredValue((previous) => {
          const valueToStore =
            value instanceof Function ? value(previous) : value;

          window.localStorage.setItem(key, JSON.stringify(valueToStore));
          return valueToStore;
        });
      } catch {
        // LocalStorage may fail in private browsing or restricted environments.
      }
    },
    [key],
  );

  const removeValue = useCallback(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      window.localStorage.removeItem(key);
      setStoredValue(defaultValue);
    } catch {
      // Ignore storage errors safely.
    }
  }, [key, defaultValue]);

  useEffect(() => {
    setStoredValue(readValue());
  }, [readValue]);

  useEffect(() => {
    function handleStorageChange(event: StorageEvent) {
      if (event.key === key) {
        setStoredValue(readValue());
      }
    }

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [key, readValue]);

  return [storedValue, setValue, removeValue];
}
```

### Used by

This hook will later be used by:

- Timezone cards
- 12h / 24h clock preference
- Alarms
- Calendar events
- Pomodoro statistics
- Last active tab

---

## 7. Step 2.4 — Notifications Hook

Create:

```txt
hooks/useNotifications.ts
```

This hook manages browser notification permission and notification sending.

### Important browser rule

Notification permission should not be requested automatically on page load. It should be requested after user interaction, such as clicking an "Enable Notifications" button.

### Required behavior

The hook should provide:

- Current permission state
- `requestPermission()`
- `sendNotification(title, options)`
- `canNotify`
- Safe behavior when the browser does not support notifications

### Basic implementation

```ts
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

export function useNotifications() {
  const [permission, setPermission] =
    useState<NotificationPermission>("default");

  const isSupported = typeof window !== "undefined" && "Notification" in window;

  useEffect(() => {
    if (!isSupported) {
      return;
    }

    setPermission(Notification.permission);
  }, [isSupported]);

  const requestPermission = useCallback(async () => {
    if (!isSupported) {
      return "denied" as NotificationPermission;
    }

    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  }, [isSupported]);

  const sendNotification = useCallback(
    (title: string, options?: NotificationOptions) => {
      if (!isSupported || Notification.permission !== "granted") {
        return;
      }

      new Notification(title, options);
    },
    [isSupported],
  );

  const canNotify = useMemo(() => {
    return isSupported && permission === "granted";
  }, [isSupported, permission]);

  return {
    isSupported,
    permission,
    canNotify,
    requestPermission,
    sendNotification,
  };
}
```

### Used by

This hook will later be used by:

- Countdown completion
- Pomodoro phase completion
- Alarm ringing
- Notification permission banner

---

## 8. Step 2.5 — Audio Manager

Create:

```txt
lib/audio.ts
```

This file controls sound alerts using the Web Audio API.

No external audio files are required for the first version.

### Required behavior

The audio manager should:

- Create tones with oscillators
- Support different alarm sound styles
- Track active oscillators
- Stop all currently playing sounds
- Avoid crashing if Web Audio API is unavailable
- Start sounds only after user interaction when required by the browser

### Basic implementation

```ts
import type { AlarmSound } from "@/types";

type OscillatorTypeName = OscillatorType;

class AudioManagerClass {
  private context: AudioContext | null = null;
  private oscillators: OscillatorNode[] = [];

  private getContext() {
    if (typeof window === "undefined") {
      return null;
    }

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) {
      return null;
    }

    if (!this.context) {
      this.context = new AudioContextClass();
    }

    return this.context;
  }

  async unlock() {
    const context = this.getContext();

    if (!context) {
      return;
    }

    if (context.state === "suspended") {
      await context.resume();
    }
  }

  playTone(
    frequency: number,
    duration: number,
    type: OscillatorTypeName = "sine",
    delay = 0,
  ) {
    const context = this.getContext();

    if (!context) {
      return;
    }

    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, context.currentTime + delay);

    gain.gain.setValueAtTime(0.001, context.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(
      0.2,
      context.currentTime + delay + 0.02,
    );
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      context.currentTime + delay + duration,
    );

    oscillator.connect(gain);
    gain.connect(context.destination);

    oscillator.start(context.currentTime + delay);
    oscillator.stop(context.currentTime + delay + duration);

    this.oscillators.push(oscillator);

    oscillator.onended = () => {
      this.oscillators = this.oscillators.filter((item) => item !== oscillator);
    };
  }

  playAlarmSound(sound: AlarmSound = "digital") {
    void this.unlock();

    if (sound === "bell") {
      this.playTone(880, 0.22, "sine", 0);
      this.playTone(660, 0.22, "sine", 0.24);
      this.playTone(440, 0.3, "sine", 0.48);
      return;
    }

    if (sound === "gentle") {
      this.playTone(523.25, 0.4, "sine", 0);
      this.playTone(659.25, 0.4, "sine", 0.45);
      this.playTone(783.99, 0.5, "sine", 0.9);
      return;
    }

    if (sound === "pulse") {
      for (let index = 0; index < 5; index += 1) {
        this.playTone(700, 0.12, "sine", index * 0.22);
      }
      return;
    }

    // digital
    for (let index = 0; index < 6; index += 1) {
      this.playTone(950, 0.08, "square", index * 0.14);
    }
  }

  stopAllSounds() {
    this.oscillators.forEach((oscillator) => {
      try {
        oscillator.stop();
      } catch {
        // Oscillator may already be stopped.
      }
    });

    this.oscillators = [];
  }
}

export const AudioManager = new AudioManagerClass();
```

### TypeScript note

Some TypeScript setups may not recognize `window.webkitAudioContext`.

If needed, create a small global type declaration later:

```ts
declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}
```

---

## 9. Step 2.6 — Clock Hook

Create:

```txt
hooks/useClock.ts
```

This hook gives live time data for the local clock and world clock cards.

### Required behavior

The hook should:

- Use `requestAnimationFrame`
- Update smoothly
- Return date, hours, minutes, seconds, milliseconds, and day
- Accept an optional IANA timezone
- Clean up animation frame on unmount
- Avoid unnecessary errors during SSR

### Basic implementation

```ts
"use client";

import { useEffect, useMemo, useState } from "react";

interface ClockState {
  date: Date;
  hours: number;
  minutes: number;
  seconds: number;
  milliseconds: number;
  dayOfWeek: string;
}

function getTimeParts(timezone?: string): ClockState {
  const now = new Date();

  if (!timezone) {
    return {
      date: now,
      hours: now.getHours(),
      minutes: now.getMinutes(),
      seconds: now.getSeconds(),
      milliseconds: now.getMilliseconds(),
      dayOfWeek: now.toLocaleDateString("en-US", { weekday: "long" }),
    };
  }

  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    weekday: "long",
    hour12: false,
  });

  const parts = formatter.formatToParts(now);

  const getPart = (type: string) => {
    return parts.find((part) => part.type === type)?.value ?? "0";
  };

  return {
    date: now,
    hours: Number(getPart("hour")),
    minutes: Number(getPart("minute")),
    seconds: Number(getPart("second")),
    milliseconds: now.getMilliseconds(),
    dayOfWeek: getPart("weekday"),
  };
}

export function useClock(timezone?: string) {
  const [clock, setClock] = useState<ClockState>(() => getTimeParts(timezone));

  useEffect(() => {
    let frameId: number;

    const tick = () => {
      setClock(getTimeParts(timezone));
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [timezone]);

  return useMemo(() => clock, [clock]);
}
```

### Used by

This hook will later be used by:

- Main analog clock
- Main digital clock
- Timezone cards
- Mini analog clock previews
- Alarm time checking

---

## 10. Step 2.7 — Timezone Data File

Create:

```txt
lib/timezones.ts
```

This file stores timezone options for the World Clock module.

Start with a small useful list first. A larger IANA list can be added later.

```ts
import type { Timezone } from "@/types";

export const DEFAULT_TIMEZONES: Timezone[] = [
  {
    id: "asia-tokyo",
    city: "Tokyo",
    region: "Japan",
    offset: "+09:00",
    pinned: true,
  },
  {
    id: "asia-tashkent",
    city: "Tashkent",
    region: "Uzbekistan",
    offset: "+05:00",
    pinned: false,
  },
  {
    id: "europe-london",
    city: "London",
    region: "United Kingdom",
    offset: "+00:00",
    pinned: false,
  },
  {
    id: "america-new-york",
    city: "New York",
    region: "United States",
    offset: "-05:00",
    pinned: false,
  },
];

export const TIMEZONE_OPTIONS = [
  {
    id: "Asia/Tokyo",
    city: "Tokyo",
    region: "Japan",
  },
  {
    id: "Asia/Tashkent",
    city: "Tashkent",
    region: "Uzbekistan",
  },
  {
    id: "Europe/London",
    city: "London",
    region: "United Kingdom",
  },
  {
    id: "America/New_York",
    city: "New York",
    region: "United States",
  },
  {
    id: "Europe/Paris",
    city: "Paris",
    region: "France",
  },
  {
    id: "Asia/Dubai",
    city: "Dubai",
    region: "United Arab Emirates",
  },
];
```

### Later improvement

Later, this file can be replaced with a full IANA timezone list and fuzzy search.

---

## 11. Step 2.8 — Timer Hook Placeholder

Create:

```txt
hooks/useTimer.ts
```

This hook will be fully developed in the Countdown Timer phase.

For now, it can define the expected structure.

```ts
"use client";

import { useCallback, useState } from "react";
import type { TimerStatus } from "@/types";

export function useTimer() {
  const [status, setStatus] = useState<TimerStatus>("idle");
  const [remainingMs, setRemainingMs] = useState(0);
  const [durationMs, setDurationMs] = useState(0);

  const startTimer = useCallback((duration: number) => {
    setDurationMs(duration);
    setRemainingMs(duration);
    setStatus("running");
  }, []);

  const pause = useCallback(() => {
    setStatus("paused");
  }, []);

  const resume = useCallback(() => {
    setStatus("running");
  }, []);

  const reset = useCallback(() => {
    setStatus("idle");
    setRemainingMs(0);
    setDurationMs(0);
  }, []);

  const progress = durationMs > 0 ? remainingMs / durationMs : 0;

  return {
    status,
    remainingMs,
    durationMs,
    progress,
    startTimer,
    pause,
    resume,
    reset,
  };
}
```

---

## 12. Step 2.9 — Stopwatch Hook Placeholder

Create:

```txt
hooks/useStopwatch.ts
```

This hook will be fully developed in the Stopwatch phase.

```ts
"use client";

import { useCallback, useState } from "react";
import type { LapEntry, StopwatchStatus } from "@/types";

export function useStopwatch() {
  const [status, setStatus] = useState<StopwatchStatus>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [laps, setLaps] = useState<LapEntry[]>([]);

  const start = useCallback(() => {
    setStatus("running");
  }, []);

  const stop = useCallback(() => {
    setStatus("paused");
  }, []);

  const reset = useCallback(() => {
    setStatus("idle");
    setElapsed(0);
    setLaps([]);
  }, []);

  const lap = useCallback(() => {
    setLaps((previous) => [
      {
        index: previous.length + 1,
        lapTime: elapsed,
        totalTime: elapsed,
      },
      ...previous,
    ]);
  }, [elapsed]);

  return {
    status,
    elapsed,
    laps,
    start,
    stop,
    reset,
    lap,
  };
}
```

---

## 13. Step 2.10 — Alarms Hook Placeholder

Create:

```txt
hooks/useAlarms.ts
```

This hook will be fully developed in the Alarm System phase.

```ts
"use client";

import { useCallback } from "react";
import type { Alarm } from "@/types";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import { useLocalStorage } from "@/hooks/useLocalStorage";

export function useAlarms() {
  const [alarms, setAlarms, clearAlarms] = useLocalStorage<Alarm[]>(
    STORAGE_KEYS.ALARMS,
    [],
  );

  const addAlarm = useCallback(
    (alarm: Alarm) => {
      setAlarms((previous) => [...previous, alarm]);
    },
    [setAlarms],
  );

  const updateAlarm = useCallback(
    (alarmId: string, updates: Partial<Alarm>) => {
      setAlarms((previous) =>
        previous.map((alarm) =>
          alarm.id === alarmId ? { ...alarm, ...updates } : alarm,
        ),
      );
    },
    [setAlarms],
  );

  const deleteAlarm = useCallback(
    (alarmId: string) => {
      setAlarms((previous) => previous.filter((alarm) => alarm.id !== alarmId));
    },
    [setAlarms],
  );

  const toggleAlarm = useCallback(
    (alarmId: string) => {
      setAlarms((previous) =>
        previous.map((alarm) =>
          alarm.id === alarmId ? { ...alarm, enabled: !alarm.enabled } : alarm,
        ),
      );
    },
    [setAlarms],
  );

  return {
    alarms,
    addAlarm,
    updateAlarm,
    deleteAlarm,
    toggleAlarm,
    clearAlarms,
  };
}
```

---

## 14. Step 2.11 — Pomodoro Hook Placeholder

Create:

```txt
hooks/usePomodoro.ts
```

This hook will be fully developed in the Pomodoro phase.

```ts
"use client";

import { useCallback, useState } from "react";
import type { PomodoroPhase, PomodoroSession } from "@/types";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import { useLocalStorage } from "@/hooks/useLocalStorage";

const DEFAULT_SESSION: PomodoroSession = {
  completedPomodoros: 0,
  totalFocusMinutes: 0,
  streak: 0,
};

export function usePomodoro() {
  const [phase, setPhase] = useState<PomodoroPhase>("idle");
  const [cycleCount, setCycleCount] = useState(0);

  const [stats, setStats, clearStats] = useLocalStorage<PomodoroSession>(
    STORAGE_KEYS.POMODORO_STATS,
    DEFAULT_SESSION,
  );

  const startFocus = useCallback(() => {
    setPhase("focus");
  }, []);

  const startBreak = useCallback(() => {
    setPhase("break");
  }, []);

  const reset = useCallback(() => {
    setPhase("idle");
    setCycleCount(0);
  }, []);

  const completeFocusSession = useCallback(() => {
    setCycleCount((previous) => previous + 1);

    setStats((previous) => ({
      ...previous,
      completedPomodoros: previous.completedPomodoros + 1,
      totalFocusMinutes: previous.totalFocusMinutes + 25,
      lastDate: new Date().toISOString().slice(0, 10),
    }));

    setPhase("break");
  }, [setStats]);

  return {
    phase,
    cycleCount,
    stats,
    startFocus,
    startBreak,
    reset,
    completeFocusSession,
    clearStats,
  };
}
```

---

## 15. SSR and Browser API Safety

Because Timeglass uses Next.js App Router, some code may run during server rendering.

Browser-only APIs must be protected.

Examples of browser-only APIs:

- `window`
- `localStorage`
- `Notification`
- `AudioContext`
- `requestAnimationFrame`

Always check:

```ts
if (typeof window === "undefined") {
  return;
}
```

For hooks that use browser APIs, add:

```ts
"use client";
```

at the top of the file.

---

## 16. Infrastructure Rules

Use these rules during Phase 2:

1. **Keep shared logic outside components**

   Hooks and libraries should contain logic. Components should mostly focus on rendering UI.

2. **Keep storage keys centralized**

   All LocalStorage keys should come from `lib/storage-keys.ts`.

3. **Keep browser APIs safe**

   Never use `window`, `localStorage`, `Notification`, or `AudioContext` without checking browser availability.

4. **Use TypeScript strictly**

   Avoid `any` unless it is truly necessary.

5. **Start simple**

   Hooks can begin as basic versions. They can be improved later when each feature is implemented.

6. **Do not build full UI yet**

   Phase 2 is about logic and foundations, not feature screens.

---

## 17. What This Phase Does Not Include

This phase does not include:

- Final tab UI
- Final World Clock UI
- Final Countdown UI
- Final Stopwatch UI
- Final Pomodoro UI
- Final Alarm UI
- Final Calendar UI
- Full timer accuracy implementation
- Full alarm matching logic
- Full calendar event UI
- Final notification banner
- Final tests

Those will be completed in later phases.

---

## 18. Verification Checklist

Phase 2 is complete when:

- [ ] `types/index.ts` exists
- [ ] Shared app types are defined
- [ ] `lib/storage-keys.ts` exists
- [ ] LocalStorage keys are centralized
- [ ] `hooks/useLocalStorage.ts` exists
- [ ] LocalStorage hook can read, write, and remove values
- [ ] LocalStorage hook is SSR-safe
- [ ] LocalStorage hook listens for cross-tab storage changes
- [ ] `hooks/useNotifications.ts` exists
- [ ] Notification permission can be requested after user interaction
- [ ] Notifications can be sent after permission is granted
- [ ] `lib/audio.ts` exists
- [ ] AudioManager can play simple generated sounds
- [ ] AudioManager can stop active sounds
- [ ] `hooks/useClock.ts` exists
- [ ] Clock hook returns live local time
- [ ] Clock hook supports optional timezone
- [ ] Placeholder hooks exist for timer, stopwatch, alarms, and Pomodoro
- [ ] No TypeScript errors
- [ ] No ESLint errors

---

## 19. Recommended Next Phase

After Core Infrastructure is complete, move to:

**Phase 3 — Layout & Navigation**

That phase should include:

- `AppShell`
- `TabBar`
- `GlowBackground`
- `GlassPanel`
- Basic tab switching
- Framer Motion tab transitions
- Responsive app container
