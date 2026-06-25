# Timeglass — Phase 4: World Clock Tab

## 1. Purpose

This document explains **Phase 4 — World Clock Tab** for the **Timeglass** project.

The goal of this phase is to build the main clock experience of the app. This includes the local analog clock, local digital clock, 12-hour / 24-hour format toggle, saved timezone cards, timezone search, and basic timezone management.

This phase is the first full feature module after the project scaffold, core infrastructure, and layout/navigation system.

---

## 2. Phase Goal

By the end of this phase, Timeglass should have a working World Clock tab with:

- A main analog clock
- A main digital clock
- Live local time
- Current date and day display
- 12-hour / 24-hour toggle
- Auto-detected local timezone
- Timezone cards
- Add timezone feature
- Remove timezone feature
- Pin timezone feature
- LocalStorage persistence for saved timezones
- Smooth animations for clock elements and card changes

---

## 3. Files Created in This Phase

Phase 4 should create or update these files:

```txt
components/
└── clock/
    ├── ClockTab.tsx
    ├── AnalogClock.tsx
    ├── DigitalClock.tsx
    ├── TimezoneCard.tsx
    └── TimezoneSearch.tsx

hooks/
└── useClock.ts

lib/
└── timezones.ts
```

Also update:

```txt
components/layout/AppShell.tsx
types/index.ts
lib/storage-keys.ts
```

---

## 4. World Clock Tab Overview

The World Clock tab is the default landing tab of Timeglass.

It should show the user's current local time in a visually strong way. The main section should combine an analog clock and a digital clock inside a glassmorphism panel.

Below that, the user can manage extra timezone cards.

Basic layout:

```txt
┌──────────────────────────────────────────────┐
│                 World Clock                  │
│                                              │
│  ┌────────────────────────────────────────┐  │
│  │                                        │  │
│  │   [Analog Clock]     [Digital Clock]   │  │
│  │                                        │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  Saved Timezones                 [+ Add]     │
│                                              │
│  ┌────────────┐ ┌────────────┐ ┌──────────┐  │
│  │ Tokyo      │ │ Tashkent   │ │ London   │  │
│  │ 15:30      │ │ 11:30      │ │ 07:30    │  │
│  └────────────┘ └────────────┘ └──────────┘  │
└──────────────────────────────────────────────┘
```

---

## 5. Step 4.1 — Update Types

Update:

```txt
types/index.ts
```

Make sure the `Timezone` type exists.

```ts
export interface Timezone {
  id: string;
  city: string;
  region: string;
  timezone: string;
  offset: string;
  pinned: boolean;
}
```

### Important note

The `timezone` field should store the IANA timezone string, for example:

```txt
Asia/Tokyo
Asia/Tashkent
Europe/London
America/New_York
```

This is more useful than only storing a display ID.

---

## 6. Step 4.2 — Update Storage Keys

Update:

```txt
lib/storage-keys.ts
```

Make sure these keys exist:

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

The World Clock tab uses:

```ts
STORAGE_KEYS.TIMEZONES;
STORAGE_KEYS.CLOCK_FORMAT;
```

---

## 7. Step 4.3 — Timezone Data

Update:

```txt
lib/timezones.ts
```

Start with a practical timezone list.

```ts
import type { Timezone } from "@/types";

export const DEFAULT_TIMEZONES: Timezone[] = [
  {
    id: "asia-tokyo",
    city: "Tokyo",
    region: "Japan",
    timezone: "Asia/Tokyo",
    offset: "+09:00",
    pinned: true,
  },
  {
    id: "asia-tashkent",
    city: "Tashkent",
    region: "Uzbekistan",
    timezone: "Asia/Tashkent",
    offset: "+05:00",
    pinned: false,
  },
];

export const TIMEZONE_OPTIONS: Timezone[] = [
  {
    id: "asia-tokyo",
    city: "Tokyo",
    region: "Japan",
    timezone: "Asia/Tokyo",
    offset: "+09:00",
    pinned: false,
  },
  {
    id: "asia-tashkent",
    city: "Tashkent",
    region: "Uzbekistan",
    timezone: "Asia/Tashkent",
    offset: "+05:00",
    pinned: false,
  },
  {
    id: "europe-london",
    city: "London",
    region: "United Kingdom",
    timezone: "Europe/London",
    offset: "+00:00",
    pinned: false,
  },
  {
    id: "america-new-york",
    city: "New York",
    region: "United States",
    timezone: "America/New_York",
    offset: "-05:00",
    pinned: false,
  },
  {
    id: "europe-paris",
    city: "Paris",
    region: "France",
    timezone: "Europe/Paris",
    offset: "+01:00",
    pinned: false,
  },
  {
    id: "asia-dubai",
    city: "Dubai",
    region: "United Arab Emirates",
    timezone: "Asia/Dubai",
    offset: "+04:00",
    pinned: false,
  },
  {
    id: "asia-seoul",
    city: "Seoul",
    region: "South Korea",
    timezone: "Asia/Seoul",
    offset: "+09:00",
    pinned: false,
  },
  {
    id: "australia-sydney",
    city: "Sydney",
    region: "Australia",
    timezone: "Australia/Sydney",
    offset: "+10:00",
    pinned: false,
  },
];
```

