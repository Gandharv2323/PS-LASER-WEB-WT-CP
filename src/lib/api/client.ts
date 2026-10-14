/**
 * Typed fetch client. `apiFetch<T>()` takes a runtime Schema<T>, so the returned promise is
 * typed AND validated — a malformed response becomes a ValidationError, never a silent `any`.
 * Works on the server (Server Components / route handlers) and in the browser.
 */
import { API_TIMEOUT_MS } from "./config";
import { apiErrorSchema } from "./schemas";
import type { ApiErrorBody } from "./types";
import { safeParse, type Schema } from "./validate";

/** Error kinds as a discriminant so callers can branch (offline -> fallback, http 4xx -> show). */
export type ApiErrorKind = "network" | "timeout" | "aborted" | "http" | "invalid";

export class ApiError extends Error {
  constructor(
    readonly kind: ApiErrorKind,
    message: string,
    readonly status = 0,
    readonly body?: ApiErrorBody,
  ) {
    super(message);
    this.name = "ApiError";
  }
  /** True when the backend simply is not reachable (fall back to offline data). */
  get isOffline(): boolean {
    return this.kind === "network" || this.kind === "timeout" || this.status >= 500 || this.status === 404;
  }
}

/** Next.js extends RequestInit with `next: { revalidate, tags }` (ISR) on the server. */
export type ApiInit = Omit<RequestInit, "body"> & {
  json?: unknown;
  timeoutMs?: number;
  next?: { revalidate?: number | false; tags?: string[] };
};

export async function apiFetch<T>(url: string, schema: Schema<T>, init: ApiInit = {}): Promise<T> {
  const { json, timeoutMs = API_TIMEOUT_MS, headers, signal, ...rest } = init;
  const timeout = AbortSignal.timeout(timeoutMs);
  const combined = signal ? AbortSignal.any([signal, timeout]) : timeout;

  let res: Response;
  try {
    res = await fetch(url, {
      ...rest,
      signal: combined,
      headers: {
        Accept: "application/json",
        ...(json !== undefined ? { "Content-Type": "application/json" } : {}),
        ...headers,
      },
      body: json !== undefined ? JSON.stringify(json) : undefined,
    });
  } catch (e) {
    if (signal?.aborted) throw new ApiError("aborted", "Request cancelled");
    if (timeout.aborted) throw new ApiError("timeout", `No response from ${new URL(url, "http://x").host} in ${timeoutMs} ms`);
    throw new ApiError("network", e instanceof Error ? e.message : "Network error");
  }

  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!res.ok) {
    const parsed = safeParse(apiErrorSchema, data);
    const body = parsed.ok ? parsed.value : undefined;
    throw new ApiError("http", body?.message ?? `HTTP ${res.status}`, res.status, body);
  }

  const parsed = safeParse(schema, data);
  if (!parsed.ok) throw new ApiError("invalid", `Unexpected response: ${parsed.error.message}`, res.status);
  return parsed.value;
}

/** Run `primary`; if the backend is offline return `fallback()` instead (typed the same). */
export async function withFallback<T>(primary: () => Promise<T>, fallback: () => T): Promise<{ data: T; source: "spring" | "offline" }> {
  try {
    return { data: await primary(), source: "spring" };
  } catch (e) {
    if (e instanceof ApiError && !e.isOffline && e.kind !== "invalid") throw e;
    return { data: fallback(), source: "offline" };
  }
}
