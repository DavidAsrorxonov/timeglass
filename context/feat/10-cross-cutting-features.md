# Timeglass — Phase 10: Cross-Cutting Features

## 1. Purpose

This document explains **Phase 10 — Cross-Cutting Features** for the **Timeglass** project.

The goal of this phase is to add shared app-level features that improve the whole application, not only one specific tab. These features connect and polish the World Clock, Countdown Timer, Stopwatch, Pomodoro, Alarm System, and Local Calendar modules.

This phase includes notification permission flow, keyboard shortcuts, responsive refinements, reduced motion support, PWA setup, basic service worker registration, accessibility improvements, and shared browser limitation handling.

---

## 2. Phase Goal

By the end of this phase, Timeglass should have:

- Notification permission banner
- Shared notification permission flow
- Global keyboard shortcuts
- Better responsive behavior
- Reduced motion support
- PWA manifest
- Basic service worker
- Service worker registration component
- Shared browser support checks
- Clear limitation notices for browser-based timers and alarms
- Improved accessibility across the app

---

## 3. Files Created in This Phase

Phase 10 should create or update these files:

```txt
components/
├── notifications/
│   └── NotificationBanner.tsx
│
├── pwa/
│   └── ServiceWorkerRegister.tsx
│
└── layout/
    ├── AppShell.tsx
    └── TabBar.tsx

hooks/
├── useKeyboardShortcuts.ts
└── useNotifications.ts

app/
├── layout.tsx
├── manifest.ts
└── globals.css

public/
└── sw.js
```

Optional files:

```txt
lib/
├── browser-support.ts
└── shortcuts.ts
```

---

## 4. Cross-Cutting Features Overview

Cross-cutting features are shared features used by multiple parts of the app.

| Feature                | Used By                              |
| ---------------------- | ------------------------------------ |
| Notifications          | Countdown, Pomodoro, Alarm           |
| Audio alerts           | Countdown, Pomodoro, Alarm           |
| Keyboard shortcuts     | Whole app                            |
| Reduced motion         | All animated components              |
| Responsive layout      | Whole app                            |
| PWA support            | Whole app                            |
| Browser support checks | Notifications, audio, service worker |

---

## 5. Step 10.1 — Notification Permission Banner

Create:

```txt
components/notifications/NotificationBanner.tsx
```

The app should not ask for notification permission automatically on page load. The user should click a button first.

Show the banner when:

```txt
Notification API is supported
permission is "default"
user has not dismissed the banner
```

Hide the banner when:

```txt
permission is granted
permission is denied
user dismisses it
```

Example implementation:

```tsx
"use client";

import { Bell, X } from "lucide-react";
import { useState } from "react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { useNotifications } from "@/hooks/useNotifications";

export function NotificationBanner() {
  const [dismissed, setDismissed] = useState(false);
  const { isSupported, permission, requestPermission } = useNotifications();

  if (!isSupported || permission !== "default" || dismissed) {
    return null;
  }

  return (
    <GlassPanel className="mx-auto flex max-w-5xl items-start justify-between gap-4 p-4">
      <div className="flex gap-3">
        <div className="rounded-full bg-(--accent-primary)/20 p-2 text-(--accent-glow)">
          <Bell size={18} />
        </div>

        <div>
          <p className="font-medium text-foreground">
            Enable notifications for timers and alarms
          </p>

          <p className="mt-1 text-sm text-(--text-muted)">
            Timeglass can notify you when timers, Pomodoro sessions, and alarms
            finish.
          </p>

          <button
            type="button"
            onClick={requestPermission}
            className="mt-3 rounded-full bg-(--accent-primary) px-4 py-2 text-sm font-medium text-white transition hover:bg-(--accent-glow)"
          >
            Enable Notifications
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss notification banner"
        className="rounded-full p-2 text-(--text-muted) transition hover:text-white"
      >
        <X size={18} />
      </button>
    </GlassPanel>
  );
}
```

---

## 6. Step 10.2 — Improve useNotifications Hook

Update:

```txt
hooks/useNotifications.ts
```

The hook should provide:

```ts
{
  (isSupported, permission, canNotify, requestPermission, sendNotification);
}
```

Rules:

- Never request permission on mount.
- Only request permission after a user action.
- If notifications are unsupported, fail safely.
- If permission is not granted, `sendNotification()` should do nothing.

---

## 7. Step 10.3 — Add NotificationBanner to AppShell

Update:

```txt
components/layout/AppShell.tsx
```

Import:

```tsx
import { NotificationBanner } from "@/components/notifications/NotificationBanner";
```

Place the banner below the tab bar and above the active tab panel:

```tsx
<TabBar activeTab={activeTab} onTabChange={setActiveTab} />
<NotificationBanner />
```

This keeps the notification prompt visible but not annoying.

---

## 8. Step 10.4 — Global Keyboard Shortcuts

Create:

