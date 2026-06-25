"use client";

import { useCallback } from "react";
import type { Alarm } from "@/types";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { STORAGE_KEYS } from "@/lib/storage-keys";

export function useAlarms() {
  const [alarms, setAlarms, clearAlarms] = useLocalStorage<Alarm[]>(
    STORAGE_KEYS.ALARMS,
    [],
  );

  const addAlarm = useCallback(
    (alarm: Alarm) => {
      setAlarms((previous) => [...previous, alarm]);
    },
    [setAlarms],
  );

  const updateAlarm = useCallback(
    (alarmId: string, updates: Partial<Alarm>) => {
      setAlarms((previous) =>
        previous.map((alarm) =>
          alarm.id === alarmId ? { ...alarm, ...updates } : alarm,
        ),
      );
    },
    [setAlarms],
  );

  const deleteAlarm = useCallback(
    (alarmId: string) => {
      setAlarms((previous) => previous.filter((alarm) => alarm.id !== alarmId));
    },
    [setAlarms],
  );

  const toggleAlarm = useCallback(
    (alarmId: string) => {
      setAlarms((previous) =>
        previous.map((alarm) =>
          alarm.id === alarmId ? { ...alarm, enabled: !alarm.enabled } : alarm,
        ),
      );
    },
    [setAlarms],
  );

  return {
    alarms,
    addAlarm,
    updateAlarm,
    deleteAlarm,
    toggleAlarm,
    clearAlarms,
  };
}
