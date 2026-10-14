/**
 * Server-side data access to the Spring Boot API (CONTRACT, base :8081).
 * Each function documents its rendering/caching strategy:
 *  - getMaterials: ISR — cached by Next's fetch cache, revalidated every hour.
 *  - trackOrder:   SSR — `cache: "no-store"`, fresh on every request.
 *  - springEstimate / login / adminWorkOrders: never cached (POST or per-user).
 * Import only from Server Components, Server Actions or route handlers.
 */
import { apiFetch, ApiError, withFallback } from "./client";
import { SPRING_API } from "./config";
import { computeEstimate, validateEstimate } from "./estimate";
import { demoOrder, FALLBACK_MATERIALS } from "./fallback";
import {
  estimateSchema,
  loginResponseSchema,
  materialsSchema,
  trackedOrderSchema,
  workOrdersSchema,
} from "./schemas";
import type { DataSource, EstimateEnvelope, EstimateInput, LoginRequest, LoginResponse, Material, TrackedOrder, WorkOrder } from "./types";

export const MATERIALS_REVALIDATE_SECONDS = 3600;

export async function getMaterials(): Promise<{ data: readonly Material[]; source: DataSource }> {
  return withFallback(
    () =>
      apiFetch(`${SPRING_API}/api/materials`, materialsSchema, {
        next: { revalidate: MATERIALS_REVALIDATE_SECONDS, tags: ["materials"] },
      }),
    () => FALLBACK_MATERIALS,
  );
}

export type TrackResult =
  | { kind: "found"; order: TrackedOrder; source: DataSource }
  | { kind: "not-found"; source: DataSource }
  | { kind: "invalid"; message: string };

export async function trackOrder(orderNo: string, phone: string): Promise<TrackResult> {
  const q = new URLSearchParams({ orderNo: orderNo.trim(), phone: phone.trim() });
  try {
    const order = await apiFetch(`${SPRING_API}/api/work-orders/track?${q}`, trackedOrderSchema, { cache: "no-store" });
    return { kind: "found", order, source: "spring" };
  } catch (e) {
    if (e instanceof ApiError && e.kind === "http" && (e.status === 404 || e.status === 403)) {
      return { kind: "not-found", source: "spring" };
    }
    if (e instanceof ApiError && e.kind === "http" && e.status === 400) {
      return { kind: "invalid", message: e.body?.message ?? "Check the order number and phone." };
    }
    if (e instanceof ApiError && e.isOffline) {
      const order = demoOrder(orderNo, phone);
      return order ? { kind: "found", order, source: "offline" } : { kind: "not-found", source: "offline" };
    }
    throw e; // unexpected -> nearest error.tsx boundary
  }
}

export type EstimateOutcome =
  | { ok: true; envelope: EstimateEnvelope }
  | { ok: false; status: number; message: string; fieldErrors?: Readonly<Record<string, string>> };

/** BFF logic: ask Spring, fall back to the TS formula when Spring is offline. */
export async function springEstimate(input: EstimateInput, signal?: AbortSignal): Promise<EstimateOutcome> {
  try {
    const estimate = await apiFetch(`${SPRING_API}/api/quotes/estimate`, estimateSchema, {
      method: "POST",
      json: input,
      cache: "no-store",
      signal,
    });
    return { ok: true, envelope: { source: "spring", estimate } };
  } catch (e) {
    if (e instanceof ApiError && e.kind === "http" && e.status >= 400 && e.status < 500 && e.status !== 404) {
      return { ok: false, status: e.status, message: e.body?.message ?? e.message, fieldErrors: e.body?.fieldErrors };
    }
    const v = validateEstimate(input);
    if (!v.ok) return { ok: false, status: 400, message: "Please check the highlighted fields.", fieldErrors: v.fieldErrors };
    return { ok: true, envelope: { source: "offline", estimate: computeEstimate(input) } };
  }
}

export async function springLogin(body: LoginRequest): Promise<LoginResponse> {
  return apiFetch(`${SPRING_API}/api/auth/login`, loginResponseSchema, { method: "POST", json: body, cache: "no-store" });
}

export async function adminWorkOrders(token: string): Promise<WorkOrder[]> {
  return apiFetch(`${SPRING_API}/api/admin/work-orders`, workOrdersSchema, {
    cache: "no-store",
    headers: { Authorization: `Bearer ${token}` },
  });
}
