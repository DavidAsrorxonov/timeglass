export type TabId =
  | "clock"
  | "countdown"
  | "stopwatch"
  | "pomodoro"
  | "alarm"
  | "calendar";

export type AlarmSound = "bell" | "digital" | "gentle" | "pulse";

export type DayOfWeek = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";

export interface Timezone {
  id: string;
  city: string;
  region: string;
  offset: string;
  pinned: boolean;
}

export interface Alarm {
  id: string;
  label: string;
  time: string;
  days: DayOfWeek[];
  enabled: boolean;
  sound: AlarmSound;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time?: string;
  color: string;
}

export interface PomodoroSession {
  completedPomodoros: number;
  totalFocusMinutes: number;
  streak: number;
  lastDate?: string;
}

export interface LapEntry {
  index: number;
  lapTime: number;
  totalTime: number;
}

export type TimerStatus = "idle" | "running" | "paused" | "done";

export type StopwatchStatus = "idle" | "running" | "paused";

export type PomodoroPhase = "idle" | "focus" | "break";

export type PomodoroMode = "focus" | "short-break" | "long-break";
