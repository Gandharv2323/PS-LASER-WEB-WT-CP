/**
 * Runtime schemas for every API response we consume. Each is typed as Schema<DTO>, so
 * the compiler checks that the schema really produces the DTO from ./types.
 */
import {
  BREAKDOWN_KEYS,
  MATERIAL_CODES,
  WORK_ORDER_STATUSES,
  type ApiErrorBody,
  type Breakdown,
  type EnquiryCreated,
  type EstimateEnvelope,
  type EstimateResult,
  type LoginResponse,
  type Material,
  type TrackedOrder,
  type WorkOrder,
  type WorkOrderEvent,
} from "./types";
import {
  array,
  boolean,
  isObject,
  list,
  literal,
  nullable,
  number,
  object,
  pick,
  string,
  withDefault,
  type Schema,
} from "./validate";

export const materialCode = literal(MATERIAL_CODES);
export const workOrderStatus = literal(WORK_ORDER_STATUSES);

export const materialSchema: Schema<Material> = object({
  code: [materialCode, "materialCode", "material_code"],
  name: [string],
  maxThicknessMm: [number, "max_thickness_mm", "maxThickness"],
  densityGCm3: [number, "density_g_cm3", "density", "densityGcm3"],
});
export const materialsSchema: Schema<Material[]> = list(materialSchema);

const breakdownSchema: Schema<Breakdown> = (v, path = "breakdown") => {
  const o = isObject(v) ? v : {};
  const out = {} as Record<(typeof BREAKDOWN_KEYS)[number], number>;
  for (const k of BREAKDOWN_KEYS) out[k] = withDefault(number, 0)(o[k], `${path}.${k}`);
  return out;
};

export const estimateSchema: Schema<EstimateResult> = object({
  materialCode: [materialCode, "material_code"],
  thicknessMm: [number, "thickness_mm"],
  quantity: [number],
  breakdown: [breakdownSchema],
  perPart: [number, "per_part"],
  subtotal: [number],
  gst: [number],
  total: [number],
  currency: [literal(["INR"] as const)],
  isSample: [withDefault(boolean, true), "is_sample", "sample"],
});

export const estimateEnvelopeSchema: Schema<EstimateEnvelope> = object({
  source: [literal(["spring", "offline"] as const)],
  estimate: [estimateSchema],
});

const eventSchema: Schema<WorkOrderEvent> = object({
  status: [string],
  note: [nullable(string)],
  createdAt: [nullable(string), "created_at", "at", "timestamp"],
});

export const workOrderSchema: Schema<WorkOrder> = object({
  id: [nullable(number)],
  orderNo: [string, "order_no", "orderNumber"],
  customerName: [withDefault(string, ""), "customer_name"],
  description: [withDefault(string, ""), "desc"],
  machineSlug: [nullable(string), "machine_slug", "machine"],
  quantity: [withDefault(number, 1), "qty"],
  status: [workOrderStatus],
  dueDate: [nullable(string), "due_date"],
  updatedAt: [nullable(string), "updated_at"],
});
export const workOrdersSchema: Schema<WorkOrder[]> = list(workOrderSchema);

/** Tracking accepts `{...order, events}` or `{order:{...}, events:[...]}`. */
export const trackedOrderSchema: Schema<TrackedOrder> = (v, path = "") => {
  if (!isObject(v)) throw new Error("tracking response is not an object");
  const orderPart = isObject(v.order) ? v.order : isObject(v.workOrder) ? v.workOrder : v;
  const events = pick(v, "events") ?? pick(orderPart, "events") ?? [];
  return { ...workOrderSchema(orderPart, path), events: array(eventSchema)(events, "events") };
};

export const loginResponseSchema: Schema<LoginResponse> = object({
  token: [string, "accessToken", "jwt"],
  user: [
    object({
      id: [number],
      name: [withDefault(string, "")],
      email: [string],
      role: [literal(["admin", "staff", "customer"] as const)],
    }),
  ],
});

export const enquiryCreatedSchema: Schema<EnquiryCreated> = object({
  id: [number],
  whatsappUrl: [string, "whatsapp_url"],
});

export const apiErrorSchema: Schema<ApiErrorBody> = object({
  status: [withDefault(number, 0)],
  error: [withDefault(string, "Error")],
  message: [withDefault(string, "Request failed")],
  fieldErrors: [
    (v: unknown) => {
      if (!isObject(v)) return undefined;
      const out: Record<string, string> = {};
      for (const [k, msg] of Object.entries(v)) out[k] = String(msg);
      return out;
    },
    "field_errors",
    "errors",
  ],
});

/** Request body validation for our BFF (/api/estimate). */
export const estimateInputSchema: Schema<import("./types").EstimateInput> = object({
  materialCode: [materialCode],
  thicknessMm: [number],
  lengthMm: [number],
  widthMm: [number],
  cutLengthMm: [number],
  pierces: [number],
  bends: [withDefault(number, 0)],
  powderCoat: [withDefault(boolean, false)],
  quantity: [number],
});
