"use client";

import { useMemo, useState } from "react";
import { EventList } from "@/components/calendar/EventList";
import { MiniCalendar, toLocalDateKey } from "@/components/calendar/MiniCalendar";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { useCalendar } from "@/hooks/useCalendar";

export function CalendarTab() {
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [visibleMonth, setVisibleMonth] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );

  const {
    eventDateKeys,
    addEvent,
    updateEvent,
    deleteEvent,
    getEventsForDate,
  } = useCalendar();

  const selectedDateKey = useMemo(
    () => toLocalDateKey(selectedDate),
    [selectedDate],
  );

  const selectedEvents = useMemo(
    () => getEventsForDate(selectedDateKey),
    [getEventsForDate, selectedDateKey],
  );

  const goToPreviousMonth = () => {
    setVisibleMonth(
      (previous) =>
        new Date(previous.getFullYear(), previous.getMonth() - 1, 1),
    );
  };

  const goToNextMonth = () => {
    setVisibleMonth(
      (previous) =>
        new Date(previous.getFullYear(), previous.getMonth() + 1, 1),
    );
  };

  const goToToday = () => {
    const today = new Date();
    setSelectedDate(today);
    setVisibleMonth(new Date(today.getFullYear(), today.getMonth(), 1));
  };

  const selectDate = (date: Date) => {
    setSelectedDate(date);
    setVisibleMonth(new Date(date.getFullYear(), date.getMonth(), 1));
  };

  return (
    <GlassPanel className="p-5 sm:p-6 lg:p-8" glow>
      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.32em] text-(--accent-glow)">
            Calendar
          </p>

          <h2 className="mt-3 text-2xl font-semibold text-foreground sm:text-3xl">
            Plan your local schedule.
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-(--text-muted)">
            Add simple browser-saved events. This calendar stays local to this
            device.
          </p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
        <MiniCalendar
          visibleMonth={visibleMonth}
          selectedDate={selectedDate}
          eventDateKeys={eventDateKeys}
          onSelectDate={selectDate}
          onPreviousMonth={goToPreviousMonth}
          onNextMonth={goToNextMonth}
          onToday={goToToday}
        />

        <EventList
          selectedDate={selectedDate}
          selectedDateKey={selectedDateKey}
          events={selectedEvents}
          onAddEvent={addEvent}
          onUpdateEvent={updateEvent}
          onDeleteEvent={deleteEvent}
        />
      </div>
    </GlassPanel>
  );
}
