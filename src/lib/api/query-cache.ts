/**
 * Minimal SWR / TanStack-Query-style cache (no dependency), chosen so every moving part
 * is visible for the syllabus: keyed cache, request de-duplication, stale-while-revalidate,
 * retries with exponential backoff, invalidation, and an external-store API
 * (subscribe/getSnapshot) consumed through React's useSyncExternalStore.
 */
import { ApiError } from "./client";
import type { RequestState } from "./types";

export type QueryKey = readonly (string | number | boolean | null)[];
export type QueryFn<T> = (ctx: { signal: AbortSignal }) => Promise<T>;

export interface QueryOptions {
  /** ms during which cached data is "fresh" and no refetch happens on mount. */
  staleTime?: number;
  /** Retries after the first failure (not for 4xx client errors). */
  retry?: number;
}

/** Each cache entry's snapshot keeps `updatedAt` so the UI can show "updated 3 s ago". */
export type QuerySnapshot<T> = RequestState<T> & { readonly updatedAt: number; readonly fetching: boolean };

interface Entry<T> {
  snapshot: QuerySnapshot<T>;
  inflight?: Promise<T>;
  controller?: AbortController;
  listeners: Set<() => void>;
}

const IDLE: QuerySnapshot<never> = Object.freeze({ status: "idle", updatedAt: 0, fetching: false });

export const hashKey = (key: QueryKey) => JSON.stringify(key);
const sleep = (ms: number, signal: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    const t = setTimeout(resolve, ms);
    signal.addEventListener("abort", () => {
      clearTimeout(t);
      reject(new ApiError("aborted", "aborted"));
    });
  });

export class QueryCache {
  private entries = new Map<string, Entry<unknown>>();

  private entry<T>(hash: string): Entry<T> {
    let e = this.entries.get(hash) as Entry<T> | undefined;
    if (!e) {
      e = { snapshot: IDLE, listeners: new Set() };
      this.entries.set(hash, e as Entry<unknown>);
    }
    return e;
  }

  private set<T>(hash: string, next: QuerySnapshot<T>) {
    const e = this.entry<T>(hash);
    e.snapshot = next; // new object -> useSyncExternalStore re-renders subscribers only
    e.listeners.forEach((l) => l());
  }

  subscribe = (key: QueryKey, listener: () => void): (() => void) => {
    const e = this.entry(hashKey(key));
    e.listeners.add(listener);
    return () => e.listeners.delete(listener);
  };

  getSnapshot = <T>(key: QueryKey): QuerySnapshot<T> => this.entry<T>(hashKey(key)).snapshot;

  isStale(key: QueryKey, staleTime: number): boolean {
    const s = this.getSnapshot(key);
    return s.status !== "success" || Date.now() - s.updatedAt > staleTime;
  }

  /** Fetch with de-duplication: concurrent callers share one in-flight promise. */
  fetch<T>(key: QueryKey, fn: QueryFn<T>, { retry = 2 }: QueryOptions = {}): Promise<T> {
    const hash = hashKey(key);
    const e = this.entry<T>(hash);
    if (e.inflight) return e.inflight;

    const controller = new AbortController();
    const prev = e.snapshot;
    const previous = prev.status === "success" ? prev.data : undefined;
    // Stale-while-revalidate: keep showing the old data while refetching.
    this.set<T>(hash, prev.status === "success" ? { ...prev, fetching: true } : { status: "loading", previous, updatedAt: prev.updatedAt, fetching: true });

    const run = async (): Promise<T> => {
      for (let attempt = 0; ; attempt++) {
        try {
          return await fn({ signal: controller.signal });
        } catch (err) {
          const clientError = err instanceof ApiError && (err.kind === "aborted" || (err.kind === "http" && err.status < 500));
          if (clientError || attempt >= retry) throw err;
          await sleep(Math.min(500 * 2 ** attempt, 4000), controller.signal); // 500 ms, 1 s, 2 s…
        }
      }
    };

    const p = run()
      .then((data) => {
        this.set<T>(hash, { status: "success", data, updatedAt: Date.now(), fetching: false });
        return data;
      })
      .catch((err: unknown) => {
        if (!(err instanceof ApiError && err.kind === "aborted")) {
          const message = err instanceof Error ? err.message : "Request failed";
          const current = e.snapshot;
          // Keep stale data visible if a background refetch fails.
          this.set<T>(hash, current.status === "success" ? { ...current, fetching: false } : { status: "error", error: message, updatedAt: Date.now(), fetching: false });
        }
        throw err;
      })
      .finally(() => {
        e.inflight = undefined;
        e.controller = undefined;
      });
    e.inflight = p;
    e.controller = controller;
    return p;
  }

  /** Write data directly (optimistic updates, websocket pushes). */
  setData<T>(key: QueryKey, updater: (old: T | undefined) => T) {
    const hash = hashKey(key);
    const s = this.entry<T>(hash).snapshot;
    const old = s.status === "success" ? s.data : undefined;
    this.set<T>(hash, { status: "success", data: updater(old), updatedAt: Date.now(), fetching: false });
  }

  /** Mark matching keys stale (prefix match), so the next mount/poll refetches. */
  invalidate(prefix: QueryKey) {
    const p = hashKey(prefix).slice(0, -1);
    for (const [hash, e] of this.entries) {
      if (hash.startsWith(p) && e.snapshot.status === "success") this.set(hash, { ...e.snapshot, updatedAt: 0 });
    }
  }

  cancel(key: QueryKey) {
    this.entries.get(hashKey(key))?.controller?.abort();
  }
}
