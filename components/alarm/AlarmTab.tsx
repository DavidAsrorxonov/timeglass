"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { BellRing, Plus, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { AlarmCard } from "@/components/alarm/AlarmCard";
import { AlarmModal } from "@/components/alarm/AlarmModal";
import { AlarmEmptyState } from "@/components/empty-states/AlarmEmptyState";
import { GlassPanel } from "@/components/ui/GlassPanel";
import type { UseAlarmsReturn } from "@/hooks/useAlarms";
import { useNotifications } from "@/hooks/useNotifications";
import { formatAlarmTime } from "@/lib/alarms";
import {
  BROWSER_TIMER_LIMITATION,
  PWA_ALARM_LIMITATION,
} from "@/lib/limitations";
import type { Alarm } from "@/types";

const MAX_ALARMS = 20;

type AlarmTabProps = {
  alarmController: UseAlarmsReturn;
};

type AlarmRingingOverlayProps = {
  alarm: Alarm;
  onDismiss: () => void;
  onSnooze: (id: string) => void;
};

export function AlarmRingingOverlay({
  alarm,
  onDismiss,
  onSnooze,
}: AlarmRingingOverlayProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xl"
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={reduceMotion ? undefined : { opacity: 1 }}
      exit={reduceMotion ? undefined : { opacity: 0 }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="ringing-alarm-title"
    >
      <GlassPanel className="w-full max-w-lg p-7 text-center sm:p-8">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 18, scale: 0.98 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
          exit={reduceMotion ? undefined : { opacity: 0, y: 18, scale: 0.98 }}
          transition={{ duration: reduceMotion ? 0 : 0.24, ease: "easeOut" }}
        >
          <BellRing
            className="mx-auto size-10 text-(--accent-danger)"
            aria-hidden="true"
          />

          <p className="mt-5 font-mono text-xs uppercase tracking-[0.35em] text-(--accent-danger)">
            Alarm Ringing
          </p>

          <h2
            id="ringing-alarm-title"
            className="mt-4 font-mono text-6xl font-semibold leading-none text-foreground"
          >
            {formatAlarmTime(alarm.time, false)}
          </h2>

          <p className="mt-4 text-xl text-foreground">
            {alarm.label || "Alarm"}
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => onSnooze(alarm.id)}
              className="focus-ring inline-flex min-h-12 items-center justify-center rounded-lg border border-white/10 px-6 py-3 font-medium text-foreground transition hover:border-(--accent-primary)"
            >
              Snooze 5 min
            </button>

            <button
              type="button"
              onClick={onDismiss}
              className="focus-ring inline-flex min-h-12 items-center justify-center rounded-lg bg-(--accent-danger) px-6 py-3 font-medium text-white transition hover:opacity-90"
            >
              Dismiss
            </button>
          </div>
        </motion.div>
      </GlassPanel>
    </motion.div>
  );
}

export function AlarmTab({ alarmController }: AlarmTabProps) {
  const reduceMotion = useReducedMotion();
  const alarms = alarmController;
  const notifications = useNotifications();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAlarm, setEditingAlarm] = useState<Alarm | null>(null);

  const sortedAlarms = useMemo(() => {
    return [...alarms.alarms].sort((a, b) => {
      if (a.enabled !== b.enabled) {
        return a.enabled ? -1 : 1;
      }

      return a.time.localeCompare(b.time);
    });
  }, [alarms.alarms]);

  const canCreateAlarm = alarms.alarms.length < MAX_ALARMS;

  const openCreateModal = () => {
    setEditingAlarm(null);
    setIsModalOpen(true);
  };

  const openEditModal = (alarm: Alarm) => {
    setEditingAlarm(alarm);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditingAlarm(null);
    setIsModalOpen(false);
  };

  const saveAlarm = (alarm: Alarm) => {
    const exists = alarms.alarms.some((item) => item.id === alarm.id);

    if (exists) {
      alarms.updateAlarm(alarm.id, alarm);
    } else {
      alarms.addAlarm(alarm);
    }

    closeModal();
  };

  return (
    <GlassPanel className="p-5 sm:p-6 lg:p-8" glow>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.32em] text-(--accent-glow)">
            Alarms
          </p>

          <h2 className="mt-3 text-2xl font-semibold text-foreground sm:text-3xl">
            Wake up, focus, or remember.
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-(--text-muted)">
            Create local browser-based alarms. {BROWSER_TIMER_LIMITATION}{" "}
            {PWA_ALARM_LIMITATION}
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          disabled={!canCreateAlarm}
          className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-(--accent-primary) px-5 py-3 text-sm font-semibold text-white shadow-[0_0_24px_rgba(124,107,255,0.35)] transition hover:bg-(--accent-glow) disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Plus className="size-4" aria-hidden="true" />
          New Alarm
        </button>
      </div>

      <div className="mt-6 flex flex-col gap-3 rounded-lg border border-white/10 bg-white/3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <ShieldCheck
            className="mt-0.5 size-5 shrink-0 text-(--accent-success)"
            aria-hidden="true"
          />
          <div>
            <p className="text-sm font-medium text-foreground">
              Browser notifications
            </p>
            <p className="mt-1 text-sm text-(--text-muted)">
              {notifications.canNotify
                ? "Notifications are enabled for ringing alarms."
                : notifications.isSupported
                  ? "Enable notifications if you want a browser alert when an alarm rings."
                  : "This browser does not support notifications."}
            </p>
          </div>
        </div>

        {notifications.isSupported && !notifications.canNotify && (
          <button
            type="button"
            onClick={() => void notifications.requestPermission()}
            className="focus-ring inline-flex min-h-11 items-center justify-center rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-foreground transition hover:border-(--accent-primary)"
          >
            Enable
          </button>
        )}
      </div>

      {!canCreateAlarm && (
        <p className="mt-4 text-sm text-(--text-muted)">
          Alarm limit reached. Delete an alarm before creating another one.
        </p>
      )}

      {sortedAlarms.length === 0 ? (
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.24, ease: "easeOut" }}
        >
          <AlarmEmptyState />
        </motion.div>
      ) : (
        <motion.div layout className="mt-8 grid gap-4">
          <AnimatePresence initial={false}>
            {sortedAlarms.map((alarm) => (
              <AlarmCard
                key={alarm.id}
                alarm={alarm}
                onToggle={alarms.toggleAlarm}
                onEdit={openEditModal}
                onDelete={alarms.deleteAlarm}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      <AnimatePresence>
        {isModalOpen && (
          <AlarmModal
            alarm={editingAlarm}
            onSave={saveAlarm}
            onClose={closeModal}
          />
        )}
      </AnimatePresence>
    </GlassPanel>
  );
}
