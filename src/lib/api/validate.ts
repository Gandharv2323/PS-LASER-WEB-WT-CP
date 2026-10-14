/**
 * Tiny hand-written runtime validator (zod-style, zero dependencies).
 * Unit V — TypeScript generics: `Schema<T>` carries its output type, and `Infer<S>`
 * recovers it, so one declaration gives both the runtime check and the static type.
 *
 * Validators are tolerant about key spelling (camelCase from Spring/Jackson or snake_case
 * from MySQL rows) because the APIs are built in parallel; they normalise to our DTOs.
 */

export class ValidationError extends Error {
  constructor(
    readonly path: string,
    message: string,
  ) {
    super(`${path || "value"}: ${message}`);
    this.name = "ValidationError";
  }
}

export type Schema<T> = (value: unknown, path?: string) => T;
export type Infer<S> = S extends Schema<infer T> ? T : never;

type Obj = Record<string, unknown>;

export function isObject(v: unknown): v is Obj {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/** Read the first present key among aliases (`maxThicknessMm` | `max_thickness_mm`). */
export function pick(o: Obj, ...keys: string[]): unknown {
  for (const k of keys) if (o[k] !== undefined) return o[k];
  return undefined;
}

export const string: Schema<string> = (v, path = "") => {
  if (typeof v === "string") return v;
  if (typeof v === "number") return String(v);
  throw new ValidationError(path, "expected string");
};

/** Numbers arrive as JSON numbers or as strings (MySQL DECIMAL via some drivers). */
export const number: Schema<number> = (v, path = "") => {
  const n = typeof v === "string" && v.trim() !== "" ? Number(v) : v;
  if (typeof n === "number" && Number.isFinite(n)) return n;
  throw new ValidationError(path, "expected number");
};

export const boolean: Schema<boolean> = (v, path = "") => {
  if (typeof v === "boolean") return v;
  if (v === 1 || v === "1" || v === "true") return true;
  if (v === 0 || v === "0" || v === "false") return false;
  throw new ValidationError(path, "expected boolean");
};

export function literal<const L extends readonly string[]>(values: L): Schema<L[number]> {
  return (v, path = "") => {
    const s = typeof v === "string" ? v.trim() : v;
    const hit = values.find((x) => x === s || (typeof s === "string" && x.toLowerCase() === s.toLowerCase()));
    if (hit !== undefined) return hit;
    throw new ValidationError(path, `expected one of ${values.join(", ")}`);
  };
}

export function nullable<T>(schema: Schema<T>): Schema<T | null> {
  return (v, path) => (v === null || v === undefined ? null : schema(v, path));
}

export function withDefault<T>(schema: Schema<T>, fallback: T): Schema<T> {
  return (v, path) => (v === null || v === undefined ? fallback : schema(v, path));
}

export function array<T>(item: Schema<T>): Schema<T[]> {
  return (v, path = "") => {
    if (!Array.isArray(v)) throw new ValidationError(path, "expected array");
    return v.map((x, i) => item(x, `${path}[${i}]`));
  };
}

/** Accepts either a bare array or a Spring `Page` / wrapper (`{content:[...]}` / `{items:[...]}`). */
export function list<T>(item: Schema<T>): Schema<T[]> {
  return (v, path = "") => {
    if (isObject(v)) {
      const inner = pick(v, "content", "items", "data", "results");
      if (Array.isArray(inner)) return array(item)(inner, path);
    }
    return array(item)(v, path);
  };
}

/**
 * Object schema from a shape of field specs. Each spec is `[schema, ...aliases]`.
 * Mapped type: the output type is derived from the shape, so no duplicate interface needed.
 */
type FieldSpec<T> = readonly [Schema<T>, ...string[]];
type Shape = Record<string, FieldSpec<unknown>>;
type OutputOf<S extends Shape> = { [K in keyof S]: S[K] extends FieldSpec<infer T> ? T : never };

export function object<S extends Shape>(shape: S): Schema<OutputOf<S>> {
  return (v, path = "") => {
    if (!isObject(v)) throw new ValidationError(path, "expected object");
    const out: Partial<OutputOf<S>> = {};
    for (const key of Object.keys(shape) as (keyof S & string)[]) {
      const [schema, ...aliases] = shape[key];
      const raw = pick(v, key, ...aliases);
      out[key] = schema(raw, path ? `${path}.${key}` : key) as OutputOf<S>[typeof key];
    }
    return out as OutputOf<S>;
  };
}

/** Never throws: returns a discriminated result instead (handy in fallbacks). */
export function safeParse<T>(schema: Schema<T>, value: unknown): { ok: true; value: T } | { ok: false; error: ValidationError } {
  try {
    return { ok: true, value: schema(value) };
  } catch (e) {
    return { ok: false, error: e instanceof ValidationError ? e : new ValidationError("", String(e)) };
  }
}
