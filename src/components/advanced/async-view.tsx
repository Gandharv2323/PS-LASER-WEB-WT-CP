import type { ReactNode } from "react";
import type { DataSource, RequestState } from "@/lib/api/types";

/**
 * Render-props component: the caller decides how each state looks, AsyncView decides
 * WHICH one to show. Exhaustive switch over the discriminated union (`never` check).
 */
type Renderers<T> = {
  idle?: () => ReactNode;
  loading?: (previous?: T) => ReactNode;
  error: (message: string, fieldErrors?: Readonly<Record<string, string>>) => ReactNode;
  empty?: () => ReactNode;
  success: (data: T, source?: DataSource) => ReactNode;
  isEmpty?: (data: T) => boolean;
};

export function AsyncView<T>({ state, ...r }: { state: RequestState<T> } & Renderers<T>): ReactNode {
  switch (state.status) {
    case "idle":
      return r.idle?.() ?? null;
    case "loading":
      return (
        r.loading?.(state.previous) ?? (
          <p className="ps-adv-muted" role="status">
            Loading…
          </p>
        )
      );
    case "error":
      return r.error(state.error, state.fieldErrors);
    case "success":
      return r.isEmpty?.(state.data) && r.empty ? r.empty() : r.success(state.data, state.source);
    default: {
      const unreachable: never = state;
      return unreachable;
    }
  }
}
