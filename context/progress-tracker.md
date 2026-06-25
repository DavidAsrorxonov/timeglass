# Timeglass — Progress Tracker

## Project Status

**Project Name:** Timeglass  
**Current Stage:** Planning / Documentation  
**Last Updated:** 2026-06-25  
**Main Stack:** Next.js 16, TypeScript, Tailwind CSS v4, Framer Motion, LocalStorage, Web Audio API, Browser Notifications API

---

## Purpose of This File

This file tracks the progress of the Timeglass project.

It should be updated whenever a meaningful change is made to the project, such as:

- New files created
- Features completed
- Bugs fixed
- Design decisions changed
- Technical decisions updated
- Project scope changed
- Features moved from planned to in progress or completed

The goal is to keep a clear record of:

1. What has been done so far
2. What is currently in progress
3. What should be done next
4. What changed over time

---

## Progress Summary

### Completed So Far

| Date       | Item                          | Summary                                                                                                                                                       | Status    |
| ---------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| 2026-06-25 | Original build plan reviewed  | The original Markdown build plan was reviewed and understood as a full AI-agent roadmap for a clock, timer, alarm, stopwatch, Pomodoro, and calendar web app. | Completed |
| 2026-06-25 | Project renamed               | The project name was changed from the original concept name to **Timeglass**.                                                                                 | Completed |
| 2026-06-25 | Project structure analyzed    | The original build plan was separated conceptually into 12 phases and 5 larger development chunks.                                                            | Completed |
| 2026-06-25 | `project-overview.md` created | A dedicated project overview document was created with overview, goals, scope, out-of-scope items, target users, and success criteria.                        | Completed |
| 2026-06-25 | `progress-tracker.md` created | This progress tracker file was created to record completed work, current progress, next steps, and change history.                                            | Completed |

---

## Currently In Progress

| Item                     | Description                                                                                     | Current Status |
| ------------------------ | ----------------------------------------------------------------------------------------------- | -------------- |
| Project documentation    | Core documentation files are being created before development starts.                           | In Progress    |
| Planning file separation | The large original build plan is being separated into smaller, easier-to-manage Markdown files. | In Progress    |
| Development roadmap      | The project needs a clear step-by-step roadmap that can guide the actual coding process.        | In Progress    |

---

## Next Steps

### Immediate Next Steps

| Priority | Task                               | Description                                                                                               | Status      |
| -------- | ---------------------------------- | --------------------------------------------------------------------------------------------------------- | ----------- |
| High     | Create `design-system.md`          | Document colors, fonts, glassmorphism tokens, spacing, animations, and reusable UI rules.                 | Not Started |
| High     | Create `technical-architecture.md` | Document folder structure, main technologies, shared hooks, LocalStorage usage, audio, and notifications. | Not Started |
| High     | Create `features.md`               | Document all six main modules: World Clock, Countdown, Stopwatch, Pomodoro, Alarm, and Calendar.          | Not Started |
| Medium   | Create `build-roadmap.md`          | Convert the 12 phases into a practical coding order with milestones.                                      | Not Started |
| Medium   | Create `testing-checklist.md`      | Prepare a testing checklist for hooks, UI behavior, LocalStorage, notifications, and responsiveness.      | Not Started |

---

## Feature Progress

