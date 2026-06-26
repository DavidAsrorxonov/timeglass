"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import { supportsNotifications } from "@/lib/browser-support";

function subscribeToNotificationSupport(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const timeoutId = window.setTimeout(onStoreChange, 0);

  return () => {
    window.clearTimeout(timeoutId);
  };
}

function getNotificationSupportSnapshot() {
  return supportsNotifications();
}

function getNotificationSupportServerSnapshot() {
  return false;
}

export function useNotifications() {
  const isSupported = useSyncExternalStore(
    subscribeToNotificationSupport,
    getNotificationSupportSnapshot,
    getNotificationSupportServerSnapshot,
  );
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
