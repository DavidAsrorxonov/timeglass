# Timeglass — Phase 3: Layout & Navigation

## 1. Purpose

This document explains **Phase 3 — Layout & Navigation** for the **Timeglass** project.

The goal of this phase is to build the main application shell, tab navigation, animated background, reusable glass panel wrapper, and basic tab switching system.

This phase connects the project foundation from Phase 1 and Phase 2 to the user interface. It does not fully build the six main feature modules yet. Instead, it prepares the layout where those modules will appear.

---

## 2. Phase Goal

By the end of this phase, Timeglass should have:

- A working `AppShell`
- A six-tab navigation system
- A reusable `TabBar`
- A reusable `GlassPanel`
- A glowing animated background
- Basic placeholder screens for all six modules
- Smooth Framer Motion tab transitions
- Responsive layout behavior
- Local active tab state
- Optional LocalStorage persistence for the last active tab

---

## 3. Files Created in This Phase

Phase 3 should create or update these files:

```txt
components/
├── layout/
│   ├── AppShell.tsx
│   ├── TabBar.tsx
│   └── GlowBackground.tsx
│
└── ui/
    ├── GlassPanel.tsx
    └── NotificationBadge.tsx

app/
└── page.tsx
```

Optional supporting files:

```txt
lib/
└── tabs.ts
```

---

## 4. Layout Concept

Timeglass is a single-page app with six main tabs:

1. Clock
2. Timer
3. Stopwatch
4. Pomodoro
5. Alarm
6. Calendar

The layout should look like this:

```txt
┌────────────────────────────────────────────┐
│              Glow Background               │
│                                            │
│       ┌────────────────────────────┐       │
│       │          Timeglass          │       │
│       │  Clock Timer Stopwatch...   │       │
│       └────────────────────────────┘       │
│                                            │
│       ┌────────────────────────────┐       │
│       │                            │       │
│       │      Active Tab Panel       │       │
│       │                            │       │
│       └────────────────────────────┘       │
│                                            │
└────────────────────────────────────────────┘
```

On mobile, the tab bar can move to the bottom later, but in this phase a responsive top tab bar is enough.

---

## 5. Step 3.1 — Tab Data

Create an optional file:

```txt
lib/tabs.ts
```

This keeps tab information in one place.

```ts
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
  icon: React.ElementType;
}[];
```

### Why this is useful

Instead of repeating tab labels and icons inside different components, the app can import one shared `TABS` array.

---

## 6. Step 3.2 — GlassPanel Component

Create:

```txt
components/ui/GlassPanel.tsx
```

This component wraps content inside the Timeglass glassmorphism style.

```tsx
"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface GlassPanelProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
}

export function GlassPanel({
  children,
  className = "",
  hover = false,
  glow = false,
}: GlassPanelProps) {
  return (
    <motion.div
      className={`glass-panel ${className}`}
      initial={glow ? { opacity: 0, scale: 0.98 } : false}
      animate={glow ? { opacity: 1, scale: 1 } : undefined}
      whileHover={hover ? { y: -2 } : undefined}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
```

### Used by

`GlassPanel` will be used in:

- Main tab panels
- Clock cards
- Timer cards
- Alarm cards
- Calendar panels
- Empty states
- Error states

---

## 7. Step 3.3 — NotificationBadge Component

Create:

```txt
components/ui/NotificationBadge.tsx
```

This is a small visual indicator used later for enabled alarms or active notifications.

```tsx
interface NotificationBadgeProps {
  show?: boolean;
}

export function NotificationBadge({ show = false }: NotificationBadgeProps) {
  if (!show) {
    return null;
  }

  return (
    <span
      aria-hidden="true"
      className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-(--accent-danger) shadow-[0_0_12px_rgba(248,113,113,0.8)]"
    />
  );
}
```

### Used by

This will be used on the Alarm tab when one or more alarms are enabled.

---

## 8. Step 3.4 — GlowBackground Component

Create:

```txt
components/layout/GlowBackground.tsx
```

This component creates the animated ambient background.

```tsx
"use client";

import { motion, useReducedMotion } from "framer-motion";

export function GlowBackground() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background">
      <motion.svg
        className="h-full w-full"
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMid slice"
        animate={
          reduceMotion
            ? undefined
            : {
                scale: [1, 1.05, 1],
              }
        }
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <defs>
          <radialGradient id="violetGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#7c6bff" stopOpacity="0.28" />
            <stop offset="60%" stopColor="#7c6bff" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#7c6bff" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="blueGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.18" />
            <stop offset="65%" stopColor="#2563eb" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle cx="260" cy="260" r="360" fill="url(#violetGlow)" />
        <circle cx="960" cy="540" r="420" fill="url(#blueGlow)" />
      </motion.svg>
    </div>
  );
}
```

