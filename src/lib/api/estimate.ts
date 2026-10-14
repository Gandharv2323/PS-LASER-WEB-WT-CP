/**
 * CONTRACT price-estimate formula in TypeScript (identical to PHP / Spring / JSP).
 * Pure functions: shared by the BFF route handler fallback and the client offline path.
 */
import { FALLBACK_MATERIALS, FALLBACK_RATES, FALLBACK_SETTINGS } from "./fallback";
import type { EstimateInput, EstimateResult, FieldErrors, Material, RateRow, RateSettings } from "./types";

export const BED = { lengthMm: 3000, widthMm: 1500 } as const;

/**
 * Round half-up to 2 dp, robust to binary floats: 176.625 * 100 = 17662.499999999996, so
 * we first trim to 15 significant digits (17662.5) and then round.
 */
export const round2 = (n: number) => Math.round(Number((n * 100).toPrecision(15))) / 100;

export type EstimateValidation =
  | { ok: true; material: Material; rate: RateRow }
  | { ok: false; fieldErrors: FieldErrors<EstimateInput> };

/** Step 1-2 of the formula: validation + rate lookup. */
export function validateEstimate(
  input: EstimateInput,
  materials: readonly Material[] = FALLBACK_MATERIALS,
  rates: readonly RateRow[] = FALLBACK_RATES,
): EstimateValidation {
  const errors: FieldErrors<EstimateInput> = {};
  const material = materials.find((m) => m.code === input.materialCode);
  if (!material) errors.materialCode = "Unknown material";
  if (!(input.thicknessMm > 0)) errors.thicknessMm = "Thickness must be more than 0 mm";
  else if (material && input.thicknessMm > material.maxThicknessMm)
    errors.thicknessMm = `Max ${material.maxThicknessMm} mm for ${material.name}`;
  if (!(input.lengthMm > 0) || input.lengthMm > BED.lengthMm) errors.lengthMm = `Length must be 1–${BED.lengthMm} mm`;
  if (!(input.widthMm > 0) || input.widthMm > BED.widthMm) errors.widthMm = `Width must be 1–${BED.widthMm} mm`;
  if (!(input.cutLengthMm > 0)) errors.cutLengthMm = "Cut length must be more than 0 mm";
  if (!Number.isInteger(input.pierces) || input.pierces < 0) errors.pierces = "Pierces must be a whole number ≥ 0";
  if (!Number.isInteger(input.bends) || input.bends < 0) errors.bends = "Bends must be a whole number ≥ 0";
  if (!Number.isInteger(input.quantity) || input.quantity < 1) errors.quantity = "Quantity must be at least 1";

  const rate = rates.find(
    (r) => r.materialCode === input.materialCode && input.thicknessMm >= r.thicknessFromMm && input.thicknessMm <= r.thicknessToMm,
  );
  if (material && !errors.thicknessMm && !rate) errors.thicknessMm = "No rate band for this thickness";

  if (Object.keys(errors).length > 0 || !material || !rate) return { ok: false, fieldErrors: errors };
  return { ok: true, material, rate };
}

/** Steps 3-12. Throws only on invalid input (call validateEstimate first for messages). */
export function computeEstimate(
  input: EstimateInput,
  materials: readonly Material[] = FALLBACK_MATERIALS,
  rates: readonly RateRow[] = FALLBACK_RATES,
  settings: RateSettings = FALLBACK_SETTINGS,
): EstimateResult {
  const v = validateEstimate(input, materials, rates);
  if (!v.ok) throw new Error(Object.values(v.fieldErrors).join("; "));
  const { material: m, rate } = v;

  const areaM2 = (input.lengthMm * input.widthMm) / 1e6;
  const weightKg = areaM2 * input.thicknessMm * m.densityGCm3;
  const breakdown = {
    material: round2(weightKg * rate.materialRatePerKg),
    cutting: round2((input.cutLengthMm / 1000) * rate.cutRatePerM),
    piercing: round2(input.pierces * rate.pierceRate),
    bending: round2(input.bends * settings.bendRateInr),
    coating: round2(input.powderCoat ? areaM2 * 2 * settings.powderCoatRatePerSqm : 0),
  };
  // Shared rounding rule (PHP / Spring / JSP / Next): each line rounded, perPart = sum of
  // rounded lines. Reference: MS 2 mm, 500x300, cut 1600, 4 pierces, 2 bends, coat, qty 10
  // -> perPart 248.63, subtotal 2486.30, GST 447.53, total 2933.83.
  const perPart = round2(breakdown.material + breakdown.cutting + breakdown.piercing + breakdown.bending + breakdown.coating);
  const subtotal = round2(perPart * input.quantity);
  const gst = round2((subtotal * settings.gstPercent) / 100);
  return {
    materialCode: input.materialCode,
    thicknessMm: input.thicknessMm,
    quantity: input.quantity,
    breakdown,
    perPart,
    subtotal,
    gst,
    total: round2(subtotal + gst),
    currency: "INR",
    isSample: settings.ratesAreSample,
  };
}

/** Parts per 3000 x 1500 sheet for a simple grid nest (5 mm web), best of two rotations. */
export function nestPerSheet(lengthMm: number, widthMm: number, gapMm = 5): { perSheet: number; cols: number; rows: number; rotated: boolean } {
  const fit = (l: number, w: number) => {
    const cols = Math.max(0, Math.floor((BED.lengthMm + gapMm) / (l + gapMm)));
    const rows = Math.max(0, Math.floor((BED.widthMm + gapMm) / (w + gapMm)));
    return { cols, rows, perSheet: cols * rows };
  };
  const a = fit(lengthMm, widthMm);
  const b = fit(widthMm, lengthMm);
  return b.perSheet > a.perSheet ? { ...b, rotated: true } : { ...a, rotated: false };
}

export const formatINR = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(n);
