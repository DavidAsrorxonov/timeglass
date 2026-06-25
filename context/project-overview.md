# Timeglass — Project Overview

## 1. Project Overview

**Timeglass** is a premium single-page web application for managing time-related tasks in one unified interface. The app combines a world clock, countdown timer, stopwatch, Pomodoro timer, alarm system, and local calendar into one modern productivity tool.

The project uses a dark glassmorphism design style with frosted panels, soft glowing effects, smooth animations, and a desktop-first responsive layout. The application is designed to feel elegant, focused, and easy to use while still offering multiple practical time-management features.

Timeglass will be built with:

- **Next.js 16**
- **TypeScript**
- **Tailwind CSS v4**
- **Framer Motion**
- **LocalStorage**
- **Web Audio API**
- **Browser Notifications API**

The app will store user data locally in the browser using LocalStorage. This means users can keep their saved alarms, calendar events, timezone cards, Pomodoro statistics, and preferences without needing an account or external database.

---

## 2. Project Goals

The main goal of Timeglass is to create a modern all-in-one time management web app that is visually attractive, useful, and simple to operate.

### Core Goals

1. **Build a unified time-management app**

   Timeglass should combine several common time tools into one single-page app instead of forcing users to use separate apps for clocks, timers, alarms, and calendars.

2. **Create a premium visual experience**

   The app should use a consistent glassmorphism design system with a dark background, frosted cards, violet accent colors, glowing elements, and smooth Framer Motion animations.

3. **Support useful daily productivity features**

   Timeglass should help users with everyday tasks such as checking different time zones, timing study sessions, using Pomodoro focus cycles, setting alarms, tracking stopwatch laps, and saving simple local calendar events.

4. **Keep the app simple and local-first**

   The app should work without user accounts, cloud sync, or external calendar integrations. All user data should be saved locally in the browser.

5. **Make the interface responsive**

   The app should be desktop-first but still usable on tablets and mobile devices. Layouts should adjust smoothly across different screen sizes.

6. **Use reusable and maintainable code**

   The project should be organized with reusable components, shared hooks, clear TypeScript types, and a clean folder structure so that future development is easier.

---

## 3. Project Scope

Timeglass will include six main modules.

### 3.1 World Clock

The World Clock module will display the user's local time using both analog and digital clock views. It will also allow users to add multiple timezone cards.

Main features:

- Analog clock
- Digital clock
- 12-hour / 24-hour toggle
- Auto-detection of user's local timezone
- Add, pin, and remove timezone cards
- Timezone cards with live time display
- LocalStorage persistence for saved timezones

---

### 3.2 Countdown Timer

The Countdown Timer module will allow users to set a custom countdown duration and start, pause, resume, or reset it.

Main features:

- Hour, minute, and second input
- Quick presets such as 5m, 10m, 15m, 30m, and 1h
- Circular progress ring
- Remaining time display
- Start, pause, resume, and reset controls
- Completion sound using Web Audio API
- Browser notification when permission is granted

---

### 3.3 Stopwatch

The Stopwatch module will provide precise timing with lap tracking.

Main features:

- Start, stop, and reset
- Millisecond-precision display
- Lap recording
- Best and worst lap highlighting
- Scrollable lap list
- Copy lap data to clipboard

---

### 3.4 Pomodoro Timer

The Pomodoro module will support the classic 25-minute focus and 5-minute break workflow.

Main features:

- 25-minute focus sessions
- 5-minute short breaks
- Long break prompt after 4 focus sessions
- Auto-transition between focus and break phases
- Circular progress ring
- Pomodoro session counter
- Daily statistics and streak tracking
- LocalStorage persistence for Pomodoro stats

---

### 3.5 Alarm System

The Alarm System module will allow users to create and manage local browser-based alarms.

Main features:

- Create, edit, delete, and toggle alarms
- Alarm labels
- Day-of-week selection
- Multiple alarm sound options
- Dismiss and snooze actions
- Full-screen alarm ringing overlay
- Browser notification support
- LocalStorage persistence

Important limitation:

Alarms are browser-based and local-only. They are expected to work while the app is open or active, but they should not be treated as guaranteed operating-system-level alarms when the browser or device is closed.

---

### 3.6 Local Calendar

The Local Calendar module will provide a simple calendar for saving local events.

Main features:

- Monthly calendar grid
- Previous and next month navigation
- Today highlight
- Event dots on days with saved events
- Add, edit, and delete local events
- Optional event time
- Event color selection
- LocalStorage persistence

Important limitation:

This calendar is local-only. It will not sync with Google Calendar, Apple Calendar, Outlook, or other external calendar services.

---

## 4. Out of Scope

The following features are not included in the current project scope:

- User authentication
- Cloud database
- Account system
- Google Calendar / Apple Calendar / Outlook sync
- Server-side alarm scheduling
- Mobile native app version
- Team collaboration features
- Advanced analytics dashboard
- Backend API
- Paid subscription system

These features can be considered in future versions, but they are not part of the first build.

---

## 5. Technical Scope

The first version of Timeglass will be a frontend-only web application.

### Included

- Next.js App Router
- TypeScript types and interfaces
- Tailwind CSS v4 design tokens
- Framer Motion animations
- LocalStorage data persistence
- Web Audio API for alarm and timer sounds
- Browser Notifications API
- Responsive layout
- PWA manifest
- Basic service worker support
- Unit and integration tests for important hooks and features

### Not Included

- External database
- Server backend
- Authentication
- Push notifications from a server
- Native mobile notifications
- Real-time sync between devices

---

## 6. Target Users

Timeglass is intended for users who want a beautiful and practical time-management dashboard in their browser.

Possible users include:

- Students
- Developers
- Remote workers
- Freelancers
- People working with multiple time zones
- People who use Pomodoro study or work sessions
- Users who want a simple local calendar and alarm tool

---

## 7. Success Criteria

The project can be considered successful when:

- All six main modules work correctly.
- The app has a consistent glassmorphism design.
- User data persists after page reload using LocalStorage.
- Timers, stopwatch, Pomodoro, alarms, and calendar functions work without major bugs.
- Audio alerts play correctly while the app is running.
- Browser notifications work after permission is granted.
- The layout works on desktop, tablet, and mobile screens.
- The app has no TypeScript or ESLint errors.
- The app feels smooth, polished, and easy to use.

---

## 8. Summary

Timeglass is a modern time-management web app that combines clock, timer, stopwatch, Pomodoro, alarm, and calendar features into one elegant interface. The project focuses on clean design, local-first storage, useful productivity tools, and smooth user experience.

The first version should remain focused, frontend-only, and practical. Future versions can expand into cloud sync, user accounts, external calendar integration, and more advanced productivity features.