### Design behavior

The background should feel alive, but not distracting. It should move slowly and respect reduced motion settings.

---

## 9. Step 3.5 — TabBar Component

Create:

```txt
components/layout/TabBar.tsx
```

This component shows the six tabs and lets the user switch between them.

```tsx
"use client";

import { motion } from "framer-motion";
import type { TabId } from "@/types";
import { TABS } from "@/lib/tabs";
import { NotificationBadge } from "@/components/ui/NotificationBadge";

interface TabBarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  hasEnabledAlarm?: boolean;
}

export function TabBar({
  activeTab,
  onTabChange,
  hasEnabledAlarm = false,
}: TabBarProps) {
  return (
    <nav
      aria-label="Timeglass modules"
      className="glass-panel mx-auto flex w-full max-w-5xl gap-2 overflow-x-auto p-2"
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
            className={`relative flex min-w-24 items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm transition ${
              isActive
                ? "text-foreground"
                : "text-(--text-muted) hover:text-foreground"
            }`}
          >
            <Icon size={18} />
            <span>{tab.label}</span>

            {isActive && (
              <motion.span
                layoutId="active-tab-indicator"
                className="absolute inset-x-3 bottom-1 h-0.5 rounded-full bg-(--accent-primary) shadow-[0_0_12px_rgba(124,107,255,0.9)]"
                transition={{ duration: 0.25, ease: "easeOut" }}
              />
            )}

            <NotificationBadge show={showBadge} />
          </button>
        );
      })}
    </nav>
  );
}
```

### TabBar behavior

The TabBar should:

- Show all six modules
- Highlight the active tab
- Animate the active underline
- Be horizontally scrollable on small screens
- Show an alarm badge when needed
- Use accessible button elements

---

## 10. Step 3.6 — AppShell Component

Create:

```txt
components/layout/AppShell.tsx
```

This is the main layout controller of the app.

```tsx
"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import type { TabId } from "@/types";
import { GlowBackground } from "@/components/layout/GlowBackground";
import { TabBar } from "@/components/layout/TabBar";
import { GlassPanel } from "@/components/ui/GlassPanel";

const tabVariants = {
  enter: {
    opacity: 0,
    y: 16,
  },
  center: {
    opacity: 1,
    y: 0,
  },
  exit: {
    opacity: 0,
    y: -16,
  },
};

function PlaceholderPanel({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <GlassPanel className="p-8" glow>
      <h2 className="text-3xl font-semibold text-foreground">{title}</h2>
      <p className="mt-3 max-w-2xl text-(--text-muted)">{description}</p>
    </GlassPanel>
  );
}

function renderActivePanel(activeTab: TabId) {
  switch (activeTab) {
    case "clock":
      return (
        <PlaceholderPanel
          title="World Clock"
          description="Analog clock, digital clock, and timezone cards will be built here."
        />
      );

    case "countdown":
      return (
        <PlaceholderPanel
          title="Countdown Timer"
          description="Countdown input, presets, progress ring, and alerts will be built here."
        />
      );

    case "stopwatch":
      return (
        <PlaceholderPanel
          title="Stopwatch"
          description="Stopwatch controls, millisecond display, and lap list will be built here."
        />
      );

    case "pomodoro":
      return (
        <PlaceholderPanel
          title="Pomodoro"
          description="Focus sessions, breaks, cycle tracking, and stats will be built here."
        />
      );

    case "alarm":
      return (
        <PlaceholderPanel
          title="Alarm System"
          description="Alarm creation, editing, snooze, dismiss, and alarm sounds will be built here."
        />
      );

    case "calendar":
      return (
        <PlaceholderPanel
          title="Local Calendar"
          description="Monthly calendar, local events, and event editing will be built here."
        />
      );

    default:
      return null;
  }
}

export function AppShell() {
  const [activeTab, setActiveTab] = useState<TabId>("clock");

  return (
    <>
      <GlowBackground />

      <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <header className="mx-auto w-full max-w-5xl">
          <div className="mb-5 text-center">
            <p className="text-sm uppercase tracking-[0.4em] text-(--accent-glow)">
              Timeglass
            </p>

            <h1 className="mt-3 text-5xl font-bold tracking-tight text-foreground sm:text-6xl">
              Time, beautifully organized.
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-sm text-(--text-muted) sm:text-base">
              A modern clock, timer, stopwatch, Pomodoro, alarm, and calendar
              app.
            </p>
          </div>

          <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
        </header>

        <section className="mx-auto w-full max-w-5xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              variants={tabVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {renderActivePanel(activeTab)}
            </motion.div>
          </AnimatePresence>
        </section>
      </main>
    </>
  );
}
```

