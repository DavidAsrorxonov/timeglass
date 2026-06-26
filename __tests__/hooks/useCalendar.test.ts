import { act, renderHook } from "@testing-library/react";
import { useCalendar } from "@/hooks/useCalendar";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import type { CalendarEvent } from "@/types";

const events: CalendarEvent[] = [
  {
    id: "event-1",
    title: "Untimed",
    date: "2026-06-26",
    color: "#7c6bff",
  },
  {
    id: "event-2",
    title: "Late",
    date: "2026-06-26",
    time: "18:00",
    color: "#34d399",
  },
  {
    id: "event-3",
    title: "Early",
    date: "2026-06-26",
    time: "09:00",
    color: "#f87171",
  },
];

describe("useCalendar", () => {
  it("adds, sorts, updates, deletes, and persists events", () => {
    const { result } = renderHook(() => useCalendar());

    act(() => {
      events.forEach((event) => result.current.addEvent(event));
    });

    expect(result.current.events).toHaveLength(3);
    expect(result.current.eventDateKeys.has("2026-06-26")).toBe(true);
    expect(
      result.current.getEventsForDate("2026-06-26").map((event) => event.title),
    ).toEqual(["Early", "Late", "Untimed"]);

    act(() => {
      result.current.updateEvent("event-1", {
        title: "Updated",
        time: "07:00",
      });
    });

    expect(result.current.getEventsForDate("2026-06-26")[0].title).toBe(
      "Updated",
    );
    expect(window.localStorage.getItem(STORAGE_KEYS.CALENDAR_EVENTS)).toContain(
      "Updated",
    );

    act(() => {
      result.current.deleteEvent("event-2");
    });

    expect(result.current.events.map((event) => event.id)).toEqual([
      "event-1",
      "event-3",
    ]);
  });
});
