# Timeglass — Phase 1: Project Scaffold

## 1. Purpose

This document explains the first build phase of the **Timeglass** project: creating the initial project scaffold.

The goal of this phase is to set up the basic Next.js project, install required dependencies, prepare global styles, configure fonts, and create the main folder structure before building the actual app features.

This phase does not include building the full World Clock, Timer, Stopwatch, Pomodoro, Alarm, or Calendar modules yet. It only prepares the foundation that those features will use later.

---

## 2. Phase Goal

By the end of this phase, the project should have:

- A working Next.js 16 project
- TypeScript enabled
- Tailwind CSS v4 installed and ready
- ESLint enabled
- Framer Motion installed
- Lucide icons installed
- Day.js installed
- Global styles prepared
- Font setup planned
- Design tokens added
- Main project folders created
- A clean base layout ready for future components

---

## 3. Tech Stack for the Scaffold

The project scaffold uses:

| Tool            | Purpose                 |
| --------------- | ----------------------- |
| Next.js 16      | Main React framework    |
| TypeScript      | Type-safe development   |
| Tailwind CSS v4 | Styling system          |
| Framer Motion   | Animations              |
| Lucide React    | Icons                   |
| Day.js          | Date and time utilities |
| ESLint          | Code quality checking   |
| next/font       | Optimized font loading  |

---

## 4. Step 1.1 — Initialize the Project

Run the following commands:

```bash
npx create-next-app@latest timeglass \
  --typescript \
  --tailwind \
  --eslint \
  --app

cd timeglass
```

This creates a new Next.js App Router project named **timeglass**.

The generated project should include:

```txt
app/
public/
package.json
tsconfig.json
next.config.ts
eslint.config.mjs
postcss.config.mjs
```

---

## 5. Step 1.2 — Install Required Packages

Install the main project dependencies:

```bash
npm install framer-motion lucide-react dayjs
```

Install Node.js type definitions:

```bash
npm install -D @types/node
```

### Package Purposes

| Package       | Use                                                     |
| ------------- | ------------------------------------------------------- |
| framer-motion | Smooth tab transitions, hover animations, clock effects |
| lucide-react  | Icons for tabs, buttons, alarms, calendar, settings     |
| dayjs         | Easier date and time formatting                         |
| @types/node   | TypeScript support for Node.js types                    |

---

## 6. Step 1.3 — Tailwind CSS v4 Setup

Tailwind CSS v4 uses a CSS-first setup.

Most design tokens should be placed inside:

```txt
app/globals.css
```

A separate `tailwind.config.ts` file is only needed if the generated project or extra tooling requires it.

The main design values should include:

```css
:root {
  --bg-base: #0a0a14;
  --glass-fill: rgba(255, 255, 255, 0.06);
  --glass-border: rgba(255, 255, 255, 0.12);
  --accent-primary: #7c6bff;
  --accent-glow: #a78bfa;
  --accent-danger: #f87171;
  --accent-success: #34d399;
  --text-primary: #f1f5f9;
  --text-muted: #64748b;
}
```

These variables will become the base design system for the whole app.

---

## 7. Step 1.4 — Global Styles

Update `app/globals.css` with the basic global style foundation.

Recommended global styles:

```css
@import "tailwindcss";

:root {
  --bg-base: #0a0a14;
  --glass-fill: rgba(255, 255, 255, 0.06);
  --glass-border: rgba(255, 255, 255, 0.12);
  --accent-primary: #7c6bff;
  --accent-glow: #a78bfa;
  --accent-danger: #f87171;
  --accent-success: #34d399;
  --text-primary: #f1f5f9;
  --text-muted: #64748b;
}

* {
  box-sizing: border-box;
}

html {
  background: var(--bg-base);
}

body {
  min-height: 100vh;
  margin: 0;
  background:
    radial-gradient(
      circle at top left,
      rgba(124, 107, 255, 0.18),
      transparent 32rem
    ),
    radial-gradient(
      circle at bottom right,
      rgba(59, 130, 246, 0.12),
      transparent 34rem
    ),
    var(--bg-base);
  color: var(--text-primary);
}

::selection {
  background: var(--accent-primary);
  color: white;
}

.glass-panel {
  background: var(--glass-fill);
  backdrop-filter: blur(24px) saturate(180%);
  border: 1px solid var(--glass-border);
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

@keyframes pulse-glow {
  0%,
  100% {
    opacity: 0.65;
    transform: scale(1);
  }

  50% {
    opacity: 1;
    transform: scale(1.05);
  }
}
```

---

## 8. Step 1.5 — Font Setup

The original design uses three fonts:

| Font           | Purpose                                        |
| -------------- | ---------------------------------------------- |
| Bebas Neue     | Large clock digits                             |
| Inter          | General UI text                                |
| JetBrains Mono | Timer, stopwatch, and precise numeric displays |

Use `next/font/google` inside `app/layout.tsx`.

Example:

