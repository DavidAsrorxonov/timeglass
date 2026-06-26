# Timeglass — Phase 13: Theme Change to Minimal Vercel Style

## 1. Purpose

This document explains **Phase 13 — Theme Change** for the **Timeglass** project.

The current UI direction is purple-based, with glassmorphism, glow effects, violet accents, and animated gradient backgrounds. The new direction should be **minimalist and Vercel-inspired**, using the black, white, and neutral gray OKLCH palette pasted from tweakcn.com.

This phase changes the UI/theme only. It does not change app logic.

---

## 2. New Design Direction

The new Timeglass UI should feel:

- Minimal
- Clean
- Sharp
- Neutral
- Product-like
- Vercel-inspired
- Mostly black, white, and gray
- Less glowing
- Less colorful
- Less glassmorphism

Remove or reduce:

- Purple glow
- Violet gradients
- Neon shadows
- Heavy glass panels
- Large colorful shadows
- Decorative animated backgrounds

Use more:

- `bg-background`
- `text-foreground`
- `bg-card`
- `border-border`
- `text-muted-foreground`
- `bg-primary`
- `text-primary-foreground`
- `rounded-md` / `rounded-lg`
- `shadow-sm`

---

## 3. Main Palette Source

Use the OKLCH palette pasted by the user from tweakcn.com.

The palette includes:

- Light mode variables in `:root`
- Dark mode variables in `.dark`
- Tailwind v4 `@theme inline` mappings
- Neutral background, card, border, input, ring, and muted colors
- Geist font variables
- Small border radius
- Subtle shadow tokens

---

## 4. Main Theme Migration Idea

Old Timeglass variables were purple/glass focused:

```css
--bg-base
--text-primary
--text-muted
--accent-primary
--accent-glow
--accent-danger
--accent-success
```

New Vercel-style variables should be used instead:

```css
--background
--foreground
--card
--card-foreground
--primary
--primary-foreground
--secondary
--secondary-foreground
--muted
--muted-foreground
--accent
--accent-foreground
--destructive
--destructive-foreground
--border
--input
--ring
```

The goal is to move all components to Tailwind classes like:

```tsx
bg - background;
text - foreground;
bg - card;
text - card - foreground;
border - border;
text - muted - foreground;
bg - primary;
text - primary - foreground;
bg - destructive;
text - destructive - foreground;
```

---

## 5. Files Affected

Update these files first:

```txt
app/globals.css
components/ui/GlassPanel.tsx
components/layout/GlowBackground.tsx
components/layout/AppShell.tsx
components/layout/TabBar.tsx
components/ui/CircularProgress.tsx
```

Then update feature components:

```txt
components/clock/*
components/countdown/*
components/stopwatch/*
components/pomodoro/*
components/alarm/*
components/calendar/*
components/notifications/*
```

---

## 6. Step 13.1 — Replace globals.css

Update:

```txt
app/globals.css
```

Use this palette as the base theme.

