"use client";

import { Bell, X } from "lucide-react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useNotifications } from "@/hooks/useNotifications";
import { BROWSER_TIMER_LIMITATION } from "@/lib/limitations";
import { STORAGE_KEYS } from "@/lib/storage-keys";

export function NotificationBanner() {
  const [dismissed, setDismissed] = useLocalStorage(
    STORAGE_KEYS.NOTIFICATION_BANNER_DISMISSED,
    false,
  );
  const { isSupported, permission, requestPermission } = useNotifications();

  if (!isSupported || permission !== "default" || dismissed) {
    return null;
  }

  return (
    <GlassPanel className="mx-auto flex max-w-5xl items-start justify-between gap-4 p-4">
      <div className="flex gap-3">
        <div className="mt-0.5 rounded-full bg-(--accent-primary)/20 p-2 text-(--accent-glow)">
          <Bell className="size-5" aria-hidden="true" />
        </div>

        <div>
          <p className="font-medium text-foreground">
            Enable notifications for timers and alarms
          </p>

          <p className="mt-1 text-sm leading-6 text-(--text-muted)">
            Timeglass can notify you when timers, Pomodoro sessions, and alarms
            finish. {BROWSER_TIMER_LIMITATION}
          </p>

          <button
            type="button"
            onClick={() => void requestPermission()}
            className="focus-ring mt-3 rounded-lg bg-(--accent-primary) px-4 py-2 text-sm font-medium text-white transition hover:bg-(--accent-glow)"
          >
            Enable Notifications
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss notification banner"
        className="focus-ring rounded-lg p-2 text-(--text-muted) transition hover:bg-white/8 hover:text-white"
      >
        <X className="size-5" aria-hidden="true" />
      </button>
    </GlassPanel>
  );
}
