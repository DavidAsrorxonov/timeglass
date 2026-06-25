# Timeglass — Phase 9: Local Calendar Tab

## 1. Purpose

This document explains **Phase 9 — Local Calendar Tab** for the **Timeglass** project.

The goal of this phase is to build a simple local calendar inside the app. Users should be able to view a monthly calendar, select a day, add events, edit events, delete events, and see which days have saved events.

This calendar is local-only. It stores events in the browser using LocalStorage and does not sync with Google Calendar, Apple Calendar, Outlook, or any external calendar service.

This phase uses systems from earlier phases, especially:

- `useLocalStorage`
- `GlassPanel`
- Shared TypeScript types
- LocalStorage storage keys
- Framer Motion animations
- Responsive layout patterns

---

## 2. Phase Goal

By the end of this phase, Timeglass should have a working Local Calendar tab with:

- Monthly calendar grid
- Previous month navigation
- Next month navigation
- Today highlight
- Selected day highlight
- Event dot indicators on days with events
- Event list for the selected day
- Add event feature
- Edit event feature
- Delete event feature
- Optional event time
- Event color selection
- LocalStorage persistence
- Empty state when no events exist
- Responsive layout

---

## 3. Files Created in This Phase

Phase 9 should create or update these files:

```txt
components/
└── calendar/
    ├── CalendarTab.tsx
    ├── MiniCalendar.tsx
    └── EventList.tsx

hooks/
└── useCalendar.ts
```

Also update:

```txt
components/layout/AppShell.tsx
types/index.ts
lib/storage-keys.ts
```

---

## 4. Local Calendar Overview

The Local Calendar tab lets users manage simple events directly inside Timeglass.

Basic layout:

```txt
┌──────────────────────────────────────────┐
│              Local Calendar              │
│                                          │
│   June 2026              [<] [Today] [>] │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │  Sun Mon Tue Wed Thu Fri Sat       │  │
│  │   1   2   3   4   5   6   7        │  │
│  │   8   9  10  11  12  13  14        │  │
│  │  15  16  17  18  19  20  21        │  │
│  │  22  23  24  25  26  27  28        │  │
│  │  29  30                            │  │
│  └────────────────────────────────────┘  │
│                                          │
│  Events for Jun 25                       │
│  ┌────────────────────────────────────┐  │
│  │  09:00  Study session              │  │
│  │  14:30  Meeting                    │  │
│  │  + Add event                       │  │
│  └────────────────────────────────────┘  │
└──────────────────────────────────────────┘
```

---

## 5. Important Scope Rule

The Local Calendar is not an external calendar integration.

### Included

- Add local events
- Edit local events
- Delete local events
- Store events in LocalStorage
- Show event dots on calendar days

### Not included

- Google Calendar sync
- Apple Calendar sync
- Outlook sync
- Calendar invitations
- Shared calendars
- Cloud backup
- Reminders from calendar events
- Recurring events

Those can be considered in future versions.

---

## 6. Step 9.1 — Update Types

Update:

```txt
types/index.ts
```

Make sure this interface exists:

```ts
export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time?: string;
  color: string;
}
```

### Field meanings

| Field   | Meaning                               |
| ------- | ------------------------------------- |
| `id`    | Unique event ID                       |
| `title` | Event title                           |
| `date`  | Event date in `YYYY-MM-DD` format     |
| `time`  | Optional event time in `HH:mm` format |
| `color` | Event color value                     |

---

## 7. Step 9.2 — Update Storage Keys

Update:

```txt
lib/storage-keys.ts
```

Make sure this key exists:

