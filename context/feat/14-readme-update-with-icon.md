# Timeglass — Phase 14: README Update with Icon

## 1. Purpose

This document updates **Phase 14 — README Update** for the **Timeglass** project.

The root `README.md` should now include all previous README directions plus a clear instruction to display the **Timeglass icon at the top**.

The README should describe Timeglass as a minimalist, Vercel-style local-first clock and productivity app.

---

## 2. Target File

Update the root file:

```txt
README.md
```

If it does not exist yet, create it:

```bash
touch README.md
```

---

## 3. Icon Requirement

The README should display the **Timeglass icon at the very top**, before the project title.

Recommended icon path:

```txt
public/icons/timeglass-icon.svg
```

Recommended README top section:

```md
<p align="center">
  <img src="./public/icons/timeglass-icon.svg" alt="Timeglass icon" width="96" height="96" />
</p>

<h1 align="center">Timeglass</h1>

<p align="center">
  A minimalist local-first clock and productivity app.
</p>

<p align="center">
  World Clock · Countdown Timer · Stopwatch · Pomodoro · Alarm System · Local Calendar
</p>
```

---

## 4. Recommended Timeglass Icon File

Create this file:

```txt
public/icons/timeglass-icon.svg
```

Use this minimalist black-and-white hourglass icon:

```svg
<svg width="96" height="96" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="96" height="96" rx="22" fill="black"/>
  <path d="M32 22H64" stroke="white" stroke-width="5" stroke-linecap="round"/>
  <path d="M32 74H64" stroke="white" stroke-width="5" stroke-linecap="round"/>
  <path d="M36 22C36 36 60 36 60 48C60 60 36 60 36 74" stroke="white" stroke-width="5" stroke-linecap="round"/>
  <path d="M60 22C60 36 36 36 36 48C36 60 60 60 60 74" stroke="white" stroke-width="5" stroke-linecap="round"/>
  <circle cx="48" cy="48" r="4" fill="white"/>
</svg>
```

The icon should match the new Vercel-style theme:

- Black background
- White mark
- Minimal hourglass shape
- Rounded square
- No purple glow
- No colorful gradients

---

## 5. Full README Template

Use this as the updated root `README.md`.

```md
<p align="center">
  <img src="./public/icons/timeglass-icon.svg" alt="Timeglass icon" width="96" height="96" />
</p>

<h1 align="center">Timeglass</h1>

<p align="center">
  A minimalist local-first clock and productivity app.
</p>

<p align="center">
  World Clock · Countdown Timer · Stopwatch · Pomodoro · Alarm System · Local Calendar
</p>

---

## Overview

Timeglass is a modern local-first clock and productivity app built with **Next.js**, **TypeScript**, **Tailwind CSS**, and **Framer Motion**.

It combines a world clock, countdown timer, stopwatch, Pomodoro timer, alarm system, and local calendar into one clean minimalist workspace.

The design follows a **Vercel-inspired black, white, and neutral gray theme** using OKLCH CSS variables.

---

## Features

### World Clock

- Local analog clock
- Local digital clock
- 12-hour / 24-hour format toggle
- Saved timezone cards
- Add, remove, and pin timezones
- LocalStorage persistence

### Countdown Timer

- Custom hour, minute, and second input
- Quick preset buttons
- Circular progress ring
- Start, pause, resume, and reset controls
- Completion sound
- Browser notification support

### Stopwatch

- High-precision stopwatch display
- Start, stop, resume, and reset controls
- Lap recording
- Best and worst lap highlighting
- Copy laps to clipboard

### Pomodoro

- Classic 25-minute focus sessions
- 5-minute short breaks
- 15-minute long break after 4 sessions
- Session indicators
- Completed Pomodoro stats
- Focus minutes tracking
- Streak tracking

### Alarm System

- Create, edit, and delete alarms
- Enable and disable alarms
- Repeat day selection
- Alarm label
- Sound selection and preview
- Snooze and dismiss actions
- Full-screen ringing overlay

### Local Calendar

- Monthly calendar grid
- Previous / next month navigation
- Today shortcut
- Selected day events
- Add, edit, and delete local events
- Event colors
- LocalStorage persistence

---

## Tech Stack

- **Framework:** Next.js
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Animation:** Framer Motion
- **Icons:** Lucide React
- **Storage:** LocalStorage
- **Audio:** Web Audio API
- **Notifications:** Browser Notifications API
- **PWA:** Web Manifest and basic service worker

---

## Design System

Timeglass uses a minimalist Vercel-style design direction.

The theme is based on:

- Black and white contrast
- Neutral gray surfaces
- Simple borders
- Subtle shadows
- Small radius
- Clean typography
- Minimal color usage

The previous purple glassmorphism style has been replaced with a cleaner product-style interface.

---

## Timeglass Icon

The README displays the Timeglass icon at the top.

Recommended icon path:

```txt
public/icons/timeglass-icon.svg
```

The icon should follow the same minimalist black-and-white visual style as the app.

---

## Browser APIs

| API | Used For |
|-----|----------|
| LocalStorage | Saving timezones, alarms, calendar events, Pomodoro stats, and preferences |
| Web Audio API | Timer, Pomodoro, and alarm sounds |
| Notifications API | Timer, Pomodoro, and alarm notifications |
| Clipboard API | Copying stopwatch laps |
| Service Worker | Basic PWA support |
| Intl API | Time and date formatting |

---

## Browser Limitations

Timeglass is a browser-based app.

Timers, Pomodoro sessions, and alarms are browser-based and work while Timeglass is open or active.

This means alarms and timers are not guaranteed if:

- The browser is closed
- The tab is killed
- The device is turned off
- The operating system suspends the browser
- Browser notification or audio permission is blocked

Timeglass does not provide native OS-level alarms.

---

## Project Structure

```txt
app/
├── layout.tsx
├── page.tsx
├── globals.css
├── manifest.ts
├── error.tsx
└── not-found.tsx

