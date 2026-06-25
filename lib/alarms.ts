import type { AlarmSound, DayOfWeek } from "@/types";

export const DAYS_OF_WEEK: DayOfWeek[] = [
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
  "Sun",
];

export const ALARM_SOUNDS: {
  value: AlarmSound;
  label: string;
  description: string;
}[] = [
  {
    value: "bell",
    label: "Bell",
    description: "Classic descending bell tone",
  },
  {
    value: "digital",
    label: "Digital",
    description: "Fast square-wave alert",
  },
  {
    value: "gentle",
    label: "Gentle",
    description: "Soft calm tone",
  },
  {
    value: "pulse",
    label: "Pulse",
    description: "Repeating short beeps",
  },
];

const JS_DAY_TO_LABEL: DayOfWeek[] = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
];

export function getCurrentDay(): DayOfWeek {
  return JS_DAY_TO_LABEL[new Date().getDay()];
}

export function getCurrentTimeKey() {
  const now = new Date();

  return `${String(now.getHours()).padStart(2, "0")}:${String(
    now.getMinutes(),
  ).padStart(2, "0")}`;
}

export function createSnoozeTime(minutes = 5) {
  const date = new Date();
  date.setMinutes(date.getMinutes() + minutes);
  return date.toISOString();
}

export function isSnoozeDue(snoozeUntil?: string) {
  if (!snoozeUntil) {
    return false;
  }

  return new Date(snoozeUntil).getTime() <= Date.now();
}

export function formatAlarmTime(time: string, is24Hour = true) {
  const [hourString = "0", minuteString = "0"] = time.split(":");
  const hours = Number(hourString);
  const minutes = Number(minuteString);

  if (is24Hour) {
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0",
    )}`;
  }

  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;

  return `${String(displayHours).padStart(2, "0")}:${String(
    minutes,
  ).padStart(2, "0")} ${period}`;
}
