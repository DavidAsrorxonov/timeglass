import type { ElementType } from "react";
import {
  AlarmClock,
  CalendarDays,
  Clock3,
  Hourglass,
  Timer,
  Watch,
} from "lucide-react";
import type { TabId } from "@/types";

export const TABS = [
  {
    id: "clock",
    label: "Clock",
    icon: Clock3,
  },
  {
    id: "countdown",
    label: "Timer",
    icon: Timer,
  },
  {
    id: "stopwatch",
    label: "Stopwatch",
    icon: Watch,
  },
  {
    id: "pomodoro",
    label: "Pomodoro",
    icon: Hourglass,
  },
  {
    id: "alarm",
    label: "Alarm",
    icon: AlarmClock,
  },
  {
    id: "calendar",
    label: "Calendar",
    icon: CalendarDays,
  },
] satisfies {
  id: TabId;
  label: string;
  icon: ElementType;
}[];

export function isTabId(value: string): value is TabId {
  return TABS.some((tab) => tab.id === value);
}