components/
├── layout/
├── ui/
├── clock/
├── countdown/
├── stopwatch/
├── pomodoro/
├── alarm/
├── calendar/
├── notifications/
├── pwa/
└── error/

hooks/
├── useLocalStorage.ts
├── useClock.ts
├── useTimer.ts
├── useStopwatch.ts
├── usePomodoro.ts
├── useAlarms.ts
├── useCalendar.ts
├── useNotifications.ts
└── useKeyboardShortcuts.ts

lib/
├── storage-keys.ts
├── audio.ts
├── timezones.ts
└── browser-support.ts

types/
└── index.ts

public/
├── favicon.svg
├── sw.js
└── icons/
    ├── timeglass-icon.svg
    ├── icon-192.png
    └── icon-512.png
```

---

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open the app:

```txt
http://localhost:3000
```

---

## Available Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run test
```

Optional TypeScript check:

```bash
npx tsc --noEmit
```

---

## LocalStorage Data

Recommended storage keys:

```ts
timeglass:active-tab
timeglass:timezones
timeglass:clock-format
timeglass:alarms
timeglass:calendar-events
timeglass:pomodoro-stats
timeglass:notification-permission
```

---

## Development Phases

1. Project Scaffold
2. Core Infrastructure
3. Layout & Navigation
4. World Clock Tab
5. Countdown Timer Tab
6. Stopwatch Tab
7. Pomodoro Tab
8. Alarm System Tab
9. Local Calendar Tab
10. Cross-Cutting Features
11. Polish & Final Details
12. Testing
13. Theme Change to Minimal Vercel Style
14. README Update

---

## Future Improvements

- Custom timer presets
- Custom Pomodoro durations
- Alarm sound uploads
- Calendar reminders
- Recurring calendar events
- External calendar sync
- Cloud sync
- User accounts
- Native mobile version
- Advanced PWA caching
- Full offline-first support
- Command palette
- More keyboard shortcuts

---

## License

This project is currently for learning and personal development.

A license can be added later if the project becomes public.
```

---

## 6. README Acceptance Checklist

The README update is complete when:

- [ ] Root `README.md` exists
- [ ] Project name is Timeglass
- [ ] Timeglass icon appears at the top
- [ ] Icon file exists at `public/icons/timeglass-icon.svg`
- [ ] Overview explains the app clearly
- [ ] All six main features are listed
- [ ] Tech stack is included
- [ ] Design system mentions the Vercel-style theme
- [ ] Browser APIs are listed
- [ ] Browser limitations are clearly explained
- [ ] Project structure includes icon files
- [ ] Getting Started commands are included
- [ ] Available scripts are included
- [ ] LocalStorage keys are documented
- [ ] Development phases are listed
- [ ] Old purple/glassmorphism description is removed
- [ ] No outdated project name remains

---

## 7. Recommended Next Step

After this document is complete:

1. Create the icon file:

```txt
public/icons/timeglass-icon.svg
```

2. Update the actual root file:

```txt
README.md
```

3. Run:

```bash
npm run lint
npx tsc --noEmit
npm run build
```
