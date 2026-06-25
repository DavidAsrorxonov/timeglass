"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Alarm } from "@/types";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useNotifications } from "@/hooks/useNotifications";
import {
  createSnoozeTime,
  getCurrentDay,
  getCurrentTimeKey,
  isSnoozeDue,
} from "@/lib/alarms";
import { AudioManager } from "@/lib/audio";
import { STORAGE_KEYS } from "@/lib/storage-keys";

export function useAlarms() {
  const [alarms, setAlarms, clearAlarms] = useLocalStorage<Alarm[]>(
    STORAGE_KEYS.ALARMS,
    [],
  );
  const [activeAlarm, setActiveAlarm] = useState<Alarm | null>(null);
  const triggerMinuteRef = useRef<string | null>(null);
  const triggeredKeysRef = useRef<Set<string>>(new Set());
  const { sendNotification } = useNotifications();

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

  const triggerAlarm = useCallback(
    (alarm: Alarm) => {
      const ringingAlarm = { ...alarm, snoozeUntil: undefined };

      AudioManager.stopAllSounds();
      setActiveAlarm(ringingAlarm);
      AudioManager.playAlarmSound(ringingAlarm.sound);

      sendNotification("Timeglass Alarm", {
        body: ringingAlarm.label || "Your alarm is ringing.",
      });
    },
    [sendNotification],
  );

  const dismissAlarm = useCallback(() => {
    AudioManager.stopAllSounds();
    setActiveAlarm(null);
  }, []);

  const snoozeAlarm = useCallback(
    (alarmId: string) => {
      AudioManager.stopAllSounds();
      updateAlarm(alarmId, {
        snoozeUntil: createSnoozeTime(5),
      });
      setActiveAlarm(null);
    },
    [updateAlarm],
  );

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      const currentMinuteKey = getCurrentTimeKey();
      const currentDay = getCurrentDay();

      if (triggerMinuteRef.current !== currentMinuteKey) {
        triggerMinuteRef.current = currentMinuteKey;
        triggeredKeysRef.current.clear();
      }

      const matchingAlarm = alarms.find((alarm) => {
        const triggerKey = `${alarm.id}:${currentMinuteKey}`;

        if (!alarm.enabled || triggeredKeysRef.current.has(triggerKey)) {
          return false;
        }

        if (alarm.snoozeUntil) {
          return isSnoozeDue(alarm.snoozeUntil);
        }

        const dayMatches =
          alarm.days.length === 0 || alarm.days.includes(currentDay);

        return alarm.time === currentMinuteKey && dayMatches;
      });

      if (!matchingAlarm) {
        return;
      }

      const triggerKey = `${matchingAlarm.id}:${currentMinuteKey}`;
      triggeredKeysRef.current.add(triggerKey);

      if (matchingAlarm.snoozeUntil) {
        updateAlarm(matchingAlarm.id, {
          snoozeUntil: undefined,
        });
      }

      triggerAlarm(matchingAlarm);
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [alarms, triggerAlarm, updateAlarm]);

  const hasEnabledAlarm = useMemo(
    () => alarms.some((alarm) => alarm.enabled),
    [alarms],
  );

  return {
    alarms,
    activeAlarm,
    hasEnabledAlarm,
    addAlarm,
    updateAlarm,
    deleteAlarm,
    toggleAlarm,
    dismissAlarm,
    snoozeAlarm,
    clearAlarms,
  };
}

export type UseAlarmsReturn = ReturnType<typeof useAlarms>;