```css
@import "tailwindcss";

@custom-variant dark (&:is(.dark *));

:root {
  --background: oklch(0.99 0 0);
  --foreground: oklch(0 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0 0 0);
  --popover: oklch(0.99 0 0);
  --popover-foreground: oklch(0 0 0);
  --primary: oklch(0 0 0);
  --primary-foreground: oklch(1 0 0);
  --secondary: oklch(0.94 0 0);
  --secondary-foreground: oklch(0 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.44 0 0);
  --accent: oklch(0.94 0 0);
  --accent-foreground: oklch(0 0 0);
  --destructive: oklch(0.63 0.19 23.03);
  --destructive-foreground: oklch(1 0 0);
  --border: oklch(0.92 0 0);
  --input: oklch(0.94 0 0);
  --ring: oklch(0 0 0);
  --chart-1: oklch(0.81 0.17 75.35);
  --chart-2: oklch(0.55 0.22 264.53);
  --chart-3: oklch(0.72 0 0);
  --chart-4: oklch(0.92 0 0);
  --chart-5: oklch(0.56 0 0);
  --sidebar: oklch(0.99 0 0);
  --sidebar-foreground: oklch(0 0 0);
  --sidebar-primary: oklch(0 0 0);
  --sidebar-primary-foreground: oklch(1 0 0);
  --sidebar-accent: oklch(0.94 0 0);
  --sidebar-accent-foreground: oklch(0 0 0);
  --sidebar-border: oklch(0.94 0 0);
  --sidebar-ring: oklch(0 0 0);
  --font-sans: Geist, sans-serif;
  --font-serif: Georgia, serif;
  --font-mono: Geist Mono, monospace;
  --radius: 0.5rem;
  --shadow-2xs: 0px 1px 2px 0px hsl(0 0% 0% / 0.09);
  --shadow-xs: 0px 1px 2px 0px hsl(0 0% 0% / 0.09);
  --shadow-sm:
    0px 1px 2px 0px hsl(0 0% 0% / 0.18), 0px 1px 2px -1px hsl(0 0% 0% / 0.18);
  --shadow:
    0px 1px 2px 0px hsl(0 0% 0% / 0.18), 0px 1px 2px -1px hsl(0 0% 0% / 0.18);
  --shadow-md:
    0px 1px 2px 0px hsl(0 0% 0% / 0.18), 0px 2px 4px -1px hsl(0 0% 0% / 0.18);
  --shadow-lg:
    0px 1px 2px 0px hsl(0 0% 0% / 0.18), 0px 4px 6px -1px hsl(0 0% 0% / 0.18);
  --shadow-xl:
    0px 1px 2px 0px hsl(0 0% 0% / 0.18), 0px 8px 10px -1px hsl(0 0% 0% / 0.18);
  --shadow-2xl: 0px 1px 2px 0px hsl(0 0% 0% / 0.45);
}

.dark {
  --background: oklch(0 0 0);
  --foreground: oklch(1 0 0);
  --card: oklch(0.14 0 0);
  --card-foreground: oklch(1 0 0);
  --popover: oklch(0.18 0 0);
  --popover-foreground: oklch(1 0 0);
  --primary: oklch(1 0 0);
  --primary-foreground: oklch(0 0 0);
  --secondary: oklch(0.25 0 0);
  --secondary-foreground: oklch(1 0 0);
  --muted: oklch(0.23 0 0);
  --muted-foreground: oklch(0.72 0 0);
  --accent: oklch(0.32 0 0);
  --accent-foreground: oklch(1 0 0);
  --destructive: oklch(0.69 0.2 23.91);
  --destructive-foreground: oklch(0 0 0);
  --border: oklch(0.26 0 0);
  --input: oklch(0.32 0 0);
  --ring: oklch(0.72 0 0);
  --chart-1: oklch(0.81 0.17 75.35);
  --chart-2: oklch(0.58 0.21 260.84);
  --chart-3: oklch(0.56 0 0);
  --chart-4: oklch(0.44 0 0);
  --chart-5: oklch(0.92 0 0);
  --sidebar: oklch(0.18 0 0);
  --sidebar-foreground: oklch(1 0 0);
  --sidebar-primary: oklch(1 0 0);
  --sidebar-primary-foreground: oklch(0 0 0);
  --sidebar-accent: oklch(0.32 0 0);
  --sidebar-accent-foreground: oklch(1 0 0);
  --sidebar-border: oklch(0.32 0 0);
  --sidebar-ring: oklch(0.72 0 0);
}
```

Then keep the `@theme inline` mapping from the pasted palette.

Base layer:

```css
@layer base {
  * {
    @apply border-border outline-ring/50;
  }

  body {
    @apply bg-background text-foreground font-sans;
  }
}
```

---

## 7. Step 13.2 — Add Compatibility Variables

To avoid breaking existing components immediately, add these compatibility variables to both `:root` and `.dark`.

```css
:root {
  --bg-base: var(--background);
  --text-primary: var(--foreground);
  --text-muted: var(--muted-foreground);
  --accent-primary: var(--primary);
  --accent-glow: var(--foreground);
  --accent-danger: var(--destructive);
  --accent-success: var(--chart-1);
}

.dark {
  --bg-base: var(--background);
  --text-primary: var(--foreground);
  --text-muted: var(--muted-foreground);
  --accent-primary: var(--primary);
  --accent-glow: var(--foreground);
  --accent-danger: var(--destructive);
  --accent-success: var(--chart-1);
}
```

This allows old code using `var(--accent-primary)` or `var(--text-primary)` to keep working while you migrate components.

---

## 8. Step 13.3 — Replace GlassPanel with Minimal Card

Update:

```txt
components/ui/GlassPanel.tsx
```

