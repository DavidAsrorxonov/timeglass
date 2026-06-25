export function supportsNotifications() {
  return typeof window !== "undefined" && "Notification" in window;
}

export function supportsAudioContext() {
  if (typeof window === "undefined") {
    return false;
  }

  const audioWindow = window as Window & {
    webkitAudioContext?: typeof AudioContext;
  };

  return "AudioContext" in audioWindow || "webkitAudioContext" in audioWindow;
}

export function supportsServiceWorker() {
  return typeof navigator !== "undefined" && "serviceWorker" in navigator;
}