### Later improvement

Later, this can be replaced by a full IANA timezone dataset with fuzzy search.

---

## 8. Step 4.4 — useClock Hook

The `useClock` hook was introduced in Phase 2. In this phase, it should be used by real UI components.

The hook should return live time data.

Expected return values:

```ts
{
  (date, hours, minutes, seconds, milliseconds, dayOfWeek);
}
```

It should support:

```ts
useClock();
```

for local time, and:

```ts
useClock("Asia/Tokyo");
```

for a specific timezone.

### Important behavior

The analog second hand should use milliseconds for smooth rotation.

---

## 9. Step 4.5 — AnalogClock Component

Create:

```txt
components/clock/AnalogClock.tsx
```

This component renders an SVG analog clock.

### Required props

```ts
interface AnalogClockProps {
  timezone?: string;
  size?: number;
  compact?: boolean;
}
```

### Required features

- SVG clock face
- Frosted glass circle
- 12 major tick marks
- 60 minor tick marks
- Hour hand
- Minute hand
- Smooth second hand
- Violet accent second hand
- Center dot
- Optional compact mode for timezone cards

### Example implementation

```tsx
"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";
import { useClock } from "@/hooks/useClock";

interface AnalogClockProps {
  timezone?: string;
  size?: number;
  compact?: boolean;
}

export function AnalogClock({
  timezone,
  size = 260,
  compact = false,
}: AnalogClockProps) {
  const { hours, minutes, seconds, milliseconds } = useClock(timezone);

  const hourRotation = ((hours % 12) + minutes / 60) * 30;
  const minuteRotation = (minutes + seconds / 60) * 6;
  const secondRotation = (seconds + milliseconds / 1000) * 6;

  const ticks = useMemo(() => {
    return Array.from({ length: 60 }, (_, index) => {
      const isMajor = index % 5 === 0;
      const angle = index * 6;
      const length = isMajor ? 12 : 6;
      const strokeWidth = isMajor ? 2 : 1;

      return {
        index,
        angle,
        length,
        strokeWidth,
        opacity: isMajor ? 0.7 : 0.28,
      };
    });
  }, []);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 260 260"
      role="img"
      aria-label="Analog clock"
      className={compact ? "drop-shadow-lg" : "drop-shadow-2xl"}
    >
      <defs>
        <filter id="secondHandGlow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <circle
        cx="130"
        cy="130"
        r="118"
        fill="rgba(255,255,255,0.06)"
        stroke="rgba(255,255,255,0.14)"
        strokeWidth="1"
      />

      {ticks.map((tick) => (
        <line
          key={tick.index}
          x1="130"
          y1="22"
          x2="130"
          y2={22 + tick.length}
          stroke="rgba(241,245,249,0.85)"
          strokeWidth={tick.strokeWidth}
          opacity={tick.opacity}
          transform={`rotate(${tick.angle} 130 130)`}
          strokeLinecap="round"
        />
      ))}

      <motion.line
        x1="130"
        y1="130"
        x2="130"
        y2="78"
        stroke="rgba(241,245,249,0.95)"
        strokeWidth="6"
        strokeLinecap="round"
        animate={{ rotate: hourRotation }}
        transition={{ duration: 0.2, ease: "linear" }}
        style={{ transformOrigin: "130px 130px" }}
      />

      <motion.line
        x1="130"
        y1="130"
        x2="130"
        y2="52"
        stroke="rgba(241,245,249,0.82)"
        strokeWidth="4"
        strokeLinecap="round"
        animate={{ rotate: minuteRotation }}
        transition={{ duration: 0.2, ease: "linear" }}
        style={{ transformOrigin: "130px 130px" }}
      />

      <motion.line
        x1="130"
        y1="142"
        x2="130"
        y2="38"
        stroke="var(--accent-primary)"
        strokeWidth="2"
        strokeLinecap="round"
        filter="url(#secondHandGlow)"
        animate={{ rotate: secondRotation }}
        transition={{ duration: 0, ease: "linear" }}
        style={{ transformOrigin: "130px 130px" }}
      />

      <circle cx="130" cy="130" r="7" fill="var(--accent-primary)" />
      <circle cx="130" cy="130" r="3" fill="white" opacity="0.9" />
    </svg>
  );
}
```

