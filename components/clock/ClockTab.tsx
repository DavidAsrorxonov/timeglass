"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { AnalogClock } from "@/components/clock/AnalogClock";
import { DigitalClock } from "@/components/clock/DigitalClock";
import { TimezoneCard } from "@/components/clock/TimezoneCard";
import { TimezoneSearch } from "@/components/clock/TimezoneSearch";
import { TimezoneEmptyState } from "@/components/empty-states/TimezoneEmptyState";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import { DEFAULT_TIMEZONES, normalizeTimezone } from "@/lib/timezones";
import type { Timezone } from "@/types";

const MAX_TIMEZONES = 8;

export function ClockTab() {
  const reduceMotion = useReducedMotion();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const [is24Hour, setIs24Hour] = useLocalStorage<boolean>(
    STORAGE_KEYS.CLOCK_FORMAT,
    true,
  );

  const [timezones, setTimezones] = useLocalStorage<Timezone[]>(
    STORAGE_KEYS.TIMEZONES,
    DEFAULT_TIMEZONES,
  );

  const normalizedTimezones = useMemo(() => {
    return timezones.map(normalizeTimezone);
  }, [timezones]);

  const sortedTimezones = useMemo(() => {
    return [...normalizedTimezones].sort((a, b) => {
      if (a.pinned === b.pinned) {
        return a.city.localeCompare(b.city);
      }

      return a.pinned ? -1 : 1;
    });
  }, [normalizedTimezones]);

  const addTimezone = (timezone: Timezone) => {
    if (normalizedTimezones.length >= MAX_TIMEZONES) {
      return;
    }

    setTimezones((previous) => {
      if (previous.some((saved) => saved.id === timezone.id)) {
        return previous;
      }

      return [...previous.map(normalizeTimezone), timezone];
    });
    setIsSearchOpen(false);
  };

  const removeTimezone = (timezoneId: string) => {
    setTimezones((previous) =>
      previous
        .map(normalizeTimezone)
        .filter((timezone) => timezone.id !== timezoneId),
    );
  };

  const togglePin = (timezoneId: string) => {
    setTimezones((previous) =>
      previous.map((timezone) => {
        const normalizedTimezone = normalizeTimezone(timezone);

        return normalizedTimezone.id === timezoneId
          ? { ...normalizedTimezone, pinned: !normalizedTimezone.pinned }
          : normalizedTimezone;
      }),
    );
  };

  const reachedLimit = normalizedTimezones.length >= MAX_TIMEZONES;

  return (
    <div className="space-y-6">
      <GlassPanel
        className="grid gap-8 p-6 lg:grid-cols-[0.9fr_1.1fr] lg:p-8"
        glow
      >
        <div className="flex justify-center">
          <AnalogClock size={280} />
        </div>

        <DigitalClock
          is24Hour={is24Hour}
          onToggleFormat={() => setIs24Hour((previous) => !previous)}
        />
      </GlassPanel>

      <section>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              Saved Timezones
            </h2>
            <p className="text-sm text-muted-foreground">
              {reachedLimit
                ? "Maximum 8 timezones"
                : "Add up to 8 cities and pin your important ones."}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            disabled={reachedLimit}
            className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-border px-4 py-2 text-sm text-foreground transition hover:border-foreground disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus className="size-4" aria-hidden="true" />
            Add
          </button>
        </div>

        <motion.div layout className="flex gap-4 overflow-x-auto pb-3">
          <AnimatePresence initial={false}>
            {sortedTimezones.map((timezone) => (
              <TimezoneCard
                key={timezone.id}
                timezone={timezone}
                is24Hour={is24Hour}
                onRemove={removeTimezone}
                onTogglePin={togglePin}
              />
            ))}
          </AnimatePresence>
        </motion.div>

        <AnimatePresence>
          {sortedTimezones.length === 0 && (
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: 12 }}
            >
              <TimezoneEmptyState />
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <AnimatePresence>
        {isSearchOpen && (
          <TimezoneSearch
            savedTimezones={normalizedTimezones}
            onAdd={addTimezone}
            onClose={() => setIsSearchOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
