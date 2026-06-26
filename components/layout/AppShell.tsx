"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect } from "react";
import { AlarmRingingOverlay, AlarmTab } from "@/components/alarm/AlarmTab";
import { CalendarTab } from "@/components/calendar/CalendarTab";
import { ClockTab } from "@/components/clock/ClockTab";
import { CountdownTab } from "@/components/countdown/CountdownTab";
import { TabErrorBoundary } from "@/components/error/TabErrorBoundary";
import { GlowBackground } from "@/components/layout/GlowBackground";
import { TabBar } from "@/components/layout/TabBar";
import { NotificationBanner } from "@/components/notifications/NotificationBanner";
import { PomodoroTab } from "@/components/pomodoro/PomodoroTab";
import { StopwatchTab } from "@/components/stopwatch/StopwatchTab";
import { useAlarms, type UseAlarmsReturn } from "@/hooks/useAlarms";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import { TAB_SHORTCUT_HINT } from "@/lib/shortcuts";
import { isTabId } from "@/lib/tabs";
import type { TabId } from "@/types";

const tabVariants = {
  enter: {
    opacity: 0,
    y: 16,
  },
  center: {
    opacity: 1,
    y: 0,
  },
  exit: {
    opacity: 0,
    y: -16,
  },
};

const reducedTabVariants = {
  enter: {
    opacity: 0,
  },
  center: {
    opacity: 1,
  },
  exit: {
    opacity: 0,
  },
};

function ActivePanel({
  activeTab,
  alarmController,
}: {
  activeTab: TabId;
  alarmController: UseAlarmsReturn;
}) {
  if (activeTab === "clock") {
    return <ClockTab />;
  }

  if (activeTab === "countdown") {
    return <CountdownTab />;
  }

  if (activeTab === "stopwatch") {
    return <StopwatchTab />;
  }

  if (activeTab === "pomodoro") {
    return <PomodoroTab />;
  }

  if (activeTab === "alarm") {
    return <AlarmTab alarmController={alarmController} />;
  }

  if (activeTab === "calendar") {
    return <CalendarTab />;
  }

  return null;
}

export function AppShell() {
  const reduceMotion = useReducedMotion();
  const [activeTab, setActiveTab] = useLocalStorage<TabId>(
    STORAGE_KEYS.ACTIVE_TAB,
    "clock",
  );
  const alarmController = useAlarms();

  useKeyboardShortcuts({
    onTabChange: setActiveTab,
  });

  useEffect(() => {
    if (!isTabId(activeTab)) {
      setActiveTab("clock");
    }
  }, [activeTab, setActiveTab]);

  const safeActiveTab = isTabId(activeTab) ? activeTab : "clock";
  const variants = reduceMotion ? reducedTabVariants : tabVariants;

  return (
    <>
      <GlowBackground />

      <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <header className="mx-auto w-full max-w-5xl">
          <div className="mb-6">
            <p className="text-sm font-medium text-muted-foreground">Timeglass</p>

            <h1 className="mt-2 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              Time, organized simply.
            </h1>

            <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
              Clock, timer, stopwatch, Pomodoro, alarms, and calendar in one
              focused workspace.
            </p>
          </div>

          <TabBar
            activeTab={safeActiveTab}
            onTabChange={setActiveTab}
            hasEnabledAlarm={alarmController.hasEnabledAlarm}
          />

          <p className="mt-3 text-xs text-muted-foreground">
            {TAB_SHORTCUT_HINT}
          </p>
        </header>

        <NotificationBanner />

        <section className="mx-auto w-full max-w-5xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={safeActiveTab}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                duration: reduceMotion ? 0.18 : 0.28,
                ease: "easeOut",
              }}
            >
              <TabErrorBoundary resetKey={safeActiveTab}>
                <ActivePanel
                  activeTab={safeActiveTab}
                  alarmController={alarmController}
                />
              </TabErrorBoundary>
            </motion.div>
          </AnimatePresence>
        </section>
      </main>

      <AnimatePresence>
        {alarmController.activeAlarm && (
          <AlarmRingingOverlay
            alarm={alarmController.activeAlarm}
            onDismiss={alarmController.dismissAlarm}
            onSnooze={alarmController.snoozeAlarm}
          />
        )}
      </AnimatePresence>
    </>
  );
}