### AppShell responsibilities

`AppShell` should:

- Render the app background
- Render the app title/header
- Store the active tab state
- Render the tab bar
- Render the selected tab panel
- Animate tab transitions
- Keep layout centered and responsive

---

## 11. Step 3.7 — Connect AppShell to Page

Update:

```txt
app/page.tsx
```

```tsx
import { AppShell } from "@/components/layout/AppShell";

export default function Home() {
  return <AppShell />;
}
```

This keeps the main page clean and moves the app logic into `AppShell`.

---

## 12. Step 3.8 — Optional Active Tab Persistence

Later, the active tab can be saved using `useLocalStorage`.

Example:

```tsx
const [activeTab, setActiveTab] = useLocalStorage<TabId>(
  STORAGE_KEYS.ACTIVE_TAB,
  "clock",
);
```

This should be added only after the LocalStorage hook is already working from Phase 2.

### Benefit

If the user closes the app on the Pomodoro tab, the app can reopen on the Pomodoro tab later.

---

## 13. Step 3.9 — Responsive Rules

The layout should follow these rules:

### Desktop

```txt
Screen width: 1024px and above
Layout: centered max-width container
Tab bar: top, full horizontal row
Main panel: max-width 900px to 1024px
```

### Tablet

```txt
Screen width: 768px to 1023px
Layout: single-column
Tab bar: scrollable if needed
Panels: full-width with comfortable padding
```

### Mobile

```txt
Screen width: below 768px
Layout: full-width
Tab bar: horizontally scrollable
Touch targets: at least 44px high
Panel padding: smaller
```

A future improvement can move the tab bar to the bottom on mobile.

---

## 14. Step 3.10 — Animation Rules

Use Framer Motion for:

- Tab transition fade and slide
- Active tab underline movement
- Glass panel entrance
- Hover effects
- Background glow movement

Recommended tab transition:

```ts
const tabVariants = {
  enter: { opacity: 0, y: 16 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -16 },
};
```

Use:

```tsx
<AnimatePresence mode="wait">
```

This makes the old tab exit before the new tab enters.

---

## 15. Step 3.11 — Reduced Motion

Animations must respect reduced motion settings.

Use:

```tsx
import { useReducedMotion } from "framer-motion";

const reduceMotion = useReducedMotion();
```

Example:

```tsx
animate={reduceMotion ? undefined : { scale: [1, 1.05, 1] }}
```

This makes the app more accessible.

---

## 16. Accessibility Rules

Phase 3 should follow these accessibility rules:

- Use real `<button>` elements for tabs
- Add `aria-label` to the navigation
- Keep text contrast high
- Do not rely only on color to show active states
- Keep touch targets large enough
- Respect reduced motion
- Avoid fast flashing animations
- Make sure keyboard users can tab through the navigation

---

## 17. What This Phase Does Not Include

This phase does not include:

- Real clock logic inside the UI
- Real countdown timer
- Real stopwatch timing
- Real Pomodoro sessions
- Real alarm CRUD
- Real calendar events
- Real timezone search
- Notification permission banner
- Keyboard shortcuts
- PWA setup
- Error boundaries
- Tests

Those parts belong to later phases.

---

## 18. Completion Checklist

Phase 3 is complete when:

- [ ] `AppShell.tsx` exists
- [ ] `TabBar.tsx` exists
- [ ] `GlowBackground.tsx` exists
- [ ] `GlassPanel.tsx` exists
- [ ] `NotificationBadge.tsx` exists
- [ ] `TABS` data exists or tab data is clearly defined
- [ ] App shows the Timeglass header
- [ ] App shows six tabs
- [ ] Clicking a tab changes the active panel
- [ ] Active tab has visible styling
- [ ] Active tab underline animates
- [ ] Tab content transitions with Framer Motion
- [ ] Background glow is visible
- [ ] Layout is centered on desktop
- [ ] Tab bar is usable on mobile widths
- [ ] Reduced motion is respected where needed
- [ ] No TypeScript errors
- [ ] No ESLint errors

---

## 19. Recommended Next Phase

After Layout & Navigation is complete, move to:

**Phase 4 — World Clock Tab**

That phase should include:

- `ClockTab`
- `AnalogClock`
- `DigitalClock`
- `TimezoneCard`
- `TimezoneSearch`
- Local timezone detection
- 12h / 24h toggle
- Saved timezone cards
