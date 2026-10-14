"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { postEstimate } from "@/lib/api/browser";
import { ApiError } from "@/lib/api/client";
import { computeEstimate, validateEstimate } from "@/lib/api/estimate";
import type { EstimateInput, EstimateResult, RequestState } from "@/lib/api/types";

type Settled = { input: EstimateInput; state: RequestState<EstimateResult> };

/**
 * Fetches an estimate whenever `input` changes (pass a debounced value).
 *  - AbortController cancels the previous request when inputs change or on unmount.
 *  - A monotonically increasing request id is a second race-condition guard: a slow
 *    response that resolves after a newer one is ignored even if abort came too late.
 *  - Validation and "loading" are DERIVED during render (no synchronous setState in the
 *    effect); the effect only synchronises with the network.
 *  - If even our BFF is unreachable, the TS formula runs locally ("offline estimate").
 */
export function useEstimate(input: EstimateInput | null): RequestState<EstimateResult> {
  const [settled, setSettled] = useState<Settled | null>(null);
  const latest = useRef(0);
  const validation = useMemo(() => (input ? validateEstimate(input) : null), [input]);

  useEffect(() => {
    if (!input || !validation?.ok) return;
    const id = ++latest.current;
    const controller = new AbortController();
    const commit = (state: RequestState<EstimateResult>) => {
      if (id === latest.current) setSettled({ input, state });
    };

    postEstimate(input, controller.signal)
      .then((env) => commit({ status: "success", data: env.estimate, source: env.source }))
      .catch((e: unknown) => {
        if (e instanceof ApiError && e.kind === "aborted") return;
        if (e instanceof ApiError && e.kind === "http" && e.status === 400) {
          commit({ status: "error", error: e.message, fieldErrors: e.body?.fieldErrors });
          return;
        }
        commit({ status: "success", data: computeEstimate(input), source: "offline" });
      });

    return () => controller.abort();
  }, [input, validation]);

  if (!input || !validation) return { status: "idle" };
  if (!validation.ok) return { status: "error", error: "Please check the highlighted fields.", fieldErrors: validation.fieldErrors };
  if (settled?.input === input) return settled.state;
  return { status: "loading", previous: settled?.state.status === "success" ? settled.state.data : undefined };
}
