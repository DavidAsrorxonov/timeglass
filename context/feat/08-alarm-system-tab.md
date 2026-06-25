# Timeglass — Phase 8: Alarm System Tab

## 1. Purpose

This document explains **Phase 8 — Alarm System Tab** for the **Timeglass** project.

The goal of this phase is to build the local browser-based alarm system. Users should be able to create alarms, edit alarms, delete alarms, enable or disable alarms, choose active days, choose alarm sounds, and dismiss or snooze alarms when they ring.

This phase uses several systems from earlier phases:

- `useAlarms`
- `useLocalStorage`
- `AudioManager`
- `useNotifications`
- `GlassPanel`
- `NotificationBadge`
- Shared TypeScript types
- Framer Motion animations

---

## 2. Phase Goal

By the end of this phase, Timeglass should have a working Alarm System tab with:

- Alarm list
- Empty state when no alarms exist
- Create new alarm
- Edit existing alarm
- Delete alarm
- Enable / disable alarm
- Day-of-week repeat selection
- Alarm label
- Alarm sound selection
- Sound preview
- Alarm matching logic
- Full-screen ringing overlay
- Dismiss button
- Snooze button
- Browser notification when permission is granted
- Sound alert using Web Audio API
- LocalStorage persistence
- Alarm badge support in the tab bar

---

## 3. Files Created in This Phase

Phase 8 should create or update these files:

```txt
components/
└── alarm/
    ├── AlarmTab.tsx
    ├── AlarmCard.tsx
    └── AlarmModal.tsx

hooks/
└── useAlarms.ts

lib/
├── audio.ts
└── storage-keys.ts

types/
└── index.ts
```

Also update:

```txt
components/layout/AppShell.tsx
components/layout/TabBar.tsx
components/ui/NotificationBadge.tsx
hooks/useNotifications.ts
```

---

## 4. Alarm System Overview

The Alarm System tab allows users to manage local alarms.

Basic layout:

```txt
┌────────────────────────────────────┐
│  Alarms                 [+ New]    │
│                                    │
│  ┌──────────────────────────────┐  │
│  │  07:00 AM                    │  │
│  │  Morning run                 │  │
│  │  Mon Tue Wed Thu Fri         │  │
│  │  Bell                 [ON]   │  │
│  │                  [Edit] [X]  │  │
│  └──────────────────────────────┘  │
│                                    │
│  ┌──────────────────────────────┐  │
│  │  09:30 PM                    │  │
│  │  Study reminder              │  │
│  │  Sat Sun                     │  │
│  │  Gentle               [OFF]  │  │
│  └──────────────────────────────┘  │
└────────────────────────────────────┘
```

When an alarm rings:

```txt
┌────────────────────────────────────┐
│                                    │
│           Alarm Ringing            │
│              07:00 AM              │
│            Morning run             │
│                                    │
│        [Snooze]   [Dismiss]        │
│                                    │
└────────────────────────────────────┘
```

---

## 5. Important Browser Limitation

The Alarm System is local and browser-based.

It should work while the app is open or active. However, with a frontend-only LocalStorage architecture, the app cannot guarantee alarms if:

- The browser is closed
- The tab is killed
- The device is off
- The operating system suspends the browser
- The browser blocks background timers

### Required product wording

Do not describe these alarms as OS-level alarms.

Use wording like:

```txt
Alarms work while Timeglass is open or active.
```

Avoid wording like:

```txt
Guaranteed alarm even when the browser is closed.
```

---

## 6. Step 8.1 — Update Types

Update:

```txt
types/index.ts
```

Make sure these types exist:

```ts
export type AlarmSound = "bell" | "digital" | "gentle" | "pulse";

export type DayOfWeek = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";

export interface Alarm {
  id: string;
  label: string;
  time: string;
  days: DayOfWeek[];
  enabled: boolean;
  sound: AlarmSound;
  snoozeUntil?: string;
}
```

### Field meanings

| Field         | Meaning                            |
| ------------- | ---------------------------------- |
| `id`          | Unique alarm ID                    |
| `label`       | Alarm name or description          |
| `time`        | Alarm time in `HH:mm` format       |
| `days`        | Repeat days                        |
| `enabled`     | Whether alarm is active            |
| `sound`       | Alarm sound type                   |
| `snoozeUntil` | Optional snooze time in ISO format |

---

## 7. Step 8.2 — Update Storage Keys

