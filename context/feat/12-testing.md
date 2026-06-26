# Timeglass — Phase 12: Testing

## 1. Purpose

This document explains **Phase 12 — Testing** for the **Timeglass** project.

The goal of this phase is to verify that the full app works correctly before final delivery. Testing should cover all major features, shared hooks, LocalStorage persistence, browser notifications, audio alerts, responsive layout, accessibility, PWA behavior, and known browser limitations.

This is the final phase of the Timeglass build plan.

---

## 2. Phase Goal

By the end of this phase, Timeglass should have:

- Unit tests for important hooks and utilities
- Integration tests for main feature flows
- Manual testing checklists for browser APIs
- Responsive layout checks
- Accessibility checks
- PWA checks
- Final delivery verification
- A clear pass/fail checklist before the project is marked complete

---

## 3. Testing Scope

| Area              | Test Type                 |
| ----------------- | ------------------------- |
| `useLocalStorage` | Unit test                 |
| `useTimer`        | Unit test                 |
| `useStopwatch`    | Unit test                 |
| `usePomodoro`     | Unit test                 |
| `useAlarms`       | Unit + integration test   |
| `useCalendar`     | Unit + integration test   |
| Countdown Timer   | Integration + manual test |
| Stopwatch         | Integration + manual test |
| Pomodoro          | Integration + manual test |
| Alarm System      | Integration + manual test |
| Local Calendar    | Integration + manual test |
| World Clock       | Manual + integration test |
| Notifications     | Mocked + manual test      |
| Audio             | Mocked + manual test      |
| PWA               | Manual test               |
| Responsive UI     | Manual test               |
| Accessibility     | Manual + Lighthouse test  |

---

## 4. Files Created or Updated in This Phase

```txt
__tests__/
├── hooks/
│   ├── useLocalStorage.test.ts
│   ├── useTimer.test.ts
│   ├── useStopwatch.test.ts
│   ├── usePomodoro.test.ts
│   ├── useAlarms.test.ts
│   └── useCalendar.test.ts
│
├── components/
│   ├── countdown.test.tsx
│   ├── stopwatch.test.tsx
│   ├── pomodoro.test.tsx
│   ├── alarm.test.tsx
│   └── calendar.test.tsx
│
└── integration/
    ├── countdown-flow.test.tsx
    ├── alarm-flow.test.tsx
    └── calendar-flow.test.tsx

jest.config.ts
jest.setup.ts
package.json
```

Optional later:

```txt
e2e/
└── timeglass.spec.ts
```

---

## 5. Step 12.1 — Install Testing Packages

Install the basic testing tools:

```bash
npm install -D jest jest-environment-jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom
```

For a Next.js project, use `next/jest` in the Jest config.

---

## 6. Step 12.2 — Jest Configuration

Create:

```txt
jest.config.ts
```

```ts
import nextJest from "next/jest";

const createJestConfig = nextJest({
  dir: "./",
});

const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testEnvironment: "jest-environment-jsdom",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
};

export default createJestConfig(customJestConfig);
```

Create:

```txt
jest.setup.ts
```

```ts
import "@testing-library/jest-dom";
```

Update `package.json`:

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

---

## 7. Step 12.3 — Mock Browser APIs

Timeglass uses browser APIs that need to be mocked during tests.

Important APIs:

- `localStorage`
- `Notification`
- `AudioContext`
- `requestAnimationFrame`
- `cancelAnimationFrame`
- `navigator.clipboard`

Example `jest.setup.ts` additions:

```ts
Object.defineProperty(window, "Notification", {
  writable: true,
  value: class MockNotification {
    static permission = "granted";
    static requestPermission = jest.fn(() => Promise.resolve("granted"));

    constructor(
      public title: string,
      public options?: NotificationOptions,
    ) {}
  },
});

Object.defineProperty(navigator, "clipboard", {
  writable: true,
  value: {
    writeText: jest.fn(),
  },
});
```

