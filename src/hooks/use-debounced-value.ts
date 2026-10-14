"use client";

import { useEffect, useState } from "react";

/** Returns `value` only after it has stopped changing for `delayMs` (generic over any T). */
export function useDebouncedValue<T>(value: T, delayMs = 400): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t); // cleanup cancels the pending update on every keystroke
  }, [value, delayMs]);
  return debounced;
}