```tsx
import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Timeglass",
  description:
    "A modern clock, timer, alarm, stopwatch, Pomodoro, and calendar app.",
};

export const viewport: Viewport = {
  themeColor: "#0a0a14",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${bebasNeue.variable} ${inter.variable} ${jetBrainsMono.variable}`}
      >
        {children}
      </body>
    </html>
  );
}
```

Then the fonts can be used later through CSS variables.

Example:

```css
.font-display {
  font-family: var(--font-display), sans-serif;
}

.font-body {
  font-family: var(--font-body), sans-serif;
}

.font-mono {
  font-family: var(--font-mono), monospace;
}
```

---

## 9. Step 1.6 — Create Folder Structure

Create this folder structure:

```txt
app/
├── layout.tsx
├── page.tsx
└── globals.css

components/
├── layout/
│   ├── AppShell.tsx
│   ├── TabBar.tsx
│   └── GlowBackground.tsx
│
├── clock/
│   ├── ClockTab.tsx
│   ├── AnalogClock.tsx
│   ├── DigitalClock.tsx
│   ├── TimezoneCard.tsx
│   └── TimezoneSearch.tsx
│
├── countdown/
│   ├── CountdownTab.tsx
│   ├── CountdownInput.tsx
│   └── CountdownRing.tsx
│
├── stopwatch/
│   ├── StopwatchTab.tsx
│   └── LapList.tsx
│
├── pomodoro/
│   ├── PomodoroTab.tsx
│   └── PomodoroRing.tsx
│
├── alarm/
│   ├── AlarmTab.tsx
│   ├── AlarmCard.tsx
│   └── AlarmModal.tsx
│
├── calendar/
│   ├── CalendarTab.tsx
│   ├── MiniCalendar.tsx
│   └── EventList.tsx
│
└── ui/
    ├── GlassPanel.tsx
    ├── IconButton.tsx
    ├── CircularProgress.tsx
    └── NotificationBadge.tsx

hooks/
├── useClock.ts
├── useTimer.ts
├── useStopwatch.ts
├── useAlarms.ts
├── usePomodoro.ts
├── useLocalStorage.ts
└── useNotifications.ts

lib/
├── audio.ts
├── timezones.ts
└── storage-keys.ts

types/
└── index.ts
```

---

## 10. Step 1.7 — Create Basic App Entry

Update `app/page.tsx` to render the future app shell.

```tsx
import { AppShell } from "@/components/layout/AppShell";

export default function Home() {
  return <AppShell />;
}
```

At this phase, `AppShell` can be a placeholder.

Example:

```tsx
export function AppShell() {
  return (
    <main className="min-h-screen px-6 py-8">
      <section className="glass-panel mx-auto max-w-5xl p-8">
        <h1 className="text-4xl font-bold">Timeglass</h1>
        <p className="mt-2 text-slate-400">
          Clock, timer, stopwatch, Pomodoro, alarm, and calendar in one app.
        </p>
      </section>
    </main>
  );
}
```

---

## 11. Step 1.8 — Path Alias

Make sure the project supports the `@/` alias.

Check `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

This allows imports like:

```tsx
import { AppShell } from "@/components/layout/AppShell";
```

---

## 12. Step 1.9 — First Verification Commands

After the scaffold is ready, run:

```bash
npm run dev
```

Then open:

```txt
http://localhost:3000
```

Also check TypeScript and linting:

```bash
npx tsc --noEmit
npm run lint
```

---

## 13. Files Created in This Phase

By the end of Phase 1, the project should have these important files:

```txt
app/layout.tsx
app/page.tsx
app/globals.css
components/layout/AppShell.tsx
components/layout/TabBar.tsx
components/layout/GlowBackground.tsx
components/ui/GlassPanel.tsx
hooks/
lib/
types/index.ts
```

Some feature files can be created as empty placeholders now, or created later when each feature phase starts.

---

## 14. What This Phase Does Not Include

This phase does not include:

- Full tab switching logic
- Real analog clock
- Real digital clock
- Countdown timer logic
- Stopwatch logic
- Pomodoro logic
- Alarm CRUD
- Calendar event management
- LocalStorage hook implementation
- Notification hook implementation
- Web Audio API implementation
- Tests

Those parts belong to later phases.

---

## 15. Completion Checklist

Phase 1 is complete when:

- [ ] Next.js project is created
- [ ] Project name is `timeglass`
- [ ] TypeScript is enabled
- [ ] Tailwind CSS v4 is available
- [ ] ESLint is available
- [ ] `framer-motion`, `lucide-react`, and `dayjs` are installed
- [ ] `app/globals.css` contains base design variables
- [ ] Glassmorphism utility class exists
- [ ] Fonts are configured in `app/layout.tsx`
- [ ] Metadata uses the Timeglass name
- [ ] Main folders are created
- [ ] `app/page.tsx` renders a basic `AppShell`
- [ ] App runs with `npm run dev`
- [ ] TypeScript check passes
- [ ] ESLint check passes

---

## 16. Recommended Next Phase

After this scaffold is complete, move to:

**Phase 2 — Core Infrastructure**

That phase should include:

- Shared TypeScript types
- LocalStorage hook
- Notification hook
- Audio manager
- Clock hook
- Storage key constants
