"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type UseLocalStorageReturn<T> = [
  T,
  (value: T | ((previous: T) => T)) => void,
  () => void,
];

export function useLocalStorage<T>(
  key: string,
  defaultValue: T,
): UseLocalStorageReturn<T> {
  const defaultValueRef = useRef(defaultValue);

  const readValue = useCallback((): T => {
    if (typeof window === "undefined") {
      return defaultValueRef.current;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : defaultValueRef.current;
    } catch {
      return defaultValueRef.current;
    }
  }, [key]);

  const [storedValue, setStoredValue] = useState<T>(() => defaultValue);

  const setValue = useCallback(
    (value: T | ((previous: T) => T)) => {
      if (typeof window === "undefined") {
        return;
      }

      try {
        setStoredValue((previous) => {
          const valueToStore =
            value instanceof Function ? value(previous) : value;

          window.localStorage.setItem(key, JSON.stringify(valueToStore));
          return valueToStore;
        });
      } catch {
        // LocalStorage can fail in private or restricted browsing contexts.
      }
    },
    [key],
  );

  const removeValue = useCallback(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      window.localStorage.removeItem(key);
      setStoredValue(defaultValueRef.current);
    } catch {
      // Ignore storage errors safely.
    }
  }, [key]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setStoredValue(readValue());
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [readValue]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    function handleStorageChange(event: StorageEvent) {
      if (event.key === key) {
        setStoredValue(readValue());
      }
    }

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [key, readValue]);

  return [storedValue, setValue, removeValue];
}
