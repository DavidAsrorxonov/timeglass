"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { useState } from "react";
import type { CalendarEvent } from "@/types";

type EventListProps = {
  selectedDate: Date;
  selectedDateKey: string;
  events: CalendarEvent[];
  onAddEvent: (event: CalendarEvent) => void;
  onUpdateEvent: (eventId: string, updates: Partial<CalendarEvent>) => void;
  onDeleteEvent: (eventId: string) => void;
};

const EVENT_COLORS = [
  "#7c6bff",
  "#34d399",
  "#f87171",
  "#60a5fa",
  "#fbbf24",
  "#f472b6",
];

function getSelectedDayLabel(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function createEventId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `event-${crypto.randomUUID()}`;
  }

  return `event-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function EventList({
  selectedDate,
  selectedDateKey,
  events,
  onAddEvent,
  onUpdateEvent,
  onDeleteEvent,
}: EventListProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("");
  const [color, setColor] = useState(EVENT_COLORS[0]);

  const isEditing = editingId !== null;
  const isFormOpen = isAdding || isEditing;
  const formTitle = isEditing ? "Edit event" : "New event";

  const resetForm = () => {
    setTitle("");
    setTime("");
    setColor(EVENT_COLORS[0]);
    setIsAdding(false);
    setEditingId(null);
  };

  const openAddForm = () => {
    resetForm();
    setIsAdding(true);
  };

  const startEditing = (event: CalendarEvent) => {
    setEditingId(event.id);
    setTitle(event.title);
    setTime(event.time ?? "");
    setColor(event.color);
    setIsAdding(false);
  };

  const saveNewEvent = () => {
    if (!title.trim()) {
      return;
    }

    onAddEvent({
      id: createEventId(),
      title: title.trim(),
      date: selectedDateKey,
      time: time || undefined,
      color,
    });

    resetForm();
  };

  const saveEditedEvent = () => {
    if (!editingId || !title.trim()) {
      return;
    }

    onUpdateEvent(editingId, {
      title: title.trim(),
      time: time || undefined,
      color,
    });

    resetForm();
  };

  const saveEvent = () => {
    if (isEditing) {
      saveEditedEvent();
      return;
    }

    saveNewEvent();
  };

  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.03] p-4 sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-(--text-muted)">
            Selected Day
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-foreground">
            Events
          </h2>
          <p className="mt-1 text-sm text-(--text-muted)">
            {getSelectedDayLabel(selectedDate)}
          </p>
        </div>

        <button
          type="button"
          onClick={openAddForm}
          className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-(--accent-primary) px-4 py-2 text-sm font-semibold text-white shadow-[0_0_20px_rgba(124,107,255,0.3)] transition hover:bg-(--accent-glow)"
        >
          <Plus className="size-4" aria-hidden="true" />
          Add
        </button>
      </div>

      {events.length === 0 && !isFormOpen ? (
        <motion.div
          className="mt-6 rounded-lg border border-white/10 bg-white/[0.03] p-6 text-center"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
        >
          <p className="text-lg font-medium text-foreground">
            Nothing scheduled
          </p>
          <p className="mt-2 text-sm leading-6 text-(--text-muted)">
            Add your first event for this day.
          </p>
        </motion.div>
      ) : (
        <motion.div layout className="mt-6 space-y-3">
          <AnimatePresence initial={false}>
            {events.map((event) => (
              <motion.article
                key={event.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="rounded-lg border border-white/10 bg-white/[0.04] p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 gap-3">
                    <span
                      className="mt-1 size-3 shrink-0 rounded-full shadow-[0_0_12px_rgba(255,255,255,0.18)]"
                      style={{ backgroundColor: event.color }}
                      aria-hidden="true"
                    />

                    <div className="min-w-0">
                      <h3 className="truncate font-medium text-foreground">
                        {event.title}
                      </h3>
                      <p className="mt-1 font-mono text-sm text-(--text-muted)">
                        {event.time ?? "Any time"}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => startEditing(event)}
                      className="inline-flex size-9 items-center justify-center rounded-lg border border-white/10 text-(--text-muted) transition hover:border-(--accent-primary) hover:text-foreground"
                      aria-label={`Edit ${event.title}`}
                    >
                      <Pencil className="size-4" aria-hidden="true" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteEvent(event.id)}
                      className="inline-flex size-9 items-center justify-center rounded-lg border border-white/10 text-(--text-muted) transition hover:border-(--accent-danger) hover:text-(--accent-danger)"
                      aria-label={`Delete ${event.title}`}
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            className="mt-6 rounded-lg border border-white/10 bg-white/[0.04] p-4"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-foreground">
                {formTitle}
              </h3>
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex size-9 items-center justify-center rounded-lg border border-white/10 text-(--text-muted) transition hover:border-(--accent-danger) hover:text-foreground"
                aria-label="Close event form"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>

            <div className="mt-4 grid gap-4">
              <label className="block">
                <span className="mb-2 block text-sm text-(--text-muted)">
                  Title
                </span>
                <input
                  type="text"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Study session"
                  maxLength={80}
                  className="glass-panel w-full px-4 py-3 text-foreground outline-none placeholder:text-(--text-muted) focus:border-(--accent-primary)"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm text-(--text-muted)">
                  Time
                </span>
                <input
                  type="time"
                  value={time}
                  onChange={(event) => setTime(event.target.value)}
                  className="glass-panel w-full px-4 py-3 font-mono text-foreground outline-none focus:border-(--accent-primary)"
                />
              </label>

              <div>
                <p className="mb-2 text-sm text-(--text-muted)">Color</p>
                <div className="flex flex-wrap gap-2">
                  {EVENT_COLORS.map((item) => {
                    const active = color === item;

                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setColor(item)}
                        aria-label={`Select event color ${item}`}
                        aria-pressed={active}
                        className={`size-9 rounded-lg border-2 transition ${
                          active
                            ? "border-white shadow-[0_0_14px_rgba(255,255,255,0.25)]"
                            : "border-transparent hover:border-white/50"
                        }`}
                        style={{ backgroundColor: item }}
                      />
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col justify-end gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={resetForm}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-foreground transition hover:border-(--accent-danger)"
                >
                  <X className="size-4" aria-hidden="true" />
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={saveEvent}
                  disabled={!title.trim()}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-(--accent-primary) px-4 py-2 text-sm font-semibold text-white transition hover:bg-(--accent-glow) disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Save className="size-4" aria-hidden="true" />
                  Save
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