Keep the name `GlassPanel` for now so imports do not break, but change its visual style.

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
}: GlassPanelProps) {
  return (
    <motion.div
      className={`rounded-lg border border-border bg-card text-card-foreground shadow-sm ${className}`}
      whileHover={hover ? { y: -1 } : undefined}
      transition={{ duration: 0.18, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
```

Important:

- Keep the `glow` prop for compatibility.
- Do not use it visually anymore.
- Remove glass blur, violet glow, and large shadows.

---

## 9. Step 13.4 — Simplify GlowBackground

Update:

```txt
components/layout/GlowBackground.tsx
```

Recommended minimal version:

```tsx
export function GlowBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 bg-background" />
  );
}
```

Optional Vercel-style grid:

```tsx
export function GlowBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 bg-background">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-size-[48px_48px] opacity-30" />
    </div>
  );
}
```

Do not keep the old purple radial gradients.

---

## 10. Step 13.5 — Update AppShell Header

Use a cleaner header.

```tsx
<header className="mx-auto w-full max-w-5xl">
  <div className="mb-6">
    <p className="text-sm font-medium text-muted-foreground">Timeglass</p>

    <h1 className="mt-2 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
      Time, organized simply.
    </h1>

    <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
      Clock, timer, stopwatch, Pomodoro, alarms, and calendar in one focused
      workspace.
    </p>
  </div>

  <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
</header>
```

Remove:

- Purple subtitle text
- Large neon title glow
- Extra decorative background text

---

## 11. Step 13.6 — Update TabBar

The tab bar should look like a minimal segmented control.

Container:

```tsx
<nav
  aria-label="Timeglass modules"
  className="flex w-full gap-1 overflow-x-auto rounded-lg border border-border bg-card p-1 shadow-sm"
