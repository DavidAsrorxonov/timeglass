"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

export function useNotifications() {
  const isSupported =
    typeof window !== "undefined" && "Notification" in window;

  const [permission, setPermission] =
    useState<NotificationPermission>("default");

  useEffect(() => {
    if (!isSupported) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setPermission(Notification.permission);
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isSupported]);

  const requestPermission = useCallback(async () => {
    if (!isSupported) {
      setPermission("denied");
      return "denied" as NotificationPermission;
    }

    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  }, [isSupported]);

  const sendNotification = useCallback(
    (title: string, options?: NotificationOptions) => {
      if (!isSupported || Notification.permission !== "granted") {
        return null;
      }

      return new Notification(title, options);
    },
    [isSupported],
  );

  const canNotify = useMemo(() => {
    return isSupported && permission === "granted";
  }, [isSupported, permission]);

  return {
    isSupported,
    permission,
    canNotify,
    requestPermission,
    sendNotification,
  };
}
