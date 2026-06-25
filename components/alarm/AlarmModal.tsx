"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Volume2, X } from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { ALARM_SOUNDS, DAYS_OF_WEEK } from "@/lib/alarms";
import { AudioManager } from "@/lib/audio";
import { BROWSER_TIMER_LIMITATION } from "@/lib/limitations";
import type { Alarm, AlarmSound, DayOfWeek } from "@/types";

type AlarmModalProps = {
  alarm?: Alarm | null;
  onSave: (alarm: Alarm) => void;
  onClose: () => void;
};

function createAlarmId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `alarm-${crypto.randomUUID()}`;
  }

  return `alarm-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function AlarmModal({ alarm, onSave, onClose }: AlarmModalProps) {
  const reduceMotion = useReducedMotion();
  const [time, setTime] = useState(alarm?.time ?? "07:00");
  const [label, setLabel] = useState(alarm?.label ?? "");
  const [days, setDays] = useState<DayOfWeek[]>(alarm?.days ?? []);
  const [sound, setSound] = useState<AlarmSound>(alarm?.sound ?? "bell");
  const [error, setError] = useState("");

  const isEditing = Boolean(alarm);

  const toggleDay = (day: DayOfWeek) => {
    setDays((previous) =>
      previous.includes(day)
        ? previous.filter((item) => item !== day)
        : [...previous, day],
    );
  };

  const previewSound = (nextSound: AlarmSound) => {
    setSound(nextSound);
    AudioManager.stopAllSounds();
    AudioManager.playAlarmSound(nextSound);
  };

  const handleClose = () => {
    AudioManager.stopAllSounds();
    onClose();
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!time) {
      setError("Choose a time for this alarm.");
      return;
    }

    onSave({
      id: alarm?.id ?? createAlarmId(),
      label: label.trim() || "Alarm",
      time,
      days,
      enabled: alarm?.enabled ?? true,
      sound,
      snoozeUntil: undefined,
    });
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end bg-black/65 p-4 backdrop-blur-md sm:items-center sm:justify-center"
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={reduceMotion ? undefined : { opacity: 1 }}
      exit={reduceMotion ? undefined : { opacity: 0 }}
      role="presentation"
    >
      <GlassPanel className="w-full max-w-xl p-5 sm:p-6">
        <motion.form
          onSubmit={handleSubmit}
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, y: 24 }}
          transition={{ duration: reduceMotion ? 0 : 0.24, ease: "easeOut" }}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-foreground">
                {isEditing ? "Edit Alarm" : "New Alarm"}
              </h2>
              <p className="mt-1 text-sm text-(--text-muted)">
                {BROWSER_TIMER_LIMITATION}
              </p>
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="focus-ring inline-flex size-10 shrink-0 items-center justify-center rounded-lg border border-white/10 text-(--text-muted) transition hover:border-(--accent-danger) hover:text-foreground"
              aria-label="Close alarm modal"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>

          <div className="mt-6 space-y-5">
            <label className="block">
              <span className="mb-2 block text-sm text-(--text-muted)">
                Time
              </span>
              <input
                type="time"
                value={time}
                onChange={(event) => {
                  setError("");
                  setTime(event.target.value);
                }}
                required
                className="focus-ring glass-panel w-full px-4 py-4 font-mono text-3xl text-foreground focus:border-(--accent-primary)"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-(--text-muted)">
                Label
              </span>
              <input
                type="text"
                value={label}
                onChange={(event) => setLabel(event.target.value)}
                placeholder="Morning run"
                maxLength={48}
                className="focus-ring glass-panel w-full px-4 py-3 text-foreground placeholder:text-(--text-muted) focus:border-(--accent-primary)"
              />
            </label>

            <div>
              <p className="mb-2 text-sm text-(--text-muted)">Repeat days</p>
              <div className="flex flex-wrap gap-2">
                {DAYS_OF_WEEK.map((day) => {
                  const active = days.includes(day);

                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      aria-pressed={active}
                      className={`focus-ring min-h-11 rounded-lg border px-3.5 py-2 text-sm font-medium transition ${
                        active
                          ? "border-(--accent-primary) bg-(--accent-primary)/25 text-white"
                          : "border-white/10 text-(--text-muted) hover:text-foreground"
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
              <p className="mt-2 text-xs text-(--text-muted)">
                Leave all days unselected to repeat every day.
              </p>
            </div>

            <div>
              <p className="mb-2 text-sm text-(--text-muted)">Alarm sound</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {ALARM_SOUNDS.map((item) => {
                  const active = sound === item.value;

                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => previewSound(item.value)}
                      aria-pressed={active}
                      className={`focus-ring rounded-lg border px-4 py-3 text-left transition ${
                        active
                          ? "border-(--accent-primary) bg-(--accent-primary)/20"
                          : "border-white/10 bg-white/[0.03] hover:border-(--accent-primary)"
                      }`}
                    >
                      <span className="flex items-center gap-2 font-medium text-foreground">
                        <Volume2 className="size-4" aria-hidden="true" />
                        {item.label}
                      </span>
                      <span className="mt-1 block text-sm text-(--text-muted)">
                        {item.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {error && (
            <p className="mt-4 text-sm text-(--accent-danger)" role="alert">
              {error}
            </p>
          )}

          <div className="mt-6 flex flex-col justify-end gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleClose}
              className="focus-ring inline-flex min-h-11 items-center justify-center rounded-lg border border-white/10 px-5 py-3 font-medium text-foreground transition hover:border-(--accent-danger)"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="focus-ring inline-flex min-h-11 items-center justify-center rounded-lg bg-(--accent-primary) px-5 py-3 font-medium text-white shadow-[0_0_24px_rgba(124,107,255,0.35)] transition hover:bg-(--accent-glow)"
            >
              Save Alarm
            </button>
          </div>
        </motion.form>
      </GlassPanel>
    </motion.div>
  );
}