Update:

```txt
lib/storage-keys.ts
```

Make sure this key exists:

```ts
ALARMS: "timeglass:alarms";
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

## 8. Step 8.3 — Alarm Utility Constants

The Alarm System needs reusable constants.

These can be inside `useAlarms.ts`, `AlarmModal.tsx`, or a future file like:

```txt
lib/alarms.ts
```

For the first version, keeping them in the related files is fine.

```ts
import type { AlarmSound, DayOfWeek } from "@/types";

export const DAYS_OF_WEEK: DayOfWeek[] = [
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
  "Sun",
];

export const ALARM_SOUNDS: {
  value: AlarmSound;
  label: string;
  description: string;
}[] = [
  {
    value: "bell",
    label: "Bell",
    description: "Classic descending bell tone",
  },
  {
    value: "digital",
    label: "Digital",
    description: "Fast square-wave alert",
  },
  {
    value: "gentle",
    label: "Gentle",
    description: "Soft calm tone",
  },
  {
    value: "pulse",
    label: "Pulse",
    description: "Repeating short beeps",
  },
];
```

---

## 9. Step 8.4 — Alarm Time Helpers

The alarm logic needs helpers for time and days.

### Get current day

```ts
import type { DayOfWeek } from "@/types";

export function getCurrentDay(): DayOfWeek {
  const days: DayOfWeek[] = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return days[new Date().getDay()];
}
```

### Get current time key

```ts
export function getCurrentTimeKey() {
  const now = new Date();

  return `${String(now.getHours()).padStart(2, "0")}:${String(
    now.getMinutes(),
  ).padStart(2, "0")}`;
}
```

### Format alarm time for display

```ts
export function formatAlarmTime(time: string, is24Hour = true) {
  const [hourString, minuteString] = time.split(":");
  const hours = Number(hourString);
  const minutes = Number(minuteString);

  if (is24Hour) {
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0",
    )}`;
  }

  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;

  return `${String(displayHours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0",
  )} ${period}`;
}
```

---

## 10. Step 8.5 — useAlarms Hook

Update:

```txt
hooks/useAlarms.ts
```

This hook controls alarm storage, CRUD, matching, snooze, and active ringing state.

### Required behavior

The hook should:

- Store alarms in LocalStorage
- Add alarms
- Update alarms
- Delete alarms
- Toggle alarms on/off
- Check alarms every minute
- Match current time and day
- Trigger only once per matching minute
- Support snooze
- Track active ringing alarm
- Dismiss active alarm
- Play alarm sound
- Send notification if permission is granted

### Recommended implementation

```ts
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Alarm, DayOfWeek } from "@/types";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useNotifications } from "@/hooks/useNotifications";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import { AudioManager } from "@/lib/audio";

function getCurrentDay(): DayOfWeek {
  const days: DayOfWeek[] = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return days[new Date().getDay()];
}

function getCurrentTimeKey() {
  const now = new Date();

  return `${String(now.getHours()).padStart(2, "0")}:${String(
    now.getMinutes(),
  ).padStart(2, "0")}`;
}

function createSnoozeTime(minutes = 5) {
  const date = new Date();
  date.setMinutes(date.getMinutes() + minutes);
  return date.toISOString();
}

function isSnoozeDue(snoozeUntil?: string) {
  if (!snoozeUntil) {
    return false;
  }

  return new Date(snoozeUntil).getTime() <= Date.now();
}

export function useAlarms() {
  const [alarms, setAlarms, clearAlarms] = useLocalStorage<Alarm[]>(
    STORAGE_KEYS.ALARMS,
    [],
  );

  const [activeAlarm, setActiveAlarm] = useState<Alarm | null>(null);
  const triggeredMinuteRef = useRef<string | null>(null);

  const { sendNotification } = useNotifications();

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

  const triggerAlarm = useCallback(
    (alarm: Alarm) => {
      setActiveAlarm(alarm);
      AudioManager.playAlarmSound(alarm.sound);

      sendNotification("Timeglass Alarm", {
        body: alarm.label || "Your alarm is ringing.",
      });
    },
    [sendNotification],
  );

  const dismissAlarm = useCallback(() => {
    AudioManager.stopAllSounds();
    setActiveAlarm(null);
  }, []);

  const snoozeAlarm = useCallback(
    (alarmId: string) => {
      AudioManager.stopAllSounds();

      const snoozeUntil = createSnoozeTime(5);

      updateAlarm(alarmId, {
        snoozeUntil,
      });

      setActiveAlarm(null);
    },
    [updateAlarm],
  );

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      const currentMinuteKey = getCurrentTimeKey();
      const currentDay = getCurrentDay();

      if (triggeredMinuteRef.current !== currentMinuteKey) {
        triggeredMinuteRef.current = null;
      }

      const matchingAlarm = alarms.find((alarm) => {
        if (!alarm.enabled) {
          return false;
        }

        if (alarm.snoozeUntil) {
          return isSnoozeDue(alarm.snoozeUntil);
        }

        const dayMatches =
          alarm.days.length === 0 || alarm.days.includes(currentDay);

        return alarm.time === currentMinuteKey && dayMatches;
      });

      if (!matchingAlarm) {
        return;
      }

      const triggerKey = `${matchingAlarm.id}:${currentMinuteKey}`;

      if (triggeredMinuteRef.current === triggerKey) {
        return;
      }

      triggeredMinuteRef.current = triggerKey;

      if (matchingAlarm.snoozeUntil) {
        updateAlarm(matchingAlarm.id, {
          snoozeUntil: undefined,
        });
      }

      triggerAlarm(matchingAlarm);
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [alarms, triggerAlarm, updateAlarm]);

  const hasEnabledAlarm = alarms.some((alarm) => alarm.enabled);

  return {
    alarms,
    activeAlarm,
    hasEnabledAlarm,
    addAlarm,
    updateAlarm,
    deleteAlarm,
    toggleAlarm,
    dismissAlarm,
    snoozeAlarm,
    clearAlarms,
  };
}
```

