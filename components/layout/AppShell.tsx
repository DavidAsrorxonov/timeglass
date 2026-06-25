"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect } from "react";
import { ClockTab } from "@/components/clock/ClockTab";
import { CountdownTab } from "@/components/countdown/CountdownTab";
import { GlowBackground } from "@/components/layout/GlowBackground";
import { TabBar } from "@/components/layout/TabBar";
import { StopwatchTab } from "@/components/stopwatch/StopwatchTab";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import { isTabId, TABS } from "@/lib/tabs";
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

const panelContent: Record<TabId, { title: string; description: string }> = {
  clock: {
    title: "World Clock",
    description:
      "Analog clock, digital clock, and timezone cards will be built here.",
  },
  countdown: {
    title: "Countdown Timer",
    description:
      "Countdown input, presets, progress ring, and alerts will be built here.",
  },
  stopwatch: {
    title: "Stopwatch",
    description:
      "Stopwatch controls, millisecond display, and lap list will be built here.",
  },
  pomodoro: {
    title: "Pomodoro",
    description:
      "Focus sessions, breaks, cycle tracking, and stats will be built here.",
  },
  alarm: {
    title: "Alarm System",
    description:
      "Alarm creation, editing, snooze, dismiss, and alarm sounds will be built here.",
  },
  calendar: {
    title: "Local Calendar",
    description:
      "Monthly calendar, local events, and event editing will be built here.",
  },
};

function PlaceholderPanel({ activeTab }: { activeTab: TabId }) {
  const content = panelContent[activeTab];

  return (
    <GlassPanel className="p-6 sm:p-8" glow>
      <p className="font-mono text-xs uppercase tracking-[0.28em] text-(--accent-glow)">
        {TABS.find((tab) => tab.id === activeTab)?.label}
      </p>
      <h2 className="mt-4 text-3xl font-semibold text-foreground">
        {content.title}
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-(--text-muted) sm:text-base">
        {content.description}
      </p>
    </GlassPanel>
  );
}

function ActivePanel({ activeTab }: { activeTab: TabId }) {
  if (activeTab === "clock") {
    return <ClockTab />;
  }

  if (activeTab === "countdown") {
    return <CountdownTab />;
  }

  if (activeTab === "stopwatch") {
    return <StopwatchTab />;
  }

  return <PlaceholderPanel activeTab={activeTab} />;
}

export function AppShell() {
  const reduceMotion = useReducedMotion();
  const [activeTab, setActiveTab] = useLocalStorage<TabId>(
    STORAGE_KEYS.ACTIVE_TAB,
    "clock",
  );

  useEffect(() => {
    if (!isTabId(activeTab)) {
      setActiveTab("clock");
    }
  }, [activeTab, setActiveTab]);

  const safeActiveTab = isTabId(activeTab) ? activeTab : "clock";

  return (
    <>
      <GlowBackground />

      <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <header className="mx-auto w-full max-w-5xl">
          <div className="mb-5 text-center">
            <p className="font-mono text-sm uppercase tracking-[0.32em] text-(--accent-glow)">
              Timeglass
            </p>

            <h1 className="font-display mt-3 text-5xl leading-none tracking-normal text-foreground sm:text-6xl">
              Time, beautifully organized.
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-(--text-muted) sm:text-base">
              A modern clock, timer, stopwatch, Pomodoro, alarm, and calendar
              app.
            </p>
          </div>

          <TabBar activeTab={safeActiveTab} onTabChange={setActiveTab} />
        </header>

        <section className="mx-auto w-full max-w-5xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={safeActiveTab}
              variants={reduceMotion ? undefined : tabVariants}
              initial={reduceMotion ? false : "enter"}
              animate={reduceMotion ? undefined : "center"}
              exit={reduceMotion ? undefined : "exit"}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <ActivePanel activeTab={safeActiveTab} />
            </motion.div>
          </AnimatePresence>
        </section>
      </main>
    </>
  );
}
