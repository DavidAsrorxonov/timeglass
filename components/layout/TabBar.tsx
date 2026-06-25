"use client";

import { motion, useReducedMotion } from "framer-motion";
import { NotificationBadge } from "@/components/ui/NotificationBadge";
import { TABS } from "@/lib/tabs";
import type { TabId } from "@/types";

type TabBarProps = {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  hasEnabledAlarm?: boolean;
};

export function TabBar({
  activeTab,
  onTabChange,
  hasEnabledAlarm = false,
}: TabBarProps) {
  const reduceMotion = useReducedMotion();

  return (
    <nav
      aria-label="Timeglass modules"
      className="no-scrollbar glass-panel mx-auto flex w-full max-w-5xl gap-2 overflow-x-auto p-2"
    >
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        const showBadge = tab.id === "alarm" && hasEnabledAlarm;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            aria-current={isActive ? "page" : undefined}
            className={`focus-ring relative flex min-h-11 min-w-24 items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition ${
              isActive
                ? "bg-white/10 text-foreground"
                : "text-(--text-muted) hover:bg-white/8 hover:text-foreground"
            }`}
          >
            <Icon className="size-4" aria-hidden="true" />
            <span>{tab.label}</span>

            {isActive && (
              <motion.span
                layoutId="active-tab-indicator"
                className="absolute inset-x-3 bottom-1 h-0.5 rounded-full bg-(--accent-primary) shadow-[0_0_12px_rgba(124,107,255,0.9)]"
                transition={{
                  duration: reduceMotion ? 0 : 0.25,
                  ease: "easeOut",
                }}
              />
            )}

            <NotificationBadge show={showBadge} />
          </button>
        );
      })}
    </nav>
  );
}