```txt
hooks/useKeyboardShortcuts.ts
```

Start with tab-switching shortcuts.

| Shortcut | Action    |
| -------- | --------- |
| `1`      | Clock     |
| `2`      | Countdown |
| `3`      | Stopwatch |
| `4`      | Pomodoro  |
| `5`      | Alarm     |
| `6`      | Calendar  |

Basic implementation:

```ts
"use client";

import { useEffect } from "react";
import type { TabId } from "@/types";

const TAB_SHORTCUTS: Record<string, TabId> = {
  "1": "clock",
  "2": "countdown",
  "3": "stopwatch",
  "4": "pomodoro",
  "5": "alarm",
  "6": "calendar",
};

interface UseKeyboardShortcutsOptions {
  onTabChange: (tab: TabId) => void;
}

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  const tagName = target.tagName.toLowerCase();

  return (
    tagName === "input" ||
    tagName === "textarea" ||
    tagName === "select" ||
    target.isContentEditable
  );
}

export function useKeyboardShortcuts({
  onTabChange,
}: UseKeyboardShortcutsOptions) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (isTypingTarget(event.target)) {
        return;
      }

      const nextTab = TAB_SHORTCUTS[event.key];

      if (nextTab) {
        event.preventDefault();
        onTabChange(nextTab);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onTabChange]);
}
```

Connect it inside `AppShell`:

```tsx
useKeyboardShortcuts({
  onTabChange: setActiveTab,
});
```

---

## 9. Step 10.5 — Future Keyboard Shortcuts

After tab switching works, future shortcuts can include:

| Shortcut | Action                                |
| -------- | ------------------------------------- |
| `Space`  | Play / pause active timer-like module |
| `L`      | Lap on Stopwatch tab                  |
| `R`      | Reset active module                   |
| `Escape` | Close modal or overlay                |
| `N`      | New alarm on Alarm tab                |

These require each tab to register actions, so they can be added after the main shortcut system is stable.

---

## 10. Step 10.6 — Shortcut Hint

Add a small hint near the tab bar:

```tsx
<p className="mt-3 text-center text-xs text-(--text-muted)">
  Tip: Press 1–6 to switch tabs.
</p>
```

This helps users discover shortcuts naturally.

---

## 11. Step 10.7 — Responsive Layout Refinements

Review all tabs on desktop, tablet, and mobile.

### Desktop

```txt
Max-width container
Comfortable spacing
Top tab bar
Large panels
```

### Tablet

```txt
Single-column layouts where needed
Scrollable tab bar
Medium panel padding
```

### Mobile

```txt
Smaller padding
Buttons wrap
Tab bar scrolls horizontally
Touch targets remain large
```

Minimum touch target:

```txt
44px height
```

---

## 12. Step 10.8 — Mobile Tab Bar

The first version can keep the tab bar at the top and make it horizontally scrollable.

Add this utility to `app/globals.css`:

```css
.no-scrollbar {
  scrollbar-width: none;
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}
```

Use it in `TabBar`:

```tsx
className = "no-scrollbar overflow-x-auto";
```

A future version can move the tab bar to the bottom on mobile.

---

## 13. Step 10.9 — Reduced Motion Support

Timeglass uses many animations, so it must respect reduced motion settings.

### Framer Motion method

```tsx
import { useReducedMotion } from "framer-motion";

const reduceMotion = useReducedMotion();
```

Example:

```tsx
<motion.div animate={reduceMotion ? undefined : { scale: [1, 1.05, 1] }} />
```

### Global CSS method

Add to `app/globals.css`:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    scroll-behavior: auto !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

Check reduced motion in:

- `GlowBackground`
- Tab transitions
- `AnalogClock`
- `CountdownRing`
- `PomodoroRing`
- Alarm modal
- Ringing overlay
- Card hover animations

---

## 14. Step 10.10 — PWA Manifest

Create:

```txt
app/manifest.ts
```

Example:

```ts
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Timeglass",
    short_name: "Timeglass",
    description:
      "A modern clock, timer, stopwatch, Pomodoro, alarm, and local calendar app.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a14",
    theme_color: "#0a0a14",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
```

Required icon files:

```txt
public/icons/icon-192.png
public/icons/icon-512.png
```

Placeholder icons are acceptable in the first version.

---

## 15. Step 10.11 — Metadata and Viewport

Update:

```txt
app/layout.tsx
```

Use the Timeglass name:

```tsx
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Timeglass",
  description:
    "A modern clock, timer, stopwatch, Pomodoro, alarm, and local calendar app.",
  applicationName: "Timeglass",
};

export const viewport: Viewport = {
  themeColor: "#0a0a14",
};
```

Optional Apple web app metadata:

```tsx
export const metadata: Metadata = {
  title: "Timeglass",
  description:
    "A modern clock, timer, stopwatch, Pomodoro, alarm, and local calendar app.",
  applicationName: "Timeglass",
  appleWebApp: {
    capable: true,
    title: "Timeglass",
    statusBarStyle: "black-translucent",
  },
};
```

