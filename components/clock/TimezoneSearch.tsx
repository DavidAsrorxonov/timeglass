"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { TIMEZONE_OPTIONS } from "@/lib/timezones";
import type { Timezone } from "@/types";

interface TimezoneSearchProps {
  savedTimezones: Timezone[];
  onAdd: (timezone: Timezone) => void;
  onClose: () => void;
}

export function TimezoneSearch({
  savedTimezones,
  onAdd,
  onClose,
}: TimezoneSearchProps) {
  const reduceMotion = useReducedMotion();
  const [query, setQuery] = useState("");

  const savedIds = useMemo(() => {
    return new Set(savedTimezones.map((timezone) => timezone.id));
  }, [savedTimezones]);

  const results = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return TIMEZONE_OPTIONS;
    }

    return TIMEZONE_OPTIONS.filter((timezone) => {
      return (
        timezone.city.toLowerCase().includes(normalizedQuery) ||
        timezone.region.toLowerCase().includes(normalizedQuery) ||
        timezone.timezone.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [query]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end bg-black/50 p-4 backdrop-blur-sm sm:items-center sm:justify-center"
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={reduceMotion ? undefined : { opacity: 1 }}
      exit={reduceMotion ? undefined : { opacity: 0 }}
    >
      <motion.div
        className="w-full max-w-xl"
        initial={reduceMotion ? false : { opacity: 0, y: 24 }}
        animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
        exit={reduceMotion ? undefined : { opacity: 0, y: 24 }}
        transition={{ duration: reduceMotion ? 0 : 0.2, ease: "easeOut" }}
      >
        <GlassPanel className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                Add Timezone
              </h2>
              <p className="mt-1 text-sm text-(--text-muted)">
                Search by city, country, or timezone name.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="focus-ring rounded-lg p-2 text-(--text-muted) transition hover:bg-white/8 hover:text-white"
              aria-label="Close timezone search"
              title="Close timezone search"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>

          <label className="mt-5 flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-3">
            <span className="sr-only">Search timezones</span>
            <Search className="size-5 text-(--text-muted)" aria-hidden="true" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search Tokyo, Tashkent, London..."
              className="focus-ring w-full rounded-lg bg-transparent text-sm text-foreground placeholder:text-(--text-muted)"
              autoFocus
            />
          </label>

          <div className="mt-4 max-h-80 space-y-2 overflow-y-auto pr-1">
            {results.map((timezone) => {
              const alreadyAdded = savedIds.has(timezone.id);

              return (
                <button
                  key={timezone.id}
                  type="button"
                  disabled={alreadyAdded}
                  onClick={() => onAdd({ ...timezone, pinned: false })}
                  className="focus-ring flex w-full items-center justify-between gap-4 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-left transition hover:border-(--accent-primary) disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <span className="min-w-0">
                    <span className="block truncate font-medium text-foreground">
                      {timezone.city}
                    </span>
                    <span className="block truncate text-sm text-(--text-muted)">
                      {timezone.region} / {timezone.timezone}
                    </span>
                  </span>

                  <span className="shrink-0 text-sm text-(--text-muted)">
                    {alreadyAdded ? "Added" : `UTC ${timezone.offset}`}
                  </span>
                </button>
              );
            })}

            {results.length === 0 && (
              <p className="rounded-lg border border-white/10 bg-white/5 px-4 py-6 text-center text-sm text-(--text-muted)">
                No timezone matches found.
              </p>
            )}
          </div>
        </GlassPanel>
      </motion.div>
    </motion.div>
  );
}
