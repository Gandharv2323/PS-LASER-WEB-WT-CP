/**
 * Barrel for the isomorphic API layer (safe in Client and Server Components).
 * Server-only modules (./spring, ./session) are imported by path on purpose so they never
 * end up in a client bundle.
 */
export * from "./types";
export { apiFetch, ApiError, withFallback, type ApiErrorKind, type ApiInit } from "./client";
export { computeEstimate, validateEstimate, nestPerSheet, formatINR, BED } from "./estimate";
export { FALLBACK_MATERIALS, FALLBACK_RATES, FALLBACK_SETTINGS } from "./fallback";
export { QueryCache, hashKey, type QueryKey, type QueryFn, type QuerySnapshot } from "./query-cache";
export * as schemas from "./schemas";
