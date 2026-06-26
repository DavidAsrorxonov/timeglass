# Timeglass Testing Checklist

Use this checklist for browser-only checks that are not fully covered by Jest.

## World Clock

- [ ] Local analog clock shows the correct time.
- [ ] Local digital clock shows the correct time.
- [ ] 12h / 24h toggle works and persists after reload.
- [ ] Timezone add, remove, and pin actions work.
- [ ] Pinned timezones appear first.
- [ ] Maximum 8 saved timezones is enforced.
- [ ] Saved timezones persist after reload.

## Notifications And Audio

- [ ] Notification banner appears when permission is default.
- [ ] Enable Notifications asks for browser permission from a user action.
- [ ] Countdown, Pomodoro, and Alarm notifications work when granted.
- [ ] App does not crash when notification permission is denied or unsupported.
- [ ] Countdown completion plays sound.
- [ ] Pomodoro completion plays sound.
- [ ] Alarm trigger, preview, snooze, and dismiss audio behavior works.
- [ ] App does not crash if Web Audio API is unavailable.

## PWA

- [ ] Manifest is available and uses the Timeglass name.
- [ ] Theme color is `#0a0a14`.
- [ ] Icons load from `public/icons`.
- [ ] Service worker registers in production.
- [ ] Basic app-shell cache works.
- [ ] Copy does not promise native alarm behavior.

## Responsive Layout

- [ ] 375px mobile has no horizontal overflow.
- [ ] 390px mobile has no horizontal overflow.
- [ ] 768px tablet layout remains usable.
- [ ] 1024px laptop layout remains usable.
- [ ] 1440px desktop layout remains usable.
- [ ] Timer rings, calendar grid, alarm modal, and stopwatch display fit.
- [ ] Touch targets are large enough.

## Accessibility

- [ ] Keyboard navigation works across all tabs.
- [ ] Focus states are visible.
- [ ] Icon-only buttons have accessible labels.
- [ ] Inputs have labels.
- [ ] Modals have close buttons.
- [ ] Disabled and active states are clear.
- [ ] Reduced motion is respected.
- [ ] Alarm ringing overlay includes visible text and actions.
- [ ] Lighthouse Accessibility score is 95 or higher.

## Browser Limitation Wording

- [ ] The app uses this wording where relevant: `Timers, Pomodoro sessions, and alarms are browser-based and work while Timeglass is open or active.`
