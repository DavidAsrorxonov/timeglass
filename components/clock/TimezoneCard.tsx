"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Pin, PinOff, X } from "lucide-react";
import { AnalogClock } from "@/components/clock/AnalogClock";
import { useClock } from "@/hooks/useClock";
import type { Timezone } from "@/types";

interface TimezoneCardProps {
  timezone: Timezone;
  is24Hour: boolean;
  onRemove: (id: string) => void;
  onTogglePin: (id: string) => void;
}

function formatCardTime(hours: number, minutes: number, is24Hour: boolean) {
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = is24Hour ? hours : hours % 12 || 12;

  return `${String(displayHours).padStart(2, "0")}:${String(
    minutes,
  ).padStart(2, "0")}${is24Hour ? "" : ` ${period}`}`;
}

export function TimezoneCard({
  timezone,
  is24Hour,
  onRemove,
  onTogglePin,
}: TimezoneCardProps) {
  const reduceMotion = useReducedMotion();
  const clock = useClock(timezone.timezone);
  const timeLabel = formatCardTime(clock.hours, clock.minutes, is24Hour);

  return (
    <motion.article
      layout
      exit={reduceMotion ? undefined : { opacity: 0, scale: 0.96 }}
      className="glass-panel min-w-64 p-5"
      whileHover={reduceMotion ? undefined : { y: -3 }}
      transition={{ duration: reduceMotion ? 0 : 0.2 }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-lg font-semibold text-foreground">
            {timezone.city}
          </h3>
          <p className="truncate text-sm text-(--text-muted)">
            {timezone.region}
          </p>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onTogglePin(timezone.id)}
            aria-label={timezone.pinned ? "Unpin timezone" : "Pin timezone"}
            title={timezone.pinned ? "Unpin timezone" : "Pin timezone"}
            className="focus-ring rounded-lg p-2 text-(--text-muted) transition hover:bg-white/8 hover:text-(--accent-glow)"
          >
            {timezone.pinned ? (
              <Pin className="size-4" aria-hidden="true" />
            ) : (
              <PinOff className="size-4" aria-hidden="true" />
            )}
          </button>

          <button
            type="button"
            onClick={() => onRemove(timezone.id)}
            aria-label={`Remove ${timezone.city}`}
            title={`Remove ${timezone.city}`}
            className="focus-ring rounded-lg p-2 text-(--text-muted) transition hover:bg-white/8 hover:text-(--accent-danger)"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between gap-4">
        <div>
          <p className="font-mono text-3xl font-semibold tracking-normal text-foreground">
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
