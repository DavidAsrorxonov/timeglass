"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Pencil, Trash2 } from "lucide-react";
import type { Alarm } from "@/types";
import { ALARM_SOUNDS, DAYS_OF_WEEK, formatAlarmTime } from "@/lib/alarms";

type AlarmCardProps = {
  alarm: Alarm;
  is24Hour?: boolean;
  onToggle: (id: string) => void;
  onEdit: (alarm: Alarm) => void;
  onDelete: (id: string) => void;
};

function getSoundLabel(sound: Alarm["sound"]) {
  return ALARM_SOUNDS.find((item) => item.value === sound)?.label ?? sound;
}

export function AlarmCard({
  alarm,
  is24Hour = true,
  onToggle,
  onEdit,
  onDelete,
}: AlarmCardProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.article
      layout
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      exit={reduceMotion ? undefined : { opacity: 0, y: -10 }}
      whileHover={reduceMotion ? undefined : { y: -2 }}
      transition={{ duration: reduceMotion ? 0 : 0.22, ease: "easeOut" }}
      className={`glass-panel p-5 transition ${
        alarm.enabled ? "opacity-100" : "opacity-60"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-mono text-4xl font-semibold leading-none text-foreground sm:text-5xl">
            {formatAlarmTime(alarm.time, is24Hour)}
          </p>

          <h3 className="mt-3 truncate text-lg font-medium text-foreground">
            {alarm.label || "Alarm"}
          </h3>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {alarm.days.length === 0 ? (
              <span className="rounded-md border border-border px-2.5 py-1 text-xs text-muted-foreground">
                Every day
              </span>
            ) : (
              DAYS_OF_WEEK.map((day) => (
                <span
                  key={day}
                  className={`rounded-md border px-2.5 py-1 text-xs ${
                    alarm.days.includes(day)
                      ? "border-primary/50 text-foreground"
                      : "border-border text-muted-foreground"
                  }`}
                >
                  {day}
                </span>
              ))
            )}
          </div>

          <p className="mt-3 inline-flex rounded-md border border-border px-3 py-1 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
            {getSoundLabel(alarm.sound)}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onToggle(alarm.id)}
          aria-label={alarm.enabled ? "Disable alarm" : "Enable alarm"}
          aria-pressed={alarm.enabled}
          className={`focus-ring relative h-8 w-14 shrink-0 rounded-full border transition ${
            alarm.enabled
              ? "border-primary bg-primary/30"
              : "border-border bg-muted"
          }`}
        >
          <motion.span
            className="absolute top-1 size-6 rounded-full bg-background shadow-sm"
            animate={{ x: alarm.enabled ? 24 : 4 }}
            transition={{ duration: reduceMotion ? 0 : 0.2, ease: "easeOut" }}
          />
        </button>
      </div>

      <div className="mt-5 flex flex-wrap justify-end gap-2">
        <button
          type="button"
          onClick={() => onEdit(alarm)}
          className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:border-foreground"
        >
          <Pencil className="size-4" aria-hidden="true" />
          Edit
        </button>

        <button
          type="button"
          onClick={() => onDelete(alarm.id)}
          className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:border-destructive hover:text-destructive"
        >
          <Trash2 className="size-4" aria-hidden="true" />
          Delete
        </button>
      </div>
    </motion.article>
  );
}
