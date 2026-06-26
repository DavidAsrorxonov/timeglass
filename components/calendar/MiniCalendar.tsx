"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo } from "react";
import { IconButton } from "@/components/ui/IconButton";

type CalendarDay = {
  date: Date;
  dateKey: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  hasEvents: boolean;
};

type MiniCalendarProps = {
  visibleMonth: Date;
  selectedDate: Date;
  eventDateKeys: Set<string>;
  onSelectDate: (date: Date) => void;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function toLocalDateKey(date: Date) {
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
  const gridStart = new Date(year, month, 1 - firstDayOfMonth.getDay());
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
  const reduceMotion = useReducedMotion();
  const days = useMemo(
    () => buildMonthGrid(visibleMonth, selectedDate, eventDateKeys),
    [eventDateKeys, selectedDate, visibleMonth],
  );

  return (
    <section className="rounded-lg border border-border bg-card p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-muted-foreground">
            Month View
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-foreground">
            {getMonthLabel(visibleMonth)}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <IconButton
            label="Previous month"
            icon={<ChevronLeft className="size-4" aria-hidden="true" />}
            onClick={onPreviousMonth}
          />

          <button
            type="button"
            onClick={onToday}
            className="focus-ring inline-flex min-h-11 items-center justify-center rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:border-foreground hover:bg-accent"
          >
            Today
          </button>

          <IconButton
            label="Next month"
            icon={<ChevronRight className="size-4" aria-hidden="true" />}
            onClick={onNextMonth}
          />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-7 gap-1.5 sm:gap-2">
        {WEEKDAYS.map((weekday) => (
          <div
            key={weekday}
            className="pb-1 text-center font-mono text-[0.65rem] uppercase tracking-[0.12em] text-muted-foreground sm:text-xs"
          >
            {weekday}
          </div>
        ))}

        {days.map((day) => {
          const activeClass = day.isSelected
            ? "border-primary bg-primary text-primary-foreground shadow-sm"
            : day.isToday
              ? "border-foreground bg-muted text-foreground"
              : "border-border text-foreground hover:border-foreground";
          const mutedClass = day.isCurrentMonth
            ? "opacity-100"
            : "opacity-40 hover:opacity-70";
          const labelParts = [
            day.date.toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            }),
            day.isToday ? "today" : "",
            day.hasEvents ? "has events" : "no events",
          ].filter(Boolean);

          return (
            <motion.button
              key={day.dateKey}
              type="button"
              onClick={() => onSelectDate(day.date)}
              whileHover={reduceMotion ? undefined : { y: -1 }}
              whileTap={reduceMotion ? undefined : { scale: 0.98 }}
              aria-pressed={day.isSelected}
              aria-label={labelParts.join(", ")}
              className={`focus-ring relative flex aspect-square min-h-11 flex-col items-center justify-center rounded-lg border text-sm font-medium transition ${activeClass} ${mutedClass}`}
            >
              <span>{day.dayNumber}</span>
              {day.hasEvents && (
                <span
                  className="mt-1 size-1.5 rounded-full bg-chart-1 shadow-sm"
                  aria-hidden="true"
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}