```ts
CALENDAR_EVENTS: "timeglass:calendar-events";
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

## 8. Step 9.3 — Calendar Data Shape

There are two possible ways to store calendar events.

### Option 1 — Store as an array

```ts
CalendarEvent[]
```

Example:

```json
[
  {
    "id": "event-1",
    "title": "Study session",
    "date": "2026-06-25",
    "time": "09:00",
    "color": "#7c6bff"
  }
]
```

### Option 2 — Store as a date-keyed object

```ts
Record<string, CalendarEvent[]>;
```

Example:

```json
{
  "2026-06-25": [
    {
      "id": "event-1",
      "title": "Study session",
      "date": "2026-06-25",
      "time": "09:00",
      "color": "#7c6bff"
    }
  ]
}
```

### Recommended first version

Use:

```ts
CalendarEvent[]
```

Reason:

- Simpler to understand
- Easier to edit and delete events
- Easier to filter by selected day
- Good enough for a local-only calendar

A date-keyed map can be derived using `useMemo`.

---

## 9. Step 9.4 — Calendar Helper Functions

The calendar needs helper functions for dates.

These can be inside `useCalendar.ts`, `MiniCalendar.tsx`, or a future utility file like:

```txt
lib/calendar.ts
```

For the first version, keeping helpers inside related files is fine.

### Date key helper

```ts
export function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}
```

### Important timezone note

`toISOString()` uses UTC time. For local calendar dates, a safer local date helper is better:

```ts
export function toLocalDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
```

Use `toLocalDateKey()` for this calendar.

### Month label helper

```ts
export function getMonthLabel(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}
```

### Selected day label helper

```ts
export function getSelectedDayLabel(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
```

---

## 10. Step 9.5 — Build Month Grid Helper

The calendar needs to generate days for a month grid.

### Required behavior

The grid should:

- Start on Sunday
- Show 7 columns
- Show 5 or 6 rows depending on the month
- Include previous/next month filler days if needed
- Mark days outside the current month
- Mark today
- Mark selected day
- Mark days with events

### Calendar day type

```ts
interface CalendarDay {
  date: Date;
  dateKey: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  hasEvents: boolean;
}
```

### Helper implementation

```ts
function toLocalDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function buildMonthGrid(
  visibleMonth: Date,
  selectedDate: Date,
  eventDateKeys: Set<string>,
): CalendarDay[] {
  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const startDay = firstDayOfMonth.getDay();

  const gridStart = new Date(year, month, 1 - startDay);

  const todayKey = toLocalDateKey(new Date());
  const selectedKey = toLocalDateKey(selectedDate);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);

    const dateKey = toLocalDateKey(date);

    return {
      date,
      dateKey,
      dayNumber: date.getDate(),
      isCurrentMonth: date.getMonth() === month,
      isToday: dateKey === todayKey,
      isSelected: dateKey === selectedKey,
      hasEvents: eventDateKeys.has(dateKey),
    };
  });
}
```

### Why 42 days?

A calendar month can require 6 rows of 7 days.

```txt
6 x 7 = 42
```

Using 42 cells keeps the layout stable.

---

## 11. Step 9.6 — useCalendar Hook

Create:

```txt
hooks/useCalendar.ts
```

This hook controls calendar event storage and event actions.

### Required behavior

The hook should:

- Store events in LocalStorage
- Add events
- Update events
- Delete events
- Get events for selected day
- Derive days that have events
- Sort events by time
- Clear events if needed

### Recommended implementation

```ts
"use client";

import { useCallback, useMemo } from "react";
import type { CalendarEvent } from "@/types";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { STORAGE_KEYS } from "@/lib/storage-keys";