---

## 16. Step 10.12 — Basic Service Worker

Create:

```txt
public/sw.js
```

Basic version:

```js
const CACHE_NAME = "timeglass-app-shell-v1";

const APP_SHELL = ["/"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_SHELL);
    }),
  );

  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key)),
      );
    }),
  );

  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request);
    }),
  );
});
```

Important:

This service worker helps with app-shell caching. It does not guarantee alarms or timers while the app is closed.

---

## 17. Step 10.13 — Service Worker Registration

Create:

```txt
components/pwa/ServiceWorkerRegister.tsx
```

Example:

```tsx
"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    if (process.env.NODE_ENV !== "production") {
      return;
    }

    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Silent fail for first version.
    });
  }, []);

  return null;
}
```

Add it in `app/layout.tsx`:

```tsx
<body>
  {children}
  <ServiceWorkerRegister />
</body>
```

---

## 18. Step 10.14 — Browser Support Helpers

Optional file:

```txt
lib/browser-support.ts
```

Example:

```ts
export function supportsNotifications() {
  return typeof window !== "undefined" && "Notification" in window;
}

export function supportsAudioContext() {
  if (typeof window === "undefined") {
    return false;
  }

  return "AudioContext" in window || "webkitAudioContext" in window;
}

export function supportsServiceWorker() {
  return typeof navigator !== "undefined" && "serviceWorker" in navigator;
}
```

Use these helpers to avoid browser API crashes.

---

## 19. Step 10.15 — Shared Limitation Notice

Countdown, Pomodoro, and Alarm all share the same browser limitation.

Use this wording:

```txt
Timers, Pomodoro sessions, and alarms are browser-based and work while Timeglass is open or active.
```

This should appear where needed, especially in the Alarm tab and notification-related UI.

---

## 20. Step 10.16 — Global CSS Utilities

Add to:

```txt
app/globals.css
```

```css
.no-scrollbar {
  scrollbar-width: none;
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}

.focus-ring {
  outline: 2px solid transparent;
  outline-offset: 2px;
}

.focus-ring:focus-visible {
  outline-color: var(--accent-primary);
}
```

Use `focus-ring` on important buttons and inputs.

---

## 21. Step 10.17 — Accessibility Review

Review the whole app for accessibility.

Check:

- Buttons have text or `aria-label`
- Inputs have labels
- Keyboard navigation works
- Focus states are visible
- Reduced motion is respected
- Touch targets are large enough
- Text contrast is readable
- Modals can be closed
- Disabled states are clear
- Color is not the only status indicator

Target:

```txt
Lighthouse Accessibility score: 95+
```

---

## 22. Step 10.18 — PWA Limitations

PWA support allows Timeglass to be installed like an app.

However, it does not automatically make alarms work like native phone alarms.

Important wording:

```txt
Even when installed as a PWA, alarms are still browser/runtime-based.
```

Do not promise native alarm behavior.

---

## 23. What This Phase Does Not Include

This phase does not include:

- Final empty state illustrations
- Error boundaries
- Final favicon design
- Full offline-first caching
- Advanced service worker strategy
- Serwist integration
- Push notification server
- Background alarm execution
- Full keyboard command palette
- Final performance optimization
- Full test suite

These belong to later phases or future versions.

---

## 24. Completion Checklist

Phase 10 is complete when:

- [ ] `NotificationBanner.tsx` exists
- [ ] Notification permission is requested only after user interaction
- [ ] Notification banner appears when permission is default
- [ ] Notification banner hides after grant, deny, or dismiss
- [ ] `useNotifications.ts` is safe and reusable
- [ ] `useKeyboardShortcuts.ts` exists
- [ ] Pressing `1–6` switches tabs
- [ ] Shortcuts do not trigger while typing
- [ ] Shortcut hint is shown or documented
- [ ] Responsive layout is reviewed across all tabs
- [ ] Mobile tab bar is usable
- [ ] Touch targets are at least 44px where possible
- [ ] Reduced motion is respected
- [ ] Global reduced motion CSS exists
- [ ] `app/manifest.ts` exists
- [ ] PWA metadata uses Timeglass name
- [ ] PWA theme color matches app background
- [ ] Basic `public/sw.js` exists
- [ ] Service worker registration component exists
- [ ] Service worker only registers in production
- [ ] Browser capability checks are safe
- [ ] Shared limitation wording is added where needed
- [ ] Focus styles are visible
- [ ] No TypeScript errors
- [ ] No ESLint errors

---

## 25. Recommended Next Phase

After Cross-Cutting Features are complete, move to:

**Phase 11 — Polish & Final Details**

That phase should include:

- Final tab transition polish
- Empty states
- Favicon
- Metadata cleanup
- Error boundaries
- Performance checklist
- Lighthouse checks
- Final UI refinements
