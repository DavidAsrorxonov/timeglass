# Timeglass — Phase 14: README Update

## 1. Purpose

This document explains **Phase 14 — README Update** for the **Timeglass** project.

The goal of this phase is to update the root `README.md` so it matches the final project direction. The README should describe Timeglass as a minimalist, local-first time management app with a Vercel-inspired black/white theme.

This phase does not change application logic. It updates project documentation.

---

## 2. Target File

Update the root project file:

```txt
README.md
```

If the project does not have one yet, create it:

```bash
touch README.md
```

---

## 3. README Goals

The README should clearly explain:

- What Timeglass is
- What features it includes
- What tech stack it uses
- What design system it follows
- What browser APIs it uses
- How to install and run the project
- What data is stored in LocalStorage
- What browser limitations exist
- What phases were planned
- What future improvements can be added

---

## 4. Required Project Description

Use this description near the top of the README:

```txt
Timeglass is a modern local-first clock and productivity app built with Next.js, TypeScript, Tailwind CSS, and Framer Motion.

It combines a world clock, countdown timer, stopwatch, Pomodoro timer, alarm system, and local calendar into one clean minimalist workspace.
```

Also mention the new UI direction:

```txt
The design follows a Vercel-inspired black, white, and neutral gray theme using OKLCH CSS variables.
```

---

## 5. Important Browser Limitation Text

The README must clearly explain that Timeglass is browser-based.

Use this wording:

```txt
Timers, Pomodoro sessions, and alarms are browser-based and work while Timeglass is open or active.
```

Do not say:

```txt
Alarms are guaranteed even when the browser is closed.
```

That would be misleading because this is not a native OS-level alarm app.

---

## 6. Recommended README Structure

Use this structure for the root `README.md`:

```txt
# Timeglass

## Overview
## Features
## Tech Stack
## Design System
## Browser APIs
## Browser Limitations
## Project Structure
## Getting Started
## Available Scripts
## LocalStorage Data
## Development Phases
## Future Improvements
## License
```

---

## 7. Full README Template

Copy this into the root `README.md` and adjust later if needed.

````md
# Timeglass

Timeglass is a modern local-first clock and productivity app built with **Next.js**, **TypeScript**, **Tailwind CSS**, and **Framer Motion**.

It combines a world clock, countdown timer, stopwatch, Pomodoro timer, alarm system, and local calendar into one clean minimalist workspace.

The design follows a **Vercel-inspired black, white, and neutral gray theme** using OKLCH CSS variables.

---

## Overview

Timeglass is designed as a single-page productivity app for managing time-related tools in one place.

It is frontend-only and stores user data locally in the browser using LocalStorage.

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

The app uses OKLCH CSS variables for light and dark mode.

Main theme tokens include:

```css
--background
--foreground
--card
--card-foreground
--primary
--primary-foreground
--secondary
--muted
--muted-foreground
--border
--input
--ring
--destructive
```
````

The previous purple glassmorphism style has been replaced with a cleaner product-style interface.

---

## Browser APIs

Timeglass uses browser APIs for local app behavior.

| API               | Used For                                                                   |
| ----------------- | -------------------------------------------------------------------------- |
| LocalStorage      | Saving timezones, alarms, calendar events, Pomodoro stats, and preferences |
| Web Audio API     | Timer, Pomodoro, and alarm sounds                                          |
| Notifications API | Timer, Pomodoro, and alarm notifications                                   |
| Clipboard API     | Copying stopwatch laps                                                     |
| Service Worker    | Basic PWA support                                                          |
| Intl API          | Time and date formatting                                                   |

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

Recommended structure:

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

Timeglass stores data locally in the browser.

Recommended storage keys:

```ts
timeglass: active - tab;
timeglass: timezones;
timeglass: clock - format;
timeglass: alarms;
timeglass: calendar - events;
timeglass: pomodoro - stats;
timeglass: notification - permission;
```

Data stored in LocalStorage can be cleared if the user clears browser data.

---

## Development Phases

The project was planned in the following phases:

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

Possible future improvements:

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

````

---

## 8. Step 14.1 — Update Project Name

Make sure the README uses:

```txt
Timeglass
````

Avoid old names like:

```txt
Next Generation Clock & Timer
Nextgen Clock
Clock App
```

The old name can appear only if explaining project history.

---

## 9. Step 14.2 — Update Theme Description

The README should describe the new theme as:

```txt
Vercel-inspired black, white, and neutral gray theme
```

Do not describe the final design as:

```txt
purple glassmorphism
neon clock app
violet glow dashboard
```

Those belong to the old theme direction.

---

## 10. Step 14.3 — Update Feature List

The README should include all six main modules:

```txt
World Clock
Countdown Timer
Stopwatch
Pomodoro
Alarm System
Local Calendar
```

Do not leave out the Local Calendar or Alarm System.

---

## 11. Step 14.4 — Update Browser Limitation Section

This is important because the project includes alarms.

Use clear wording:

```txt
Timers, Pomodoro sessions, and alarms are browser-based and work while Timeglass is open or active.
```

Explain that the app does not provide native OS-level alarms.

---

## 12. Step 14.5 — Update Development Phases

The README should list all current planning phases:

```txt
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
```

---

## 13. README Acceptance Checklist

The README update is complete when:

- [ ] Root `README.md` exists
- [ ] Project name is Timeglass
- [ ] Overview explains the app clearly
- [ ] All six main features are listed
- [ ] Tech stack is included
- [ ] Design system mentions the Vercel-style theme
- [ ] Browser APIs are listed
- [ ] Browser limitations are clearly explained
- [ ] Project structure is shown
- [ ] Getting Started commands are included
- [ ] Available scripts are included
- [ ] LocalStorage keys are documented
- [ ] Development phases are listed
- [ ] Future improvements are included
- [ ] Old purple/glassmorphism description is removed
- [ ] No outdated project name remains

---

## 14. Recommended Next Step

After this document is complete, update the actual root file:

```txt
README.md
```

Then run:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

The README itself does not affect the build, but running these commands confirms the project is still healthy after any related edits.