For Web Audio API:

```ts
class MockAudioContext {
  state = "running";
  currentTime = 0;
  resume = jest.fn();

  createOscillator = jest.fn(() => ({
    type: "sine",
    frequency: { setValueAtTime: jest.fn() },
    connect: jest.fn(),
    start: jest.fn(),
    stop: jest.fn(),
    onended: null,
  }));

  createGain = jest.fn(() => ({
    gain: {
      setValueAtTime: jest.fn(),
      exponentialRampToValueAtTime: jest.fn(),
    },
    connect: jest.fn(),
  }));

  destination = {};
}

Object.defineProperty(window, "AudioContext", {
  writable: true,
  value: MockAudioContext,
});
```

---

## 8. Step 12.4 — Unit Test: useLocalStorage

Test file:

```txt
__tests__/hooks/useLocalStorage.test.ts
```

Test cases:

- Returns default value when LocalStorage is empty
- Saves value to LocalStorage
- Updates value
- Removes value
- Handles broken JSON safely
- Does not crash in restricted browser environments
- Syncs correctly when storage changes

Example:

```ts
import { renderHook, act } from "@testing-library/react";
import { useLocalStorage } from "@/hooks/useLocalStorage";

describe("useLocalStorage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("returns default value when storage is empty", () => {
    const { result } = renderHook(() => useLocalStorage("test-key", "default"));

    expect(result.current[0]).toBe("default");
  });

  it("saves a value", () => {
    const { result } = renderHook(() => useLocalStorage("test-key", "default"));

    act(() => {
      result.current[1]("updated");
    });

    expect(result.current[0]).toBe("updated");
    expect(window.localStorage.getItem("test-key")).toBe('"updated"');
  });
});
```

---

## 9. Step 12.5 — Unit Test: useTimer

Test file:

```txt
__tests__/hooks/useTimer.test.ts
```

Test cases:

- Starts from a duration
- Changes status to `running`
- Pauses correctly
- Resumes correctly
- Resets correctly
- Reaches `done`
- Calls `onComplete`
- Does not call `onComplete` multiple times
- Calculates progress correctly

Use fake timers where needed:

```ts
jest.useFakeTimers();
```

Expected behavior:

| Action | Expected Result            |
| ------ | -------------------------- |
| Start  | `status` becomes `running` |
| Pause  | `status` becomes `paused`  |
| Resume | `status` becomes `running` |
| Reset  | `status` becomes `idle`    |
| Finish | `status` becomes `done`    |

---

## 10. Step 12.6 — Unit Test: useStopwatch

Test file:

```txt
__tests__/hooks/useStopwatch.test.ts
```

Test cases:

- Starts stopwatch
- Stops stopwatch
- Resumes stopwatch
- Resets stopwatch
- Records lap only while running
- Calculates lap time correctly
- Calculates total time correctly
- Finds best lap
- Finds worst lap
- Does not highlight best/worst when only one lap exists

---

## 11. Step 12.7 — Unit Test: usePomodoro

Test file:

```txt
__tests__/hooks/usePomodoro.test.ts
```

Test cases:

- Starts focus phase
- Completes focus phase
- Moves to break phase
- Completes break phase
- Moves back to focus phase
- Adds completed Pomodoro count
- Adds 25 focus minutes
- Updates streak
- Uses long break after 4 focus sessions
- Reset clears current session but does not clear stats

---

## 12. Step 12.8 — Unit Test: useAlarms

Test file:

```txt
__tests__/hooks/useAlarms.test.ts
```

Test cases:

- Adds alarm
- Updates alarm
- Deletes alarm
- Enables and disables alarm
- Matches current time
- Matches current day
- Does not trigger disabled alarm
- Does not trigger on wrong day
- Does not trigger repeatedly in the same minute
- Snooze sets a future time
- Dismiss clears active alarm
- Sound is played when alarm triggers
- Notification is attempted when permission is granted

---

