"use client";

import { motion } from "framer-motion";
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
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
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
              <span className="rounded-md border border-white/10 px-2.5 py-1 text-xs text-(--text-muted)">
                Every day
              </span>
            ) : (
              DAYS_OF_WEEK.map((day) => (
                <span
                  key={day}
                  className={`rounded-md border px-2.5 py-1 text-xs ${
                    alarm.days.includes(day)
                      ? "border-(--accent-primary)/50 text-foreground"
                      : "border-white/10 text-(--text-muted)"
                  }`}
                >
                  {day}
                </span>
              ))
            )}
          </div>

          <p className="mt-3 inline-flex rounded-md border border-white/10 px-3 py-1 font-mono text-xs uppercase tracking-[0.18em] text-(--text-muted)">
            {getSoundLabel(alarm.sound)}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onToggle(alarm.id)}
          aria-label={alarm.enabled ? "Disable alarm" : "Enable alarm"}
          aria-pressed={alarm.enabled}
          className={`relative h-8 w-14 shrink-0 rounded-full border transition ${
            alarm.enabled
              ? "border-(--accent-primary) bg-(--accent-primary)/30"
              : "border-white/10 bg-white/5"
          }`}
        >
          <motion.span
            className="absolute top-1 size-6 rounded-full bg-white shadow"
            animate={{ x: alarm.enabled ? 24 : 4 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          />
        </button>
      </div>

      <div className="mt-5 flex flex-wrap justify-end gap-2">
        <button
          type="button"
          onClick={() => onEdit(alarm)}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-foreground transition hover:border-(--accent-primary)"
        >
          <Pencil className="size-4" aria-hidden="true" />
          Edit
        </button>

        <button
          type="button"
          onClick={() => onDelete(alarm.id)}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-foreground transition hover:border-(--accent-danger) hover:text-(--accent-danger)"
        >
          <Trash2 className="size-4" aria-hidden="true" />
          Delete
        </button>
      </div>
    </motion.article>
  );
}