### Important note

The interval checks every second, but matching is minute-based. This reduces the chance of missing the start of a minute if the browser timer drifts.

---

## 11. Step 8.6 — AlarmCard Component

Create:

```txt
components/alarm/AlarmCard.tsx
```

This component displays one alarm.

### Required props

```ts
interface AlarmCardProps {
  alarm: Alarm;
  is24Hour?: boolean;
  onToggle: (id: string) => void;
  onEdit: (alarm: Alarm) => void;
  onDelete: (id: string) => void;
}
```

### Required features

- Alarm time
- Alarm label
- Repeat days
- Sound badge
- Enabled/disabled toggle
- Edit button
- Delete button
- Visual disabled state
- Framer Motion hover animation

### Example implementation

```tsx
"use client";

import { Pencil, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import type { Alarm } from "@/types";

interface AlarmCardProps {
  alarm: Alarm;
  is24Hour?: boolean;
  onToggle: (id: string) => void;
  onEdit: (alarm: Alarm) => void;
  onDelete: (id: string) => void;
}

function formatAlarmTime(time: string, is24Hour = true) {
  const [hourString, minuteString] = time.split(":");
  const hours = Number(hourString);
  const minutes = Number(minuteString);

  if (is24Hour) {
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0",
    )}`;
  }

  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;

  return `${String(displayHours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0",
  )} ${period}`;
}

