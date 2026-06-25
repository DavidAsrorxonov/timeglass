import {
  AlarmClock,
  CalendarDays,
  Clock3,
  Coffee,
  Hourglass,
  TimerReset,
} from "lucide-react";

const tabs = [
  { label: "Clock", icon: Clock3 },
  { label: "Timer", icon: Hourglass },
  { label: "Stopwatch", icon: TimerReset },
  { label: "Pomodoro", icon: Coffee },
  { label: "Alarm", icon: AlarmClock },
  { label: "Calendar", icon: CalendarDays },
];

export function TabBar() {
  return (
    <nav
      className="glass-panel flex flex-wrap items-center gap-2 p-2"
      aria-label="Timeglass modules"
    >
      {tabs.map(({ label, icon: Icon }, index) => (
        <button
          key={label}
          type="button"
          className={`flex h-11 items-center gap-2 rounded-lg px-4 text-sm font-medium transition ${
            index === 0
              ? "bg-white/12 text-slate-50"
              : "text-slate-400 hover:bg-white/8 hover:text-slate-100"
          }`}
        >
          <Icon className="size-4" aria-hidden="true" />
          {label}
        </button>
      ))}
    </nav>
  );
}