export function useCalendar() {
  const [events, setEvents, clearEvents] = useLocalStorage<CalendarEvent[]>(
    STORAGE_KEYS.CALENDAR_EVENTS,
    [],
  );

  const addEvent = useCallback(
    (event: CalendarEvent) => {
      setEvents((previous) => [...previous, event]);
    },
    [setEvents],
  );

  const updateEvent = useCallback(
    (eventId: string, updates: Partial<CalendarEvent>) => {
      setEvents((previous) =>
        previous.map((event) =>
          event.id === eventId ? { ...event, ...updates } : event,
        ),
      );
    },
    [setEvents],
  );

  const deleteEvent = useCallback(
    (eventId: string) => {
      setEvents((previous) => previous.filter((event) => event.id !== eventId));
    },
    [setEvents],
  );

  const getEventsForDate = useCallback(
    (dateKey: string) => {
      return events
        .filter((event) => event.date === dateKey)
        .sort((a, b) => {
          if (!a.time && !b.time) {
            return a.title.localeCompare(b.title);
          }

          if (!a.time) {
            return 1;
          }

          if (!b.time) {
            return -1;
          }

          return a.time.localeCompare(b.time);
        });
    },
    [events],
  );

  const eventDateKeys = useMemo(() => {
    return new Set(events.map((event) => event.date));
  }, [events]);

  return {
    events,
    eventDateKeys,
    addEvent,
    updateEvent,
    deleteEvent,
    getEventsForDate,
    clearEvents,
  };
}
```

---

## 12. Step 9.7 — MiniCalendar Component

Create:

```txt
components/calendar/MiniCalendar.tsx
```

This component shows the monthly calendar grid.

### Required props

```ts
interface MiniCalendarProps {
  visibleMonth: Date;
  selectedDate: Date;
  eventDateKeys: Set<string>;
  onSelectDate: (date: Date) => void;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
}
```

### Required features

- Month title
- Previous month button
- Next month button
- Today button
- Weekday row
- 42-day grid
- Today highlight
- Selected date highlight
- Outside-month muted style
- Event dot indicators

### Example implementation

```tsx
"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarDay {
  date: Date;
  dateKey: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  hasEvents: boolean;
}

interface MiniCalendarProps {
  visibleMonth: Date;
  selectedDate: Date;
  eventDateKeys: Set<string>;
  onSelectDate: (date: Date) => void;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function toLocalDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getMonthLabel(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function buildMonthGrid(
  visibleMonth: Date,
  selectedDate: Date,
  eventDateKeys: Set<string>,
): CalendarDay[] {
  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const startDay = firstDayOfMonth.getDay();

  const gridStart = new Date(year, month, 1 - startDay);

  const todayKey = toLocalDateKey(new Date());
  const selectedKey = toLocalDateKey(selectedDate);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);

    const dateKey = toLocalDateKey(date);

    return {
      date,
      dateKey,
      dayNumber: date.getDate(),
      isCurrentMonth: date.getMonth() === month,
      isToday: dateKey === todayKey,
      isSelected: dateKey === selectedKey,
      hasEvents: eventDateKeys.has(dateKey),
    };
  });
}