## 13. Step 12.9 — Unit Test: useCalendar

Test file:

```txt
__tests__/hooks/useCalendar.test.ts
```

Test cases:

- Adds event
- Updates event
- Deletes event
- Gets events for selected date
- Sorts timed events by time
- Places untimed events after timed events
- Creates event date keys
- Persists events in LocalStorage

---

## 14. Step 12.10 — Countdown Integration Test

Test file:

```txt
__tests__/integration/countdown-flow.test.tsx
```

User flow:

1. Render Countdown tab
2. Enter duration
3. Click Start
4. Timer starts
5. Click Pause
6. Timer pauses
7. Click Resume
8. Timer resumes
9. Click Reset
10. Timer returns to idle

Completion flow:

1. Start a short timer
2. Advance time
3. Timer reaches zero
4. Done state appears
5. Sound is triggered
6. Notification is attempted if permission is granted

---

## 15. Step 12.11 — Alarm Integration Test

Test file:

```txt
__tests__/integration/alarm-flow.test.tsx
```

User flow:

1. Render Alarm tab
2. Click New Alarm
3. Choose time
4. Add label
5. Select repeat days
6. Select sound
7. Save alarm
8. Alarm appears in list
9. Toggle alarm
10. Edit alarm
11. Delete alarm

Ringing flow:

1. Mock current time
2. Add enabled matching alarm
3. Alarm triggers
4. Ringing overlay appears
5. Snooze works
6. Dismiss works

---

## 16. Step 12.12 — Calendar Integration Test

Test file:

```txt
__tests__/integration/calendar-flow.test.tsx
```

User flow:

1. Render Calendar tab
2. Select a date
3. Click Add
4. Enter event title
5. Enter optional time
6. Select color
7. Save event
8. Event appears
9. Calendar day shows event dot
10. Edit event
11. Delete event
12. Empty state appears

---

## 17. Step 12.13 — World Clock Manual Tests

Manual checks:

- Local analog clock shows correct time
- Local digital clock shows correct time
- 12h / 24h toggle works
- Clock format persists after reload
- Timezone cards show live time
- Add timezone works
- Remove timezone works
- Pin timezone works
- Pinned timezones appear first
- Maximum 8 timezones is enforced
- Empty state appears when no timezones exist
- Timezones persist after reload

---

## 18. Step 12.14 — Notification Manual Tests

Manual checks:

- Notification banner appears when permission is default
- Clicking Enable Notifications asks permission
- Banner disappears after permission decision
- Countdown completion sends notification when granted
- Pomodoro completion sends notification when granted
- Alarm trigger sends notification when granted
- App does not crash if permission is denied
- App does not crash if Notification API is unsupported

---

## 19. Step 12.15 — Audio Manual Tests

Manual checks:

- Countdown completion plays sound
- Pomodoro completion plays sound
- Alarm trigger plays selected sound
- Alarm sound preview works
- Dismiss stops sound
- Snooze stops sound
- Reset stops active timer sound
- Sounds do not overlap too aggressively
- App does not crash if Web Audio API is unavailable

---

## 20. Step 12.16 — PWA Manual Tests

Manual checks:

- Manifest exists
- App name is Timeglass
- Theme color is `#0a0a14`
- Icons are available
- App can be installed where supported
- Service worker registers in production
- Basic app shell cache works
- PWA text does not promise native alarm behavior

Important reminder:

PWA support does not make alarms work like native phone alarms.

---

## 21. Step 12.17 — Responsive Manual Tests

Test these viewport sizes:

```txt
375px mobile
390px mobile
768px tablet
1024px laptop
1440px desktop
```

Check:

- No horizontal overflow
- Tab bar is usable
- Buttons do not overlap
- Timer rings fit screen
- Calendar grid fits screen
- Alarm modal fits screen
- Stopwatch display does not overflow
- Text remains readable
- Touch targets are large enough
- Panels have good padding

---

## 22. Step 12.18 — Accessibility Manual Tests

