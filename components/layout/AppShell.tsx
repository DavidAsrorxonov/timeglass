import { CalendarDays, Clock3, Timer, TimerReset } from "lucide-react";
import { GlowBackground } from "@/components/layout/GlowBackground";
import { TabBar } from "@/components/layout/TabBar";
import { GlassPanel } from "@/components/ui/GlassPanel";

const scaffoldItems = [
  { label: "Clock", icon: Clock3 },
  { label: "Timer", icon: Timer },
  { label: "Stopwatch", icon: TimerReset },
  { label: "Calendar", icon: CalendarDays },
];

export function AppShell() {
  return (
    <main className="relative min-h-screen overflow-hidden px-6 py-8">
      <GlowBackground />
      <section className="relative z-10 mx-auto flex max-w-5xl flex-col gap-6">
        <GlassPanel className="p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400">Timeglass</p>
              <h1 className="font-display mt-3 text-6xl leading-none tracking-normal text-slate-50 sm:text-7xl">
                Timeglass
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-400">
                Clock, timer, stopwatch, Pomodoro, alarm, and calendar in one
                app.
              </p>
            </div>
            <div className="font-mono text-sm text-slate-400">
              Scaffold ready
            </div>
          </div>
        </GlassPanel>

        <TabBar />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {scaffoldItems.map(({ label, icon: Icon }) => (
            <GlassPanel key={label} className="p-5">
              <Icon className="size-5 text-violet-300" aria-hidden="true" />
              <h2 className="mt-4 text-lg font-semibold text-slate-50">
                {label}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Placeholder module prepared for a later feature phase.
              </p>
            </GlassPanel>
          ))}
        </div>
      </section>
    </main>
  );
}
