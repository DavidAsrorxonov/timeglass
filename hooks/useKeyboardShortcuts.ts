"use client";

import { useEffect } from "react";
import { TAB_SHORTCUTS } from "@/lib/shortcuts";
import type { TabId } from "@/types";

type UseKeyboardShortcutsOptions = {
  onTabChange: (tab: TabId) => void;
};

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
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
        return;
      }

      if (isTypingTarget(event.target)) {
        return;
      }

      const nextTab = TAB_SHORTCUTS[event.key];

      if (!nextTab) {
        return;
      }

      event.preventDefault();
      onTabChange(nextTab);
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onTabChange]);
}