---

## 10. Step 4.6 — DigitalClock Component

Create:

```txt
components/clock/DigitalClock.tsx
```

This component displays the current time as large digital text.

### Required props

```ts
interface DigitalClockProps {
  timezone?: string;
  is24Hour: boolean;
  onToggleFormat?: () => void;
}
```

### Required features

- Large time display
- Seconds display
- AM/PM display in 12-hour mode
- Day of week
- Full date
- 12h / 24h toggle button
- Smooth digit animation

### Example implementation

```tsx
"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useClock } from "@/hooks/useClock";

interface DigitalClockProps {
  timezone?: string;
  is24Hour: boolean;
  onToggleFormat?: () => void;
}

function formatTime(
  hours: number,
  minutes: number,
  seconds: number,
  is24Hour: boolean,
) {
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = is24Hour ? hours : hours % 12 || 12;

  return {
    time: `${String(displayHours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0",
    )}:${String(seconds).padStart(2, "0")}`,
    period,
  };
}

export function DigitalClock({
  timezone,
  is24Hour,
  onToggleFormat,
}: DigitalClockProps) {
  const clock = useClock(timezone);
  const { time, period } = formatTime(
    clock.hours,
    clock.minutes,
    clock.seconds,
    is24Hour,
  );

  const dateLabel = clock.date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="flex flex-col items-start justify-center">
      <p className="text-sm uppercase tracking-[0.35em] text-(--accent-glow)">
        Local Time
      </p>

      <div className="mt-4 flex items-end gap-3">
        <AnimatePresence mode="wait">
          <motion.p
            key={time}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="font-mono text-5xl font-semibold tracking-tight text-foreground sm:text-7xl"
          >
            {time}
          </motion.p>
        </AnimatePresence>

        {!is24Hour && (
          <span className="mb-2 text-lg font-medium text-(--text-muted)">
            {period}
          </span>
        )}
      </div>

      <p className="mt-3 text-(--text-muted)">{dateLabel}</p>

      <button
        type="button"
        onClick={onToggleFormat}
        className="mt-5 rounded-full border border-white/10 px-4 py-2 text-sm text-foreground transition hover:border-(--accent-primary) hover:text-white"
      >
        Switch to {is24Hour ? "12-hour" : "24-hour"} format
      </button>
    </div>
  );
}
```

### Note

If `timezone` is provided, the date label should eventually use that timezone too. For the first version, local date display is acceptable for the main local clock.

---

## 11. Step 4.7 — TimezoneCard Component

Create:

```txt
components/clock/TimezoneCard.tsx
```

This component displays one saved timezone.

### Required props

```ts
interface TimezoneCardProps {
  timezone: Timezone;
  is24Hour: boolean;
  onRemove: (id: string) => void;
  onTogglePin: (id: string) => void;
}
```

### Required features

- City name
- Region name
- Current time in that timezone
- Offset label
- Small analog clock
- Pin button
- Remove button
- Card layout animation

### Example implementation

