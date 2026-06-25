export type Alarm = {
  id: string;
  label: string;
  time: string;
  enabled: boolean;
};

export type CalendarEvent = {
  id: string;
  title: string;
  date: string;
  time?: string;
};

export type PomodoroMode = "focus" | "short-break" | "long-break";
