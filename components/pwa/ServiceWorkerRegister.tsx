"use client";

import { useEffect } from "react";
import { supportsServiceWorker } from "@/lib/browser-support";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (!supportsServiceWorker() || process.env.NODE_ENV !== "production") {
      return;
    }

    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Service worker support is progressive enhancement for this app.
    });
  }, []);

  return null;
}