```tsx
"use client";

import { Pin, PinOff, X } from "lucide-react";
import { motion } from "framer-motion";
import type { Timezone } from "@/types";
import { useClock } from "@/hooks/useClock";
import { AnalogClock } from "@/components/clock/AnalogClock";

interface TimezoneCardProps {
  timezone: Timezone;
  is24Hour: boolean;
  onRemove: (id: string) => void;
  onTogglePin: (id: string) => void;
}

function formatCardTime(hours: number, minutes: number, is24Hour: boolean) {
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = is24Hour ? hours : hours % 12 || 12;

  return `${String(displayHours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0",
  )}${is24Hour ? "" : ` ${period}`}`;
}

export function TimezoneCard({
  timezone,
  is24Hour,
  onRemove,
  onTogglePin,
}: TimezoneCardProps) {
  const clock = useClock(timezone.timezone);

  const timeLabel = formatCardTime(clock.hours, clock.minutes, is24Hour);

  return (
    <motion.article
      layout
      className="glass-panel min-w-64 p-5"
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            {timezone.city}
          </h3>
          <p className="text-sm text-(--text-muted)">{timezone.region}</p>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onTogglePin(timezone.id)}
            aria-label={timezone.pinned ? "Unpin timezone" : "Pin timezone"}
            className="rounded-full p-2 text-(--text-muted) hover:text-(--accent-glow)"
          >
            {timezone.pinned ? <Pin size={16} /> : <PinOff size={16} />}
          </button>

          <button
            type="button"
            onClick={() => onRemove(timezone.id)}
            aria-label="Remove timezone"
            className="rounded-full p-2 text-(--text-muted) hover:text-(--accent-danger)"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between gap-4">
        <div>
          <p className="font-mono text-3xl font-semibold text-foreground">
            {timeLabel}
          </p>
          <p className="mt-1 text-sm text-(--text-muted)">
            UTC {timezone.offset}
          </p>
        </div>

        <AnalogClock timezone={timezone.timezone} size={86} compact />
      </div>
    </motion.article>
  );
}
```

---

## 12. Step 4.8 — TimezoneSearch Component

Create:

```txt
components/clock/TimezoneSearch.tsx
```

This component lets the user search and add timezones.

### Required props

```ts
interface TimezoneSearchProps {
  savedTimezones: Timezone[];
  onAdd: (timezone: Timezone) => void;
  onClose: () => void;
}
```

### Required features

- Search input
- Filter timezone options by city, region, or timezone ID
- Disable already added timezones
- Add timezone by clicking result
- Close button
- Maximum saved timezone limit support

### Example implementation

```tsx
"use client";

import { Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import type { Timezone } from "@/types";
import { TIMEZONE_OPTIONS } from "@/lib/timezones";
import { GlassPanel } from "@/components/ui/GlassPanel";

interface TimezoneSearchProps {
  savedTimezones: Timezone[];
  onAdd: (timezone: Timezone) => void;
  onClose: () => void;
}

export function TimezoneSearch({
  savedTimezones,
  onAdd,
  onClose,
}: TimezoneSearchProps) {
  const [query, setQuery] = useState("");

  const savedIds = useMemo(() => {
    return new Set(savedTimezones.map((timezone) => timezone.id));
  }, [savedTimezones]);

  const results = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return TIMEZONE_OPTIONS;
    }

    return TIMEZONE_OPTIONS.filter((timezone) => {
      return (
        timezone.city.toLowerCase().includes(normalizedQuery) ||
        timezone.region.toLowerCase().includes(normalizedQuery) ||
        timezone.timezone.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [query]);

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/50 p-4 backdrop-blur-sm sm:items-center sm:justify-center">
      <GlassPanel className="w-full max-w-xl p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              Add Timezone
            </h2>
            <p className="text-sm text-(--text-muted)">
              Search by city, country, or timezone name.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-(--text-muted) hover:text-white"
            aria-label="Close timezone search"
          >
            <X size={20} />
          </button>
        </div>

        <label className="mt-5 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/4 px-4 py-3">
          <Search size={18} className="text-(--text-muted)" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search Tokyo, Tashkent, London..."
            className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-(--text-muted)"
          />
        </label>

        <div className="mt-4 max-h-80 space-y-2 overflow-y-auto pr-1">
          {results.map((timezone) => {
            const alreadyAdded = savedIds.has(timezone.id);

            return (
              <button
                key={timezone.id}
                type="button"
                disabled={alreadyAdded}
                onClick={() => onAdd({ ...timezone, pinned: false })}
                className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/3 px-4 py-3 text-left transition hover:border-(--accent-primary) disabled:cursor-not-allowed disabled:opacity-40"
              >
                <span>
                  <span className="block font-medium text-foreground">
                    {timezone.city}
                  </span>
                  <span className="block text-sm text-(--text-muted)">
                    {timezone.region} · {timezone.timezone}
                  </span>
                </span>

                <span className="text-sm text-(--text-muted)">
                  {alreadyAdded ? "Added" : `UTC ${timezone.offset}`}
                </span>
              </button>
            );
          })}
        </div>
      </GlassPanel>
    </div>
  );
}
```

