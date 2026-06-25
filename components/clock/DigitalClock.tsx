"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Clock3 } from "lucide-react";
import { useSyncExternalStore } from "react";
import { useClock } from "@/hooks/useClock";
import { getLocalTimezone } from "@/lib/timezones";

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
    hours: String(displayHours).padStart(2, "0"),
    minutes: String(minutes).padStart(2, "0"),
    period,
    seconds: String(seconds).padStart(2, "0"),
  };
}

function AnimatedTimeSegment({ value }: { value: string }) {
  const reduceMotion = useReducedMotion();

  return (
    <span className="relative inline-block min-w-[2ch] overflow-hidden align-baseline">
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={value}
          className="inline-block"
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, y: -10 }}
          transition={{ duration: reduceMotion ? 0 : 0.18, ease: "easeOut" }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function subscribeToTimezone() {
  return () => {};
}

function getServerTimezone() {
  return "UTC";
}

export function DigitalClock({
  timezone,
  is24Hour,
  onToggleFormat,
}: DigitalClockProps) {
  const clock = useClock(timezone);
  const detectedTimezone = useSyncExternalStore(
    subscribeToTimezone,
    getLocalTimezone,
    getServerTimezone,
  );
  const time = formatTime(
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

  const localTimezone = timezone ?? detectedTimezone;

  return (
    <div className="flex min-w-0 flex-col items-start justify-center">
      <p className="font-mono text-xs uppercase tracking-[0.32em] text-(--accent-glow)">
        Local Time
      </p>

      <div className="mt-4 flex max-w-full flex-wrap items-end gap-3">
        <p className="break-all font-mono text-4xl font-semibold tracking-normal text-foreground sm:text-6xl lg:text-7xl">
          <AnimatedTimeSegment value={time.hours} />
          <span aria-hidden="true">:</span>
          <AnimatedTimeSegment value={time.minutes} />
          <span aria-hidden="true">:</span>
          <AnimatedTimeSegment value={time.seconds} />
        </p>

        {!is24Hour && (
          <span className="mb-2 text-lg font-medium text-(--text-muted)">
            {time.period}
          </span>
        )}
      </div>

      <p className="mt-3 text-sm text-(--text-muted) sm:text-base">
        {dateLabel}
      </p>

      <p className="mt-2 inline-flex items-center gap-2 text-sm text-(--text-muted)">
        <Clock3 className="size-4 text-(--accent-glow)" aria-hidden="true" />
        Local timezone: {localTimezone}
      </p>

      <button
        type="button"
        onClick={onToggleFormat}
        className="focus-ring mt-5 min-h-11 rounded-lg border border-white/10 px-4 py-2 text-sm text-foreground transition hover:border-(--accent-primary) hover:text-white"
      >
        Switch to {is24Hour ? "12-hour" : "24-hour"} format
      </button>
    </div>
  );
}
