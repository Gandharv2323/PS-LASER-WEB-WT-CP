/**
 * Browser-side calls. They go to our own Next.js route handlers (BFF), not straight to
 * Spring: same-origin (no CORS), the JWT cookie stays httpOnly, and the BFF owns fallbacks.
 */
import { apiFetch } from "./client";
import { estimateEnvelopeSchema, workOrdersSchema } from "./schemas";
import type { EstimateEnvelope, EstimateInput, WorkOrder } from "./types";
import { object, literal, type Schema } from "./validate";

export function postEstimate(input: EstimateInput, signal?: AbortSignal): Promise<EstimateEnvelope> {
  return apiFetch("/api/estimate", estimateEnvelopeSchema, { method: "POST", json: input, signal, timeoutMs: 6000 });
}

const workOrdersEnvelope: Schema<{ source: "spring"; orders: WorkOrder[] }> = object({
  source: [literal(["spring"] as const)],
  orders: [workOrdersSchema],
});

export function getWorkOrders(signal?: AbortSignal) {
  return apiFetch("/api/work-orders", workOrdersEnvelope, { signal, timeoutMs: 6000 });
}