---

## 13. Step 4.9 — ClockTab Component

Create:

```txt
components/clock/ClockTab.tsx
```

This is the main World Clock tab.

### Responsibilities

`ClockTab` should:

- Render `AnalogClock`
- Render `DigitalClock`
- Store 12h / 24h preference
- Store saved timezone cards
- Add timezone
- Remove timezone
- Pin/unpin timezone
- Sort pinned cards first
- Open and close timezone search modal
- Limit timezone cards to 8

### Example implementation

```tsx
"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { AnalogClock } from "@/components/clock/AnalogClock";
import { DigitalClock } from "@/components/clock/DigitalClock";
import { TimezoneCard } from "@/components/clock/TimezoneCard";
import { TimezoneSearch } from "@/components/clock/TimezoneSearch";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { DEFAULT_TIMEZONES } from "@/lib/timezones";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import type { Timezone } from "@/types";

export function ClockTab() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const [is24Hour, setIs24Hour] = useLocalStorage<boolean>(
    STORAGE_KEYS.CLOCK_FORMAT,
    true,
  );

  const [timezones, setTimezones] = useLocalStorage<Timezone[]>(
    STORAGE_KEYS.TIMEZONES,
    DEFAULT_TIMEZONES,
  );

  const sortedTimezones = useMemo(() => {
    return [...timezones].sort((a, b) => {
      if (a.pinned === b.pinned) {
        return a.city.localeCompare(b.city);
      }

      return a.pinned ? -1 : 1;
    });
  }, [timezones]);

  const addTimezone = (timezone: Timezone) => {
    if (timezones.length >= 8) {
      return;
    }

    setTimezones((previous) => [...previous, timezone]);
    setIsSearchOpen(false);
  };

  const removeTimezone = (timezoneId: string) => {
    setTimezones((previous) =>
      previous.filter((timezone) => timezone.id !== timezoneId),
    );
  };

  const togglePin = (timezoneId: string) => {
    setTimezones((previous) =>
      previous.map((timezone) =>
        timezone.id === timezoneId
          ? { ...timezone, pinned: !timezone.pinned }
          : timezone,
      ),
    );
  };

  return (
    <div className="space-y-6">
      <GlassPanel
        className="grid gap-8 p-6 lg:grid-cols-[0.9fr_1.1fr] lg:p-8"
        glow
      >
        <div className="flex justify-center">
          <AnalogClock size={280} />
        </div>

        <DigitalClock
          is24Hour={is24Hour}
          onToggleFormat={() => setIs24Hour((previous) => !previous)}
        />
      </GlassPanel>

      <section>
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              Saved Timezones
            </h2>
            <p className="text-sm text-(--text-muted)">
              Add up to 8 cities and pin your important ones.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            disabled={timezones.length >= 8}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-foreground transition hover:border-(--accent-primary) disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus size={17} />
            Add
          </button>
        </div>

        <motion.div layout className="flex gap-4 overflow-x-auto pb-3">
          <AnimatePresence initial={false}>
            {sortedTimezones.map((timezone) => (
              <TimezoneCard
                key={timezone.id}
                timezone={timezone}
                is24Hour={is24Hour}
                onRemove={removeTimezone}
                onTogglePin={togglePin}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      </section>

      <AnimatePresence>
        {isSearchOpen && (
          <TimezoneSearch
            savedTimezones={timezones}
            onAdd={addTimezone}
            onClose={() => setIsSearchOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
```

---

## 14. Step 4.10 — Connect ClockTab to AppShell

Update:

```txt
components/layout/AppShell.tsx
```

Import:

```tsx
import { ClockTab } from "@/components/clock/ClockTab";
```

Then replace the placeholder for the clock tab:

```tsx
case "clock":
  return <ClockTab />;
```

The other tabs can remain placeholders for now.

---

## 15. Step 4.11 — Local Timezone Detection