Check:

- Keyboard navigation works
- Focus states are visible
- Icon-only buttons have `aria-label`
- Inputs have labels
- Modals have close buttons
- Disabled buttons are clear
- Active states are not color-only
- Reduced motion is respected
- Alarm ringing overlay includes visible text
- Text contrast is readable

Target:

```txt
Lighthouse Accessibility: 95+
```

---

## 23. Step 12.19 — Browser Limitation Wording Check

Verify this wording appears where needed:

```txt
Timers, Pomodoro sessions, and alarms are browser-based and work while Timeglass is open or active.
```

Avoid this kind of wording:

```txt
Guaranteed alarms when the browser is closed.
```

This is important because Timeglass uses a frontend-only browser runtime.

---

## 24. Step 12.20 — Final Build Checks

Run:

```bash
npx tsc --noEmit
npm run lint
npm run test
npm run build
```

Expected results:

- TypeScript passes
- ESLint passes
- Tests pass
- Production build succeeds

If tests are not fully implemented yet, at minimum run:

```bash
npx tsc --noEmit
npm run lint
npm run build
```

---

## 25. Coverage Goals

Recommended coverage priorities:

| Area               | Priority        |
| ------------------ | --------------- |
| Hooks              | High            |
| Utilities          | High            |
| Feature flows      | Medium          |
| UI-only components | Medium          |
| Browser APIs       | Mocked + manual |

Important hooks:

- `useLocalStorage`
- `useTimer`
- `useStopwatch`
- `usePomodoro`
- `useAlarms`
- `useCalendar`

---

## 26. Final Delivery Checklist

Before marking Timeglass complete, verify:

- [ ] All 6 tabs render without errors
- [ ] World Clock works
- [ ] Countdown Timer works
- [ ] Stopwatch works
- [ ] Pomodoro works
- [ ] Alarm System works while app is open or active
- [ ] Local Calendar works
- [ ] LocalStorage persists saved data
- [ ] Audio alerts work
- [ ] Browser notifications work after permission is granted
- [ ] Responsive layout works
- [ ] Reduced motion is respected
- [ ] PWA manifest exists
- [ ] Basic service worker exists
- [ ] Metadata uses Timeglass
- [ ] Favicon exists
- [ ] Error boundaries exist
- [ ] Empty states exist
- [ ] TypeScript passes
- [ ] ESLint passes
- [ ] Tests pass
- [ ] Production build succeeds

---

## 27. What This Phase Does Not Include

This phase does not include:

- Adding new major features
- Rebuilding the UI
- Adding backend APIs
- Adding cloud sync
- Adding user accounts
- Adding native mobile alarms
- Adding external calendar sync

Testing should verify the current project scope, not expand it.

---

## 28. Completion Checklist

Phase 12 is complete when:

- [ ] Testing packages are installed
- [ ] Jest is configured
- [ ] Test setup file exists
- [ ] Browser APIs are mocked where needed
- [ ] `useLocalStorage` tests exist
- [ ] `useTimer` tests exist
- [ ] `useStopwatch` tests exist
- [ ] `usePomodoro` tests exist
- [ ] `useAlarms` tests exist
- [ ] `useCalendar` tests exist
- [ ] Countdown integration test exists
- [ ] Alarm integration test exists
- [ ] Calendar integration test exists
- [ ] World Clock manual tests are completed
- [ ] Notification manual tests are completed
- [ ] Audio manual tests are completed
- [ ] PWA manual tests are completed
- [ ] Responsive manual tests are completed
- [ ] Accessibility manual tests are completed
- [ ] Browser limitation wording is verified
- [ ] `npx tsc --noEmit` passes
- [ ] `npm run lint` passes
- [ ] `npm run test` passes
- [ ] `npm run build` passes

---

## 29. Final Project Status

After Phase 12, the full Timeglass planning sequence is complete.

The project documentation now covers:

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

The next step is to start implementing the app in the recommended build order.