>
```

Tab button:

```tsx
className={`relative flex min-w-24 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm transition ${
  isActive
    ? "bg-primary text-primary-foreground"
    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
}`}
```

Remove the purple underline indicator. The active tab background is enough.

---

## 12. Step 13.7 — Replace Old Purple Variables

Search for:

```txt
--accent-primary
--accent-glow
--text-primary
--text-muted
--bg-base
rgba(124,107,255
purple
violet
```

Replacement guide:

| Old                                    | New                       |
| -------------------------------------- | ------------------------- |
| `text-[var(--text-primary)]`           | `text-foreground`         |
| `text-[var(--text-muted)]`             | `text-muted-foreground`   |
| `bg-[var(--bg-base)]`                  | `bg-background`           |
| `bg-[var(--accent-primary)]`           | `bg-primary`              |
| `text-[var(--accent-glow)]`            | `text-muted-foreground`   |
| `border-[var(--accent-primary)]`       | `border-primary`          |
| `hover:border-[var(--accent-primary)]` | `hover:border-foreground` |
| `text-[var(--accent-danger)]`          | `text-destructive`        |
| `bg-[var(--accent-danger)]`            | `bg-destructive`          |

---

## 13. Step 13.8 — Button Styles

Use three button styles.

### Primary button

Use for main actions:

```txt
Start, Save, Add, New Alarm, Enable Notifications
```

```tsx
className =
  "rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90";
```

### Secondary button

Use for neutral actions:

```txt
Reset, Cancel, Edit, Today
```

```tsx
className =
  "rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm transition hover:bg-accent";
```

### Destructive button

Use for destructive actions:

```txt
Delete, Dismiss, Clear
```

```tsx
className =
  "rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground shadow-sm transition hover:opacity-90";
```

---

## 14. Step 13.9 — Input Styles

Use minimal input styling.

Normal input:

```tsx
className =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring";
```

Large timer input:

```tsx
className =
  "w-full rounded-md border border-input bg-background px-3 py-4 text-center font-mono text-3xl text-foreground shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";
```

Remove:

- `glass-panel` on inputs
- `border-white/10`
- Transparent glowing input backgrounds

---

## 15. Step 13.10 — Progress Rings

Update:

```txt
components/ui/CircularProgress.tsx
```

New color logic:

```ts
const color = success
  ? "var(--chart-1)"
  : danger
    ? "var(--destructive)"
    : "var(--primary)";
```

Remove heavy glow effects:

```tsx
style={{
  rotate: -90,
  transformOrigin: "50% 50%",
}}
```

Avoid:

```txt
drop-shadow
purple glow
neon ring shadows
```

---

## 16. Step 13.11 — Analog Clock

The analog clock should become cleaner.

Use:

```tsx
fill = "var(--card)";
stroke = "var(--border)";
```

Hands:

```tsx
stroke = "var(--foreground)";
```

Muted ticks:

```tsx
stroke = "var(--muted-foreground)";
```

Second hand:

```tsx
stroke = "var(--primary)";
```

Remove:

- `secondHandGlow`
- Violet glow
- Large drop shadows

---

## 17. Step 13.12 — Cards

Use this card style:

```tsx
className =
  "rounded-lg border border-border bg-card p-5 text-card-foreground shadow-sm";
```

Hover:

```tsx
className = "hover:bg-accent/50";
```

Avoid:

```txt
backdrop-blur
bg-white/[0.03]
border-white/10
shadow-[0_0_24px]
rounded-3xl
```

---

## 18. Step 13.13 — Modals

Use a neutral modal style.

Overlay:

```tsx
className =
  "fixed inset-0 z-50 flex items-end bg-background/80 p-4 backdrop-blur-sm sm:items-center sm:justify-center";
```

Modal card:

```tsx
className =
  "w-full max-w-xl rounded-lg border border-border bg-card p-5 text-card-foreground shadow-lg";
```

---

## 19. Step 13.14 — Notification Banner

Use a minimal notice style.

```tsx
className =
  "rounded-lg border border-border bg-card p-4 text-card-foreground shadow-sm";
```

Icon container:

```tsx
className =
  "rounded-md border border-border bg-muted p-2 text-muted-foreground";
```

Button:

```tsx
className =
  "rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground";
```

---

## 20. Step 13.15 — Dark Mode Behavior

Dark mode should be simple and high contrast.

Expected dark mode:

```txt
Background: black
Cards: dark gray
Text: white
Borders: neutral dark gray
Primary button: white
Primary button text: black
```

Do not bring purple back in dark mode.

---

## 21. Step 13.16 — Typography

Use Geist-style typography.

Recommended:

```txt
Headings: font-semibold tracking-tight
Body: text-sm or text-base
Labels: text-sm font-medium
Muted text: text-muted-foreground
Timer numbers: font-mono
```

Avoid overusing:

```txt
uppercase labels
wide tracking
neon-style text
```

---

## 22. Step 13.17 — Radius and Shadows

Use smaller radius and subtle shadows.

| Element | Radius       |
| ------- | ------------ |
| Buttons | `rounded-md` |
| Cards   | `rounded-lg` |
| Inputs  | `rounded-md` |
| Modals  | `rounded-lg` |
| Badges  | `rounded-md` |

Use:

```txt
shadow-sm
shadow-md only when needed
```

Avoid:

```txt
shadow-[0_0_24px]
drop-shadow-2xl
large glow effects
```

---

## 23. Step 13.18 — Migration Order

Apply the theme change in this order:

1. Replace `app/globals.css`
2. Add compatibility variables
3. Update `GlassPanel.tsx`
4. Simplify `GlowBackground.tsx`
5. Update `AppShell.tsx`
6. Update `TabBar.tsx`
7. Update buttons
8. Update inputs
9. Update progress rings
10. Update analog clock
11. Update cards in each tab
12. Update modals
13. Remove remaining purple styles
14. Test light mode
15. Test dark mode

---

## 24. Search Checklist

Run these searches:

```bash
grep -R "accent-primary" .
grep -R "accent-glow" .
grep -R "bg-base" .
grep -R "text-primary" .
grep -R "text-muted" .
grep -R "124,107,255" .
grep -R "purple" .
grep -R "violet" .
grep -R "glass-panel" .
grep -R "backdrop-blur" .
```

Replace old purple/glass styles with the new neutral theme classes.

---

## 25. Testing the Theme Change

Run:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

Then manually test:

- Light mode
- Dark mode
- World Clock
- Countdown Timer
- Stopwatch
- Pomodoro
- Alarm System
- Local Calendar
- Notification banner
- Modals
- Inputs
- Buttons
- Progress rings
- Mobile layout
- Tablet layout
- Desktop layout

---

## 26. Visual Acceptance Checklist

The theme change is complete when:

- [ ] Purple glow is removed
- [ ] Background is neutral
- [ ] Cards use `bg-card`
- [ ] Text uses `text-foreground`
- [ ] Muted text uses `text-muted-foreground`
- [ ] Primary buttons use `bg-primary`
- [ ] Borders use `border-border`
- [ ] Inputs use `border-input`
- [ ] Progress rings use neutral primary color
- [ ] Dark mode is black/white based
- [ ] Light mode is white/black based
- [ ] Glassmorphism is replaced with minimal cards
- [ ] Heavy shadows are removed
- [ ] Border radius is smaller
- [ ] UI feels closer to Vercel than neon/glass
- [ ] No TypeScript errors
- [ ] No ESLint errors
- [ ] Production build succeeds

---

## 27. Important Design Rule

The new Timeglass design should not look colorful.

Use color only for:

- Destructive actions
- Success states
- Small chart or progress accents if needed

The main UI should mostly be:

```txt
black
white
neutral gray
simple borders
subtle shadows
```

---

## 28. Recommended Next Step

After this document, start applying the theme in this exact order:

1. `app/globals.css`
2. `components/ui/GlassPanel.tsx`
3. `components/layout/GlowBackground.tsx`
4. `components/layout/AppShell.tsx`
5. `components/layout/TabBar.tsx`
6. Shared button styles
7. Shared input styles
8. Feature components one by one
