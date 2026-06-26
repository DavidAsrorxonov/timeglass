"use client";

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
  return (
    <nav
      aria-label="Timeglass modules"
      className="no-scrollbar flex w-full gap-1 overflow-x-auto rounded-lg border border-border bg-card p-1 shadow-sm"
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
            className={`focus-ring relative flex min-h-11 min-w-24 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition ${
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            <Icon className="size-4" aria-hidden="true" />
            <span>{tab.label}</span>

            <NotificationBadge show={showBadge} />
          </button>
        );
      })}
    </nav>
  );
}