export function MiniCalendar({
  visibleMonth,
  selectedDate,
  eventDateKeys,
  onSelectDate,
  onPreviousMonth,
  onNextMonth,
  onToday,
}: MiniCalendarProps) {
  const days = buildMonthGrid(visibleMonth, selectedDate, eventDateKeys);

  return (
    <div className="glass-panel p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-semibold text-foreground">
          {getMonthLabel(visibleMonth)}
        </h2>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onPreviousMonth}
            aria-label="Previous month"
            className="rounded-full border border-white/10 p-2 text-foreground transition hover:border-(--accent-primary)"
          >
            <ChevronLeft size={18} />
          </button>

          <button
            type="button"
            onClick={onToday}
            className="rounded-full border border-white/10 px-4 py-2 text-sm text-foreground transition hover:border-(--accent-primary)"
          >
            Today
          </button>

          <button
            type="button"
            onClick={onNextMonth}
            aria-label="Next month"
            className="rounded-full border border-white/10 p-2 text-foreground transition hover:border-(--accent-primary)"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-7 gap-2">
        {WEEKDAYS.map((weekday) => (
          <div
            key={weekday}
            className="pb-2 text-center text-xs uppercase tracking-[0.2em] text-(--text-muted)"
          >
            {weekday}
          </div>
        ))}

        {days.map((day) => {
          const activeClass = day.isSelected
            ? "border-[var(--accent-primary)] bg-[var(--accent-primary)]/25 text-white"
            : day.isToday
              ? "border-[var(--accent-glow)] text-white"
              : "border-white/10 text-[var(--text-primary)]";

          return (
            <button
              key={day.dateKey}
              type="button"
              onClick={() => onSelectDate(day.date)}
              className={`relative flex min-h-14 flex-col items-center justify-center rounded-2xl border text-sm transition hover:border-(--accent-primary) ${activeClass} ${
                day.isCurrentMonth ? "opacity-100" : "opacity-35"
              }`}
            >
              <span>{day.dayNumber}</span>

              {day.hasEvents && (
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-(--accent-primary) shadow-[0_0_8px_rgba(124,107,255,0.8)]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
```

---

## 13. Step 9.8 — EventList Component

Create:

```txt
components/calendar/EventList.tsx
```

This component displays and manages events for the selected day.

### Required props

```ts
interface EventListProps {
  selectedDate: Date;
  events: CalendarEvent[];
  onAddEvent: (event: CalendarEvent) => void;
  onUpdateEvent: (eventId: string, updates: Partial<CalendarEvent>) => void;
  onDeleteEvent: (eventId: string) => void;
}
```

### Required features

- Selected day title
- List events for selected day
- Empty state
- Add event form
- Edit event inline
- Delete event
- Optional time input
- Color selection

### Example implementation

```tsx
"use client";

import { Plus, Save, Trash2, X } from "lucide-react";
import { useState } from "react";
import type { CalendarEvent } from "@/types";

interface EventListProps {
  selectedDate: Date;
  selectedDateKey: string;
  events: CalendarEvent[];
  onAddEvent: (event: CalendarEvent) => void;
  onUpdateEvent: (eventId: string, updates: Partial<CalendarEvent>) => void;
  onDeleteEvent: (eventId: string) => void;
}

const EVENT_COLORS = [
  "#7c6bff",
  "#34d399",
  "#f87171",
  "#60a5fa",
  "#fbbf24",
  "#f472b6",
];

function getSelectedDayLabel(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function createEventId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `event-${crypto.randomUUID()}`;
  }

  return `event-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function EventList({
  selectedDate,
  selectedDateKey,
  events,
  onAddEvent,
  onUpdateEvent,
  onDeleteEvent,
}: EventListProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [time, setTime] = useState("");
  const [color, setColor] = useState(EVENT_COLORS[0]);

  const resetForm = () => {
    setTitle("");
    setTime("");
    setColor(EVENT_COLORS[0]);
    setIsAdding(false);
    setEditingId(null);
  };

  const saveNewEvent = () => {
    if (!title.trim()) {
      return;
    }

    onAddEvent({
      id: createEventId(),
      title: title.trim(),
      date: selectedDateKey,
      time: time || undefined,
      color,
    });

    resetForm();
  };

  const startEditing = (event: CalendarEvent) => {
    setEditingId(event.id);
    setTitle(event.title);
    setTime(event.time ?? "");
    setColor(event.color);
    setIsAdding(false);
  };

  const saveEditedEvent = () => {
    if (!editingId || !title.trim()) {
      return;
    }

    onUpdateEvent(editingId, {
      title: title.trim(),
      time: time || undefined,
      color,
    });

    resetForm();
  };

  const isFormOpen = isAdding || editingId;

  return (
    <div className="glass-panel p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Events</h2>

          <p className="mt-1 text-sm text-(--text-muted)">
            {getSelectedDayLabel(selectedDate)}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            resetForm();
            setIsAdding(true);
          }}
          className="inline-flex items-center gap-2 rounded-full bg-(--accent-primary) px-4 py-2 text-sm font-medium text-white transition hover:bg-(--accent-glow)"
        >
          <Plus size={16} />
          Add
        </button>
      </div>

      {events.length === 0 && !isFormOpen ? (
        <div className="mt-6 rounded-3xl border border-white/10 bg-white/3 p-6 text-center">
          <p className="text-lg font-medium text-foreground">
            Nothing scheduled
          </p>

          <p className="mt-2 text-sm text-(--text-muted)">
            Add your first event for this day.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {events.map((event) => (
            <div
              key={event.id}
              className="rounded-2xl border border-white/10 bg-white/3 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex gap-3">
                  <span
                    className="mt-1 h-3 w-3 rounded-full"
                    style={{ backgroundColor: event.color }}
                  />

                  <div>
                    <p className="font-medium text-foreground">{event.title}</p>

                    {event.time && (
                      <p className="mt-1 font-mono text-sm text-(--text-muted)">
                        {event.time}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => startEditing(event)}
                    className="rounded-full border border-white/10 px-3 py-1.5 text-sm text-foreground transition hover:border-(--accent-primary)"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => onDeleteEvent(event.id)}
                    className="rounded-full border border-white/10 px-3 py-1.5 text-sm text-foreground transition hover:border-(--accent-danger) hover:text-(--accent-danger)"
                    aria-label={`Delete ${event.title}`}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isFormOpen && (
        <div className="mt-6 rounded-3xl border border-white/10 bg-white/4 p-4">
          <div className="grid gap-3">
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Event title"
              className="glass-panel w-full px-4 py-3 text-foreground outline-none placeholder:text-(--text-muted)"
            />

            <input
              type="time"
              value={time}
              onChange={(event) => setTime(event.target.value)}
              className="glass-panel w-full px-4 py-3 font-mono text-foreground outline-none"
            />

            <div className="flex flex-wrap gap-2">
              {EVENT_COLORS.map((item) => {
                const active = color === item;

                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setColor(item)}
                    aria-label={`Select event color ${item}`}
                    className={`h-8 w-8 rounded-full border-2 ${
                      active ? "border-white" : "border-transparent"
                    }`}
                    style={{ backgroundColor: item }}
                  />
                );
              })}
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-foreground transition hover:border-(--accent-danger)"
              >
                <X size={16} />
                Cancel
              </button>

              <button
                type="button"
                onClick={editingId ? saveEditedEvent : saveNewEvent}
                disabled={!title.trim()}
                className="inline-flex items-center gap-2 rounded-full bg-(--accent-primary) px-4 py-2 text-sm font-medium text-white transition hover:bg-(--accent-glow) disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Save size={16} />
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## 14. Step 9.9 — CalendarTab Component

Create:

```txt
components/calendar/CalendarTab.tsx
```

This is the main Local Calendar screen.

### Responsibilities

`CalendarTab` should:

- Store visible month
- Store selected date
- Use `useCalendar`
- Render `MiniCalendar`
- Render `EventList`
- Move to previous month
- Move to next month
- Jump to today
- Pass selected day events to `EventList`

### Example implementation

```tsx
"use client";

import { useMemo, useState } from "react";
import { EventList } from "@/components/calendar/EventList";
import { MiniCalendar } from "@/components/calendar/MiniCalendar";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { useCalendar } from "@/hooks/useCalendar";

function toLocalDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function CalendarTab() {
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [visibleMonth, setVisibleMonth] = useState(() => new Date());

  const calendar = useCalendar();

  const selectedDateKey = useMemo(() => {
    return toLocalDateKey(selectedDate);
  }, [selectedDate]);

  const selectedEvents = useMemo(() => {
    return calendar.getEventsForDate(selectedDateKey);
  }, [calendar, selectedDateKey]);

  const goToPreviousMonth = () => {
    setVisibleMonth((previous) => {
      return new Date(previous.getFullYear(), previous.getMonth() - 1, 1);
    });
  };

  const goToNextMonth = () => {
    setVisibleMonth((previous) => {
      return new Date(previous.getFullYear(), previous.getMonth() + 1, 1);
    });
  };

  const goToToday = () => {
    const today = new Date();

    setSelectedDate(today);
    setVisibleMonth(today);
  };

  const selectDate = (date: Date) => {
    setSelectedDate(date);
    setVisibleMonth(new Date(date.getFullYear(), date.getMonth(), 1));
  };

  return (
    <GlassPanel className="p-6 lg:p-8" glow>
      <div className="mb-8">
        <p className="text-sm uppercase tracking-[0.35em] text-(--accent-glow)">
          Calendar
        </p>

        <h2 className="mt-3 text-3xl font-semibold text-foreground">
          Plan your local schedule.
        </h2>

        <p className="mt-3 max-w-2xl text-sm text-(--text-muted)">
          Add simple events that stay saved in your browser. No external
          calendar sync is included.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <MiniCalendar
          visibleMonth={visibleMonth}
          selectedDate={selectedDate}
          eventDateKeys={calendar.eventDateKeys}
          onSelectDate={selectDate}
          onPreviousMonth={goToPreviousMonth}
          onNextMonth={goToNextMonth}
          onToday={goToToday}
        />

        <EventList
          selectedDate={selectedDate}
          selectedDateKey={selectedDateKey}
          events={selectedEvents}
          onAddEvent={calendar.addEvent}
          onUpdateEvent={calendar.updateEvent}
          onDeleteEvent={calendar.deleteEvent}
        />
      </div>
    </GlassPanel>
  );
}
```

### Dependency note

The line below may cause extra renders depending on how `useCalendar` returns functions:

```ts
const selectedEvents = useMemo(() => {
  return calendar.getEventsForDate(selectedDateKey);
}, [calendar, selectedDateKey]);
```

A cleaner final version can destructure:

```ts
const { getEventsForDate } = calendar;
```

Then use:

```ts
[getEventsForDate, selectedDateKey];
```

---

## 15. Step 9.10 — Connect CalendarTab to AppShell

Update:

```txt
components/layout/AppShell.tsx
```

Import:

```tsx
import { CalendarTab } from "@/components/calendar/CalendarTab";
```

Then replace the calendar placeholder:

```tsx
case "calendar":
  return <CalendarTab />;
```

Now the Calendar tab should render when the user clicks the Calendar tab.

---

## 16. Step 9.11 — Event Sorting Rules

Events should be sorted like this:

1. Events with time first
2. Earlier times first
3. Events without time last
4. Untimed events sorted alphabetically

Example:

```txt
09:00 Study session
14:30 Meeting
Lunch
Read book
```

This keeps the day schedule easy to read.

---

## 17. Step 9.12 — Event Color Rules

The first version should offer six preset event colors:

```ts
const EVENT_COLORS = [
  "#7c6bff",
  "#34d399",
  "#f87171",
  "#60a5fa",
  "#fbbf24",
  "#f472b6",
];
```

### Why preset colors?

Preset colors are simpler than a full color picker and keep the design consistent.

A full custom color picker can be added later.

---

## 18. Step 9.13 — Add Event Flow

Expected add event flow:

1. User selects a day
2. User clicks `Add`
3. Event form opens
4. User enters title
5. User optionally enters time
6. User chooses color
7. User clicks Save
8. Event appears in selected day's list
9. Dot appears on that day in calendar grid
10. Event persists after page reload

---

## 19. Step 9.14 — Edit Event Flow

Expected edit event flow:

1. User clicks `Edit` on an event
2. Form opens with existing event values
3. User changes title, time, or color
4. User clicks Save
5. Event updates in the list
6. Event remains saved in LocalStorage

---

## 20. Step 9.15 — Delete Event Flow

Expected delete event flow:

1. User clicks delete icon
2. Event is removed
3. If no events remain on that day, dot disappears from calendar grid

### Optional future improvement

Show a confirmation before deleting.

For the first version, direct delete is acceptable.

---

## 21. Step 9.16 — Empty State

If a selected day has no events, show:

```txt
Nothing scheduled
Add your first event for this day.
```

The empty state should use:

- Glassmorphism style
- Muted text
- Friendly explanation
- Add button nearby

---

## 22. Step 9.17 — Animation Rules

Use Framer Motion for:

- Calendar tab entrance
- Event list item entrance
- Event form appearance
- Calendar day hover
- Event delete animation

Recommended event item animation:

```tsx
initial={{ opacity: 0, y: 8 }}
animate={{ opacity: 1, y: 0 }}
exit={{ opacity: 0, y: -8 }}
```

For the first version, simple CSS transitions are also fine.

---

## 23. Step 9.18 — Accessibility Rules

Local Calendar accessibility rules:

- Use real `<button>` elements for calendar days
- Previous and next month buttons need clear labels
- Today button should be keyboard accessible
- Event form inputs need labels or clear placeholders
- Delete buttons need `aria-label`
- Color buttons need `aria-label`
- Selected date should be visually clear
- Today should be visually clear
- Event dots should not be the only way to understand events
- Text contrast must remain readable on glass panels

---

## 24. Step 9.19 — Responsive Rules

### Desktop

```txt
Calendar grid on the left
Event list on the right
Two-column layout
```

### Tablet

```txt
Can remain two columns if space allows
Otherwise stack vertically
```

### Mobile

```txt
Calendar grid first
Event list below
Day cells remain touch-friendly
Buttons wrap if needed
```

Minimum touch target:

```txt
44px height
```

---

## 25. Step 9.20 — Performance Notes

Calendar performance rules:

1. Store events as a simple array.
2. Derive event date keys with `useMemo`.
3. Only show one month at a time.
4. Keep the grid fixed at 42 cells.
5. Avoid heavy date libraries unless needed.
6. Use local date helpers instead of UTC helpers.
7. Keep event count reasonable for LocalStorage.

Recommended first version limit:

```txt
No strict limit needed, but LocalStorage is not for very large calendars.
```

---

## 26. Important LocalStorage Limitation

LocalStorage is useful for a simple local calendar, but it has limitations:

- Data is stored only in the user's browser
- Data does not sync across devices
- Data can be cleared if browser data is deleted
- Data is not backed up in the cloud
- Large amounts of events are not ideal for LocalStorage

For Timeglass version 1, this is acceptable because the project scope is local-first and frontend-only.

---

## 27. What This Phase Does Not Include

This phase does not include:

- External calendar sync
- Google Calendar integration
- Apple Calendar integration
- Outlook integration
- Recurring events
- Event reminders
- Calendar notifications
- Drag-and-drop event moving
- Week view
- Day view
- Agenda view
- Shared calendars
- Cloud backup

These can be considered in future versions.

---

## 28. Completion Checklist

Phase 9 is complete when:

- [ ] `CalendarTab.tsx` exists
- [ ] `MiniCalendar.tsx` exists
- [ ] `EventList.tsx` exists
- [ ] `useCalendar.ts` exists
- [ ] Calendar events are stored in LocalStorage
- [ ] Monthly calendar grid renders correctly
- [ ] Grid starts on Sunday
- [ ] Grid shows 42 cells
- [ ] Previous month button works
- [ ] Next month button works
- [ ] Today button works
- [ ] User can select a day
- [ ] Selected day is highlighted
- [ ] Today is highlighted
- [ ] Days with events show dots
- [ ] Event list shows events for selected day
- [ ] Empty state appears when selected day has no events
- [ ] User can add an event
- [ ] User can edit an event
- [ ] User can delete an event
- [ ] Event title is required
- [ ] Event time is optional
- [ ] Event color selection works
- [ ] Events sort by time
- [ ] Events persist after page reload
- [ ] Event dot disappears when last event for a day is deleted
- [ ] `CalendarTab` is connected to `AppShell`
- [ ] Layout works on desktop, tablet, and mobile
- [ ] No TypeScript errors
- [ ] No ESLint errors

---

## 29. Recommended Next Phase

After the Local Calendar tab is complete, move to:

**Phase 10 — Cross-Cutting Features**

That phase should include:

- Notification permission banner
- Global keyboard shortcuts
- Responsive refinements
- Reduced motion support
- PWA manifest
- Service worker setup
- Shared app-level polish
