"use client";

import { useCallback, useMemo } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import type { CalendarEvent } from "@/types";

function sortEvents(events: CalendarEvent[]) {
  return [...events].sort((a, b) => {
    if (a.time && b.time) {
      const timeSort = a.time.localeCompare(b.time);
      return timeSort === 0 ? a.title.localeCompare(b.title) : timeSort;
    }

    if (a.time) {
      return -1;
    }

    if (b.time) {
      return 1;
    }

    return a.title.localeCompare(b.title);
  });
}

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
      return sortEvents(events.filter((event) => event.date === dateKey));
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

export type UseCalendarReturn = ReturnType<typeof useCalendar>;
