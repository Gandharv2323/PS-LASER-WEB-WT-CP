"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useSyncExternalStore } from "react";
import { QueryCache, hashKey, type QueryFn, type QueryKey, type QueryOptions, type QuerySnapshot } from "@/lib/api/query-cache";

/** Typed context: one cache per app; a module default keeps hooks usable without a provider. */
export const QueryCacheContext = createContext<QueryCache>(new QueryCache());
export const useQueryCache = () => useContext(QueryCacheContext);

export interface UseQueryOptions extends QueryOptions {
  enabled?: boolean;
  /** Poll every n ms (dashboard fallback when the STOMP socket is unavailable). */
  refetchInterval?: number | false;
}

export interface UseQueryResult<T> {
  state: QuerySnapshot<T>;
  refetch: () => void;
}

/** SWR-style data hook on top of QueryCache, subscribed with useSyncExternalStore. */
export function useQuery<T>(key: QueryKey, fn: QueryFn<T>, opts: UseQueryOptions = {}): UseQueryResult<T> {
  const { enabled = true, staleTime = 10_000, retry = 2, refetchInterval = false } = opts;
  const cache = useQueryCache();
  const hash = hashKey(key);
  // Structural key -> stable identity: inline array literals don't cause resubscribes.
  const stableKey = useMemo(() => JSON.parse(hash) as QueryKey, [hash]);
  // Latest fn in a ref so callers can pass inline lambdas without refetch loops.
  const fnRef = useRef(fn);
  useEffect(() => {
    fnRef.current = fn;
  });

  const subscribe = useCallback((cb: () => void) => cache.subscribe(stableKey, cb), [cache, stableKey]);
  const get = useCallback(() => cache.getSnapshot<T>(stableKey), [cache, stableKey]);
  const state = useSyncExternalStore(subscribe, get, get);

  const refetch = useCallback(() => {
    cache.fetch(stableKey, (ctx) => fnRef.current(ctx), { retry }).catch(() => undefined);
  }, [cache, stableKey, retry]);

  useEffect(() => {
    if (!enabled) return;
    if (cache.isStale(stableKey, staleTime)) refetch();
    if (!refetchInterval) return;
    const t = setInterval(refetch, refetchInterval);
    return () => clearInterval(t);
  }, [cache, stableKey, enabled, staleTime, refetchInterval, refetch]);

  return { state, refetch };
}
