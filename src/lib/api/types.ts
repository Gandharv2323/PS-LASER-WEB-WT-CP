/**
 * Shared, strict DTO types for the PS Laser APIs (services/CONTRACT.md).
 * Unit V — TypeScript integration: literal unions, discriminated unions, generics and
 * utility types (Pick / Omit / Partial / Readonly / Record / ReturnType-style inference).
 */

/* ----------------------------------------------------------------------------------------
 * Literal unions (single source of truth: `as const` tuples -> union types)
 * -------------------------------------------------------------------------------------- */

export const MATERIAL_CODES = ["MS", "SS", "AL", "BR", "CU"] as const;
export type MaterialCode = (typeof MATERIAL_CODES)[number];

export const WORK_ORDER_STATUSES = [
  "received",
  "cutting",
  "bending",
  "welding",
  "coating",
  "inspection",
  "dispatched",
] as const;
export type WorkOrderStatus = (typeof WORK_ORDER_STATUSES)[number];

export type Role = "admin" | "staff" | "customer";

/** Where a value came from: the live API or the typed offline fallback. */
export type DataSource = "spring" | "offline";

/* ----------------------------------------------------------------------------------------
 * Catalogue
 * -------------------------------------------------------------------------------------- */

export interface Material {
  readonly code: MaterialCode;
  readonly name: string;
  readonly maxThicknessMm: number;
  readonly densityGCm3: number;
}

/** One `rates` row (SAMPLE prices). Only used by the offline TS estimator. */
export interface RateRow {
  readonly materialCode: MaterialCode;
  readonly thicknessFromMm: number;
  readonly thicknessToMm: number;
  readonly cutRatePerM: number;
  readonly pierceRate: number;
  readonly materialRatePerKg: number;
}

export interface RateSettings {
  readonly bendRateInr: number;
  readonly powderCoatRatePerSqm: number;
  readonly gstPercent: number;
  readonly ratesAreSample: boolean;
}

/* ----------------------------------------------------------------------------------------
 * Estimate (CONTRACT "Price estimate formula")
 * -------------------------------------------------------------------------------------- */

export interface EstimateInput {
  materialCode: MaterialCode;
  thicknessMm: number;
  lengthMm: number;
  widthMm: number;
  cutLengthMm: number;
  pierces: number;
  bends: number;
  powderCoat: boolean;
  quantity: number;
}

/** Keys of the cost breakdown, derived from a const tuple so UI tables stay in sync. */
export const BREAKDOWN_KEYS = ["material", "cutting", "piercing", "bending", "coating"] as const;
export type BreakdownKey = (typeof BREAKDOWN_KEYS)[number];
export type Breakdown = Readonly<Record<BreakdownKey, number>>;

export interface EstimateResult {
  readonly materialCode: MaterialCode;
  readonly thicknessMm: number;
  readonly quantity: number;
  readonly breakdown: Breakdown;
  readonly perPart: number;
  readonly subtotal: number;
  readonly gst: number;
  readonly total: number;
  readonly currency: "INR";
  readonly isSample: boolean;
}

/** What our BFF route handler (/api/estimate) returns to the browser. */
export interface EstimateEnvelope {
  readonly source: DataSource;
  readonly estimate: EstimateResult;
}

/** Numeric fields of the estimate input (utility type: filter keys by value type). */
export type NumericKeys<T> = { [K in keyof T]-?: T[K] extends number ? K : never }[keyof T];
export type EstimateNumberField = NumericKeys<EstimateInput>;

/** Field-level validation messages, same shape Spring returns in `fieldErrors`. */
export type FieldErrors<T> = Partial<Record<keyof T & string, string>>;

/* ----------------------------------------------------------------------------------------
 * Work orders / tracking
 * -------------------------------------------------------------------------------------- */

export interface WorkOrderEvent {
  readonly status: WorkOrderStatus | string;
  readonly note: string | null;
  readonly createdAt: string | null;
}

export interface WorkOrder {
  readonly id: number | null;
  readonly orderNo: string;
  readonly customerName: string;
  readonly description: string;
  readonly machineSlug: string | null;
  readonly quantity: number;
  readonly status: WorkOrderStatus;
  readonly dueDate: string | null;
  readonly updatedAt: string | null;
}

export interface TrackedOrder extends WorkOrder {
  readonly events: readonly WorkOrderEvent[];
}

/** Public tracking view never needs internal ids: utility type Omit. */
export type PublicOrder = Omit<TrackedOrder, "id">;

/** Compact row for dashboard lists: utility type Pick. */
export type WorkOrderRow = Pick<WorkOrder, "id" | "orderNo" | "customerName" | "status" | "quantity" | "dueDate" | "description" | "machineSlug" | "updatedAt">;

/* ----------------------------------------------------------------------------------------
 * Auth
 * -------------------------------------------------------------------------------------- */

export interface User {
  readonly id: number;
  readonly name: string;
  readonly email: string;
  readonly role: Role;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  readonly token: string;
  readonly user: User;
}

/** Claims Spring puts in the HS256 JWT (CONTRACT "Auth"). */
export interface JwtClaims {
  readonly sub: string;
  readonly email: string;
  readonly role: Role;
  readonly exp: number;
  readonly name?: string;
}

/** Session as the Next.js server sees it after verifying the httpOnly cookie. */
export type Session = Readonly<{ email: string; role: Role; name: string; expiresAt: number }>;

/* ----------------------------------------------------------------------------------------
 * Enquiries (Node API :4000)
 * -------------------------------------------------------------------------------------- */

export interface EnquiryInput {
  name: string;
  phone: string;
  email?: string;
  serviceSlug?: string;
  machineSlug?: string;
  message: string;
  source?: string;
}

export interface EnquiryCreated {
  readonly id: number;
  readonly whatsappUrl: string;
}

/* ----------------------------------------------------------------------------------------
 * Errors + request state
 * -------------------------------------------------------------------------------------- */

/** Spring error body (CONTRACT "Errors"). */
export interface ApiErrorBody {
  readonly status: number;
  readonly error: string;
  readonly message: string;
  readonly fieldErrors?: Readonly<Record<string, string>>;
}

/**
 * Discriminated union for any async request. `status` is the discriminant, so
 * `if (s.status === "success") s.data` narrows without casts.
 */
export type RequestState<T, E = string> =
  | { readonly status: "idle" }
  | { readonly status: "loading"; readonly previous?: T }
  | { readonly status: "success"; readonly data: T; readonly source?: DataSource }
  | { readonly status: "error"; readonly error: E; readonly fieldErrors?: Readonly<Record<string, string>> };

/** Extract the data type out of a RequestState (conditional type + infer). */
export type DataOf<S> = S extends { status: "success"; data: infer D } ? D : never;