The app should detect the user's local timezone on first load.

Basic helper:

```ts
export function getLocalTimezone() {
  if (typeof window === "undefined") {
    return "UTC";
  }

  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}
```

This can be added later to improve default timezone display.

### Possible use

Show a small label under the main digital clock:

```txt
Local timezone: Asia/Tokyo
```

---

## 16. Step 4.12 — Empty State

If all timezone cards are removed, show an empty state.

Example:

```tsx
<GlassPanel className="p-6 text-center">
  <p className="text-lg font-medium text-foreground">No saved timezones</p>
  <p className="mt-2 text-sm text-(--text-muted)">
    Add your first city to compare time around the world.
  </p>
</GlassPanel>
```

This makes the UI feel complete even when the list is empty.

---

## 17. Step 4.13 — Maximum Timezone Limit

The first version should allow up to:

```txt
8 saved timezone cards
```

Reason:

- Keeps UI clean
- Prevents too much horizontal scrolling
- Keeps performance simple
- Matches the original project scope

When the limit is reached:

- Disable the Add button
- Optionally show text: `Maximum 8 timezones`

---

## 18. Step 4.14 — Animation Rules

Use Framer Motion for:

- Analog clock hands
- Digital digit changes
- Timezone card hover
- Timezone card layout reorder
- Timezone search modal enter/exit
- Empty state appearance

Recommended card behavior:

```tsx
<motion.article layout whileHover={{ y: -3 }}>
```

Recommended modal behavior:

```tsx
initial={{ opacity: 0, y: 24 }}
animate={{ opacity: 1, y: 0 }}
exit={{ opacity: 0, y: 24 }}
```

---

## 19. Step 4.15 — Accessibility Rules

World Clock accessibility rules:

- Analog clock should have `aria-label`
- Buttons should have clear labels
- Remove buttons should not rely only on `X` icon
- Pin buttons should announce pin/unpin action
- Timezone search modal should have a close button
- Search input should have a visible or accessible label
- Disabled Add button should clearly show it is disabled
- Text contrast should remain high on glass panels

---

## 20. Step 4.16 — Performance Notes

The clock updates often, so performance matters.

Important rules:

1. Keep the analog clock SVG simple.
2. Memoize tick marks with `useMemo`.
3. Use `React.memo` later if needed.
4. Avoid expensive calculations every frame.
5. Avoid rendering too many timezone cards.
6. Limit timezone cards to 8.
7. Do not load a huge timezone list in the first version.
8. Later, dynamically import a full timezone list only when the search modal opens.

---

## 21. What This Phase Does Not Include

This phase does not include:

- Countdown Timer
- Stopwatch
- Pomodoro Timer
- Alarm System
- Calendar System
- Full IANA timezone database
- Advanced fuzzy search library
- Drag-and-drop timezone sorting
- Cloud sync
- External calendar sync
- Backend API

Those parts belong to later phases or future versions.

---

## 22. Completion Checklist

Phase 4 is complete when:

- [ ] `ClockTab.tsx` exists
- [ ] `AnalogClock.tsx` exists
- [ ] `DigitalClock.tsx` exists
- [ ] `TimezoneCard.tsx` exists
- [ ] `TimezoneSearch.tsx` exists
- [ ] Main analog clock displays live time
- [ ] Main digital clock displays live time
- [ ] 12h / 24h toggle works
- [ ] Clock format preference persists in LocalStorage
- [ ] Default timezone cards render
- [ ] Timezone cards display live time
- [ ] User can add a timezone
- [ ] User can remove a timezone
- [ ] User can pin/unpin a timezone
- [ ] Pinned timezone cards appear first
- [ ] Saved timezone cards persist on reload
- [ ] Add timezone button disables at 8 cards
- [ ] Empty state appears when no cards exist
- [ ] Timezone search modal opens and closes
- [ ] Framer Motion card animations work
- [ ] AppShell renders `ClockTab` instead of placeholder
- [ ] No TypeScript errors
- [ ] No ESLint errors

---

## 23. Recommended Next Phase

After the World Clock tab is complete, move to:

**Phase 5 — Countdown Timer Tab**

That phase should include:

- Countdown input
- Preset buttons
- Countdown ring
- Timer start/pause/resume/reset
- Completion sound
- Completion notification