| Feature / Area         | Planned | In Progress | Completed | Notes                                                |
| ---------------------- | ------- | ----------- | --------- | ---------------------------------------------------- |
| Project Overview       | Yes     | No          | Yes       | `project-overview.md` created                        |
| Progress Tracking      | Yes     | No          | Yes       | `progress-tracker.md` created                        |
| Design System          | Yes     | No          | No        | Needs separate documentation                         |
| Technical Architecture | Yes     | No          | No        | Needs separate documentation                         |
| App Scaffold           | Yes     | No          | No        | Next.js project not created yet                      |
| Layout & Navigation    | Yes     | No          | No        | AppShell, TabBar, GlowBackground, GlassPanel planned |
| World Clock            | Yes     | No          | No        | Analog clock, digital clock, timezone cards planned  |
| Countdown Timer        | Yes     | No          | No        | Timer input, presets, progress ring planned          |
| Stopwatch              | Yes     | No          | No        | Laps, best/worst lap, copy laps planned              |
| Pomodoro               | Yes     | No          | No        | 25/5 cycle, stats, streak planned                    |
| Alarm System           | Yes     | No          | No        | Local browser-based alarms planned                   |
| Local Calendar         | Yes     | No          | No        | LocalStorage calendar events planned                 |
| Notifications          | Yes     | No          | No        | Browser Notifications API planned                    |
| Audio Alerts           | Yes     | No          | No        | Web Audio API planned                                |
| PWA Support            | Yes     | No          | No        | Manifest and basic service worker planned            |
| Testing                | Yes     | No          | No        | Unit and integration tests planned                   |

---

## Change Log

### 2026-06-25

#### Added

- Created the project name: **Timeglass**
- Created `project-overview.md`
- Created `progress-tracker.md`
- Added project status section
- Added completed work summary
- Added current progress section
- Added next steps section
- Added feature progress table
- Added change log section
- Added decision log section
- Added notes section

#### Changed

- The project identity changed from the original clock app concept to **Timeglass**.
- The original large build plan is now being separated into smaller project documents.

#### Not Started Yet

- Actual Next.js project setup
- Component implementation
- Hook implementation
- Styling implementation
- Testing setup
- Deployment setup

---

## Decision Log

| Date       | Decision                                 | Reason                                                                                                 |
| ---------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| 2026-06-25 | Project name set to **Timeglass**        | The name matches the time-focused concept and gives the app a more unique identity.                    |
| 2026-06-25 | Use separate Markdown files for planning | Smaller files are easier to manage than one large build plan.                                          |
| 2026-06-25 | Keep first version frontend-only         | The original scope uses LocalStorage only and does not require authentication, backend, or cloud sync. |
| 2026-06-25 | Keep alarms browser-based                | The first version uses Web Audio API and browser notifications, not operating-system-level alarms.     |
| 2026-06-25 | Keep calendar local-only                 | The first version does not include Google Calendar, Apple Calendar, or Outlook sync.                   |

---

## Open Questions

These questions should be answered before or during development:

1. Should the app use the name **Timeglass** everywhere, including metadata and PWA manifest?
2. Should the first version include only dark mode, or should light mode be added later?
3. Should the app use default Google Fonts through `next/font/google`, or should it use system fonts first?
4. Should the alarm sound patterns be simple at first, then improved later?
5. Should PWA support be added during the first build or after the main app works?
6. Should the project include tests from the beginning or after the main features are implemented?

---

## Current Project Phase

The project is currently in the **documentation and planning phase**.

No actual application code has been created yet.

The next recommended step is to create the following documentation files:

1. `design-system.md`
2. `technical-architecture.md`
3. `features.md`
4. `build-roadmap.md`
5. `testing-checklist.md`

After these files are ready, the Next.js project scaffold can be created.

---

## How to Update This File

Whenever progress is made, update these sections:

1. **Progress Summary** — add completed work
2. **Currently In Progress** — update active tasks
3. **Next Steps** — move finished tasks out and add new ones
4. **Feature Progress** — change statuses from planned to in progress or completed
5. **Change Log** — write what was added, changed, fixed, or removed
6. **Decision Log** — record important project decisions

Use this format for new change log entries:

```md
### YYYY-MM-DD

#### Added

- New feature, file, or section added

#### Changed

- Existing feature, file, or decision changed

#### Fixed

- Bug or issue fixed

#### Removed

- Removed feature, file, or old decision
```

---

## Short Status

**Done:** Project overview and progress tracker created  
**In Progress:** Planning documentation  
**Next:** Design system, technical architecture, features document, roadmap, and testing checklist