export function AlarmCard({
  alarm,
  is24Hour = true,
  onToggle,
  onEdit,
  onDelete,
}: AlarmCardProps) {
  return (
    <motion.article
      layout
      whileHover={{ y: -3 }}
      className={`glass-panel p-5 transition ${
        alarm.enabled ? "opacity-100" : "opacity-55"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-4xl font-semibold text-foreground">
            {formatAlarmTime(alarm.time, is24Hour)}
          </p>

          <h3 className="mt-2 text-lg font-medium text-foreground">
            {alarm.label || "Alarm"}
          </h3>

          <p className="mt-1 text-sm text-(--text-muted)">
            {alarm.days.length > 0 ? alarm.days.join(" · ") : "Every day"}
          </p>

          <p className="mt-2 inline-flex rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-(--text-muted)">
            {alarm.sound}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onToggle(alarm.id)}
          aria-label={alarm.enabled ? "Disable alarm" : "Enable alarm"}
          className={`relative h-8 w-14 rounded-full border transition ${
            alarm.enabled
              ? "border-(--accent-primary) bg-(--accent-primary)/30"
              : "border-white/10 bg-white/5"
          }`}
        >
          <motion.span
            layout
            className="absolute top-1 h-6 w-6 rounded-full bg-white"
            animate={{ x: alarm.enabled ? 24 : 4 }}
            transition={{ duration: 0.2 }}
          />
        </button>
      </div>

      <div className="mt-5 flex justify-end gap-2">
        <button
          type="button"
          onClick={() => onEdit(alarm)}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-foreground transition hover:border-(--accent-primary)"
        >
          <Pencil size={16} />
          Edit
        </button>

        <button
          type="button"
          onClick={() => onDelete(alarm.id)}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-foreground transition hover:border-(--accent-danger) hover:text-(--accent-danger)"
        >
          <Trash2 size={16} />
          Delete
        </button>
      </div>
    </motion.article>
  );
}
```

---

## 12. Step 8.7 — AlarmModal Component

Create:

```txt
components/alarm/AlarmModal.tsx
```

This component is used for creating and editing alarms.

### Required props

```ts
interface AlarmModalProps {
  alarm?: Alarm | null;
  onSave: (alarm: Alarm) => void;
  onClose: () => void;
}
```

### Required features

- Time input
- Label input
- Day selector
- Sound selector
- Sound preview
- Save button
- Cancel button
- Create mode
- Edit mode
- Framer Motion entrance/exit
- Validation

### Example implementation

```tsx
"use client";

import { X } from "lucide-react";
import { useState } from "react";
import type { Alarm, AlarmSound, DayOfWeek } from "@/types";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { AudioManager } from "@/lib/audio";

const DAYS_OF_WEEK: DayOfWeek[] = [
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
  "Sun",
];

const ALARM_SOUNDS: {
  value: AlarmSound;
  label: string;
}[] = [
  { value: "bell", label: "Bell" },
  { value: "digital", label: "Digital" },
  { value: "gentle", label: "Gentle" },
  { value: "pulse", label: "Pulse" },
];

interface AlarmModalProps {
  alarm?: Alarm | null;
  onSave: (alarm: Alarm) => void;
  onClose: () => void;
}

function createAlarmId() {
  return `alarm-${crypto.randomUUID()}`;
}

export function AlarmModal({ alarm, onSave, onClose }: AlarmModalProps) {
  const [time, setTime] = useState(alarm?.time ?? "07:00");
  const [label, setLabel] = useState(alarm?.label ?? "");
  const [days, setDays] = useState<DayOfWeek[]>(alarm?.days ?? []);
  const [sound, setSound] = useState<AlarmSound>(alarm?.sound ?? "bell");

  const isEditing = Boolean(alarm);

  const toggleDay = (day: DayOfWeek) => {
    setDays((previous) =>
      previous.includes(day)
        ? previous.filter((item) => item !== day)
        : [...previous, day],
    );
  };

  const handleSave = () => {
    const nextAlarm: Alarm = {
      id: alarm?.id ?? createAlarmId(),
      label: label.trim() || "Alarm",
      time,
      days,
      enabled: alarm?.enabled ?? true,
      sound,
    };

    onSave(nextAlarm);
  };

  const previewSound = (nextSound: AlarmSound) => {
    setSound(nextSound);
    AudioManager.playAlarmSound(nextSound);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/60 p-4 backdrop-blur-sm sm:items-center sm:justify-center">
      <GlassPanel className="w-full max-w-xl p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">
              {isEditing ? "Edit Alarm" : "New Alarm"}
            </h2>

            <p className="mt-1 text-sm text-(--text-muted)">
              Alarms work while Timeglass is open or active.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-(--text-muted) hover:text-white"
            aria-label="Close alarm modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mt-6 space-y-5">
          <label className="block">
            <span className="mb-2 block text-sm text-(--text-muted)">Time</span>
            <input
              type="time"
              value={time}
              onChange={(event) => setTime(event.target.value)}
              className="glass-panel w-full px-4 py-4 font-mono text-3xl text-foreground outline-none"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm text-(--text-muted)">
              Label
            </span>
            <input
              type="text"
              value={label}
              onChange={(event) => setLabel(event.target.value)}
              placeholder="Morning run"
              className="glass-panel w-full px-4 py-3 text-foreground outline-none placeholder:text-(--text-muted)"
            />
          </label>

          <div>
            <p className="mb-2 text-sm text-(--text-muted)">Repeat days</p>

            <div className="flex flex-wrap gap-2">
              {DAYS_OF_WEEK.map((day) => {
                const active = days.includes(day);

                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`rounded-full border px-4 py-2 text-sm transition ${
                      active
                        ? "border-(--accent-primary) bg-(--accent-primary)/25 text-white"
                        : "border-white/10 text-(--text-muted) hover:text-white"
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            <p className="mt-2 text-xs text-(--text-muted)">
              Leave all days unselected to repeat every day.
            </p>
          </div>

          <div>
            <p className="mb-2 text-sm text-(--text-muted)">Alarm sound</p>

            <div className="grid gap-2 sm:grid-cols-2">
              {ALARM_SOUNDS.map((item) => {
                const active = sound === item.value;

                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => previewSound(item.value)}
                    className={`rounded-2xl border px-4 py-3 text-left transition ${
                      active
                        ? "border-(--accent-primary) bg-(--accent-primary)/20"
                        : "border-white/10 bg-white/3 hover:border-(--accent-primary)"
                    }`}
                  >
                    <span className="block font-medium text-foreground">
                      {item.label}
                    </span>
                    <span className="block text-sm text-(--text-muted)">
                      Tap to preview
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 px-5 py-3 text-foreground transition hover:border-(--accent-danger)"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="rounded-full bg-(--accent-primary) px-5 py-3 font-medium text-white transition hover:bg-(--accent-glow)"
          >
            Save Alarm
          </button>
        </div>
      </GlassPanel>
    </div>
  );
}
```

### Note about `crypto.randomUUID()`

Modern browsers support:

```ts
crypto.randomUUID();
```

If older browser support is needed, use a fallback:

```ts
Math.random().toString(36).slice(2);
```

---

## 13. Step 8.8 — AlarmTab Component

Create:

```txt
components/alarm/AlarmTab.tsx
```

This is the main Alarm System screen.

### Responsibilities

`AlarmTab` should:

- Use `useAlarms`
- Show alarm list
- Show empty state
- Open create modal
- Open edit modal
- Save new alarm
- Save edited alarm
- Delete alarm
- Toggle alarm
- Show active ringing overlay
- Snooze active alarm
- Dismiss active alarm

### Example implementation

```tsx
"use client";

import { AlarmClock, Plus } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import type { Alarm } from "@/types";
import { AlarmCard } from "@/components/alarm/AlarmCard";
import { AlarmModal } from "@/components/alarm/AlarmModal";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { useAlarms } from "@/hooks/useAlarms";

export function AlarmTab() {
  const alarms = useAlarms();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAlarm, setEditingAlarm] = useState<Alarm | null>(null);

  const openCreateModal = () => {
    setEditingAlarm(null);
    setIsModalOpen(true);
  };

  const openEditModal = (alarm: Alarm) => {
    setEditingAlarm(alarm);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditingAlarm(null);
    setIsModalOpen(false);
  };

  const saveAlarm = (alarm: Alarm) => {
    const exists = alarms.alarms.some((item) => item.id === alarm.id);

    if (exists) {
      alarms.updateAlarm(alarm.id, alarm);
    } else {
      alarms.addAlarm(alarm);
    }

    closeModal();
  };

  return (
    <div className="space-y-6">
      <GlassPanel className="p-6 lg:p-8" glow>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-(--accent-glow)">
              Alarms
            </p>

            <h2 className="mt-3 text-3xl font-semibold text-foreground">
              Wake up, focus, or remember.
            </h2>

            <p className="mt-3 max-w-2xl text-sm text-(--text-muted)">
              Create local browser-based alarms. They work while Timeglass is
              open or active.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-(--accent-primary) px-5 py-3 font-medium text-white shadow-[0_0_24px_rgba(124,107,255,0.35)] transition hover:bg-(--accent-glow)"
          >
            <Plus size={18} />
            New Alarm
          </button>
        </div>

        {alarms.alarms.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-white/10 bg-white/3 p-8 text-center">
            <AlarmClock className="mx-auto text-(--text-muted)" size={34} />

            <p className="mt-4 text-lg font-medium text-foreground">
              No alarms set
            </p>

            <p className="mt-2 text-sm text-(--text-muted)">
              Create your first alarm to get started.
            </p>
          </div>
        ) : (
          <motion.div layout className="mt-8 grid gap-4">
            <AnimatePresence initial={false}>
              {alarms.alarms.map((alarm) => (
                <AlarmCard
                  key={alarm.id}
                  alarm={alarm}
                  onToggle={alarms.toggleAlarm}
                  onEdit={openEditModal}
                  onDelete={alarms.deleteAlarm}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </GlassPanel>

      <AnimatePresence>
        {isModalOpen && (
          <AlarmModal
            alarm={editingAlarm}
            onSave={saveAlarm}
            onClose={closeModal}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {alarms.activeAlarm && (
          <motion.div
            className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <GlassPanel className="w-full max-w-lg p-8 text-center">
              <p className="text-sm uppercase tracking-[0.35em] text-(--accent-danger)">
                Alarm Ringing
              </p>

              <h2 className="mt-4 font-mono text-6xl font-semibold text-foreground">
                {alarms.activeAlarm.time}
              </h2>

              <p className="mt-3 text-xl text-foreground">
                {alarms.activeAlarm.label || "Alarm"}
              </p>

              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => alarms.snoozeAlarm(alarms.activeAlarm!.id)}
                  className="rounded-full border border-white/10 px-6 py-3 font-medium text-foreground transition hover:border-(--accent-primary)"
                >
                  Snooze 5 min
                </button>

                <button
                  type="button"
                  onClick={alarms.dismissAlarm}
                  className="rounded-full bg-(--accent-danger) px-6 py-3 font-medium text-white transition hover:opacity-90"
                >
                  Dismiss
                </button>
              </div>
            </GlassPanel>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

---

## 14. Step 8.9 — Connect AlarmTab to AppShell

Update:

```txt
components/layout/AppShell.tsx
```

Import:

```tsx
import { AlarmTab } from "@/components/alarm/AlarmTab";
```

Then replace the alarm placeholder:

```tsx
case "alarm":
  return <AlarmTab />;
```

Now the Alarm tab should render when the user clicks the Alarm tab.

---

## 15. Step 8.10 — Alarm Badge in TabBar

The original design includes a badge dot on the Alarm tab when any alarm is enabled.

### Option 1 — Pass from AppShell

In `AppShell`, use alarm state at the app level:

```tsx
const { hasEnabledAlarm } = useAlarms();

<TabBar
  activeTab={activeTab}
  onTabChange={setActiveTab}
  hasEnabledAlarm={hasEnabledAlarm}
/>;
```

### Option 2 — Keep badge for later

If using `useAlarms` in `AppShell` causes duplicate logic or hook complexity, leave this for the cross-cutting phase.

### Recommended first version

Use the badge if simple. If not, keep the badge component ready and connect it later.

---

## 16. Step 8.11 — Snooze Behavior

Snooze should:

1. Stop the current sound
2. Hide the ringing overlay
3. Set `snoozeUntil` to 5 minutes later
4. Trigger the alarm again when `snoozeUntil` is reached

Recommended snooze duration:

```txt
5 minutes
```

### Future improvement

Allow users to customize snooze duration:

```txt
5 min, 10 min, 15 min
```

Not required for Phase 8.

---

## 17. Step 8.12 — Day Selection Behavior

Alarm day behavior:

| Selected Days             | Behavior                          |
| ------------------------- | --------------------------------- |
| No days selected          | Alarm repeats every day           |
| One or more days selected | Alarm only rings on selected days |

Example:

```txt
Mon Tue Wed Thu Fri selected
```

The alarm rings only on weekdays.

---

## 18. Step 8.13 — Alarm Matching Logic

The alarm should match when:

```txt
alarm.enabled === true
alarm.time === current HH:mm
current day matches alarm days
```

Or when snooze is active:

```txt
alarm.snoozeUntil <= current time
```

### Avoid duplicate triggers

The same alarm should not trigger many times within the same minute.

Use a ref like:

```ts
triggeredMinuteRef;
```

to remember the last alarm-minute trigger key.

---

## 19. Step 8.14 — Sound Preview

When the user selects a sound in the modal, preview it:

```ts
AudioManager.playAlarmSound(sound);
```

### Important

If a user rapidly clicks different sounds, old sounds may overlap.

A better preview flow:

```ts
AudioManager.stopAllSounds();
AudioManager.playAlarmSound(sound);
```

This can be added to improve polish.

---

## 20. Step 8.15 — Alarm Sorting

Recommended alarm sorting:

1. Enabled alarms first
2. Earlier times first
3. Disabled alarms after enabled alarms

Example:

```ts
const sortedAlarms = [...alarms].sort((a, b) => {
  if (a.enabled !== b.enabled) {
    return a.enabled ? -1 : 1;
  }

  return a.time.localeCompare(b.time);
});
```

This is optional but improves the user experience.

---

## 21. Step 8.16 — Empty State

If there are no alarms, show an empty state.

Example text:

```txt
No alarms set
Create your first alarm to get started.
```

The empty state should use:

- Bell/alarm icon
- Glass panel style
- Muted supporting text
- Clear call-to-action nearby

---

## 22. Step 8.17 — Animation Rules

Use Framer Motion for:

- Alarm card hover
- Alarm card layout changes
- Alarm modal enter/exit
- Ringing overlay enter/exit
- Toggle switch movement
- Empty state appearance

Recommended modal animation:

```tsx
initial={{ opacity: 0, y: 24 }}
animate={{ opacity: 1, y: 0 }}
exit={{ opacity: 0, y: 24 }}
```

Recommended overlay animation:

```tsx
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
exit={{ opacity: 0 }}
```

---

## 23. Step 8.18 — Accessibility Rules

Alarm System accessibility rules:

- Use real `<button>` elements
- Toggle buttons need `aria-label`
- Delete buttons need clear text or accessible labels
- Modal must have a close button
- Time input must have a label
- Day chips must be keyboard accessible
- Sound choices must be keyboard accessible
- Ringing overlay must show text, not only sound
- Dismiss and Snooze must be large and easy to click
- Do not rely only on color to show enabled/disabled state

---

## 24. Step 8.19 — Responsive Rules

### Desktop

```txt
Alarm cards stacked in a centered panel
New Alarm button on the top right
Modal centered
Ringing overlay centered
```

### Tablet

```txt
Same layout as desktop
Cards remain full-width
```

### Mobile

```txt
Header stacks vertically
New Alarm button full-width if needed
Modal appears from bottom
Alarm cards use single-column layout
Snooze and Dismiss buttons stack
```

Minimum touch target:

```txt
44px height
```

---

## 25. Step 8.20 — Performance Notes

Alarm performance rules:

1. Use a simple interval for checking alarms.
2. Check every second but match by minute.
3. Avoid expensive calculations in the interval.
4. Keep alarm list in LocalStorage.
5. Avoid playing multiple overlapping alarm sounds.
6. Stop sounds on dismiss and snooze.
7. Avoid duplicate triggers in the same minute.
8. Keep alarm count reasonable.

Recommended first version max alarms:

```txt
20 alarms
```

This limit is optional, but useful for keeping the UI simple.

---

## 26. What This Phase Does Not Include

This phase does not include:

- OS-level alarms
- Server push notifications
- Background alarms after browser close
- Custom uploaded audio files
- Recurring alarm exceptions
- Calendar-linked alarms
- Sleep tracking
- Smart alarm wake windows
- Alarm vibration API
- Cloud sync

These can be considered later if needed.

---

## 27. Completion Checklist

Phase 8 is complete when:

- [ ] `AlarmTab.tsx` exists
- [ ] `AlarmCard.tsx` exists
- [ ] `AlarmModal.tsx` exists
- [ ] `useAlarms.ts` has alarm CRUD logic
- [ ] Alarms are stored in LocalStorage
- [ ] User can create an alarm
- [ ] User can edit an alarm
- [ ] User can delete an alarm
- [ ] User can enable and disable an alarm
- [ ] User can select repeat days
- [ ] User can leave days empty for everyday repeat
- [ ] User can choose alarm sound
- [ ] User can preview alarm sound
- [ ] Alarm matching logic works
- [ ] Alarm does not trigger repeatedly in the same minute
- [ ] Alarm plays sound when triggered
- [ ] Browser notification sends if permission is granted
- [ ] Ringing overlay appears
- [ ] Dismiss stops sound and closes overlay
- [ ] Snooze stops sound and re-triggers later
- [ ] Empty state appears when there are no alarms
- [ ] Alarm cards animate smoothly
- [ ] Alarm modal opens and closes
- [ ] Alarm tab is connected to `AppShell`
- [ ] Alarm badge is connected or prepared for `TabBar`
- [ ] Layout works on desktop, tablet, and mobile
- [ ] No TypeScript errors
- [ ] No ESLint errors

---

## 28. Recommended Next Phase

After the Alarm System tab is complete, move to:

**Phase 9 — Local Calendar Tab**

That phase should include:

- Monthly calendar grid
- Previous / next month navigation
- Today highlight
- Selected day
- Add event
- Edit event
- Delete event
- Event dots on calendar days
- LocalStorage persistence
