"use client";

import { useCallback, useSyncExternalStore } from "react";

type Listener = () => void;
const listeners = new Set<Listener>();

function subscribe(listener: Listener) {
  listeners.add(listener);
  // `storage` fires for changes made in OTHER tabs; same-tab writes notify via `listeners`.
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function read(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null; // private mode / blocked storage
  }
}

/**
 * Typed localStorage state synced across components and tabs (useSyncExternalStore).
 * Stores JSON; the snapshot is the raw string so React can compare it cheaply.
 * Not for secrets — the JWT deliberately lives in an httpOnly cookie instead.
 */
export function useLocalStorage<T>(key: string, initial: T): [T, (next: T | ((prev: T) => T)) => void] {
  const raw = useSyncExternalStore(
    subscribe,
    () => read(key),
    () => null,
  );
  let value = initial;
  if (raw !== null) {
    try {
      value = JSON.parse(raw) as T;
    } catch {
      value = initial;
    }
  }

  const setValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      const prevRaw = read(key);
      let prev = initial;
      if (prevRaw !== null) {
        try {
          prev = JSON.parse(prevRaw) as T;
        } catch {
          /* keep initial */
        }
      }
      const resolved = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
      try {
        window.localStorage.setItem(key, JSON.stringify(resolved));
      } catch {
        /* ignore quota / privacy errors */
      }
      listeners.forEach((l) => l());
    },
    [key, initial],
  );

  return [value, setValue];
}
