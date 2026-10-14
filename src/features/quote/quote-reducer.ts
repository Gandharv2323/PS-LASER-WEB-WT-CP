/**
 * Quote form state machine for useReducer. Actions are a discriminated union, so the
 * reducer's switch is exhaustively type-checked and `dispatch` only accepts valid actions.
 */
import type { EstimateInput, EstimateNumberField, Material, MaterialCode } from "@/lib/api/types";

/** Inputs are kept as strings while typing ("1." is valid mid-edit); parsed on demand. */
export type NumberFields = Record<EstimateNumberField, string>;

export interface QuoteFormState {
  readonly materialCode: MaterialCode;
  readonly powderCoat: boolean;
  readonly values: Readonly<NumberFields>;
}

export type QuoteAction =
  | { type: "setField"; field: EstimateNumberField; value: string }
  | { type: "setMaterial"; material: Material }
  | { type: "togglePowderCoat" }
  | { type: "applyPreset"; preset: Partial<EstimateInput> }
  | { type: "reset" };

export const INITIAL_QUOTE: QuoteFormState = {
  materialCode: "MS",
  powderCoat: false,
  values: {
    thicknessMm: "2",
    lengthMm: "300",
    widthMm: "200",
    cutLengthMm: "1200",
    pierces: "4",
    bends: "2",
    quantity: "100",
  },
};

export const PRESETS: readonly { label: string; preset: Partial<EstimateInput> }[] = [
  { label: "Panel bracket (MS 2 mm)", preset: { materialCode: "MS", thicknessMm: 2, lengthMm: 300, widthMm: 200, cutLengthMm: 1200, pierces: 4, bends: 2, quantity: 100 } },
  { label: "SS cover plate (1.5 mm)", preset: { materialCode: "SS", thicknessMm: 1.5, lengthMm: 450, widthMm: 300, cutLengthMm: 1600, pierces: 8, bends: 4, quantity: 25 } },
  { label: "Base plate (MS 10 mm)", preset: { materialCode: "MS", thicknessMm: 10, lengthMm: 250, widthMm: 250, cutLengthMm: 1100, pierces: 4, bends: 0, quantity: 500 } },
];

export function quoteReducer(state: QuoteFormState, action: QuoteAction): QuoteFormState {
  switch (action.type) {
    case "setField":
      return { ...state, values: { ...state.values, [action.field]: action.value } };
    case "setMaterial": {
      // Clamp thickness to the new material's maximum (e.g. MS 10 mm -> Brass 4 mm).
      const t = Number(state.values.thicknessMm);
      const thicknessMm = t > action.material.maxThicknessMm ? String(action.material.maxThicknessMm) : state.values.thicknessMm;
      return { ...state, materialCode: action.material.code, values: { ...state.values, thicknessMm } };
    }
    case "togglePowderCoat":
      return { ...state, powderCoat: !state.powderCoat };
    case "applyPreset": {
      const { materialCode, powderCoat, ...nums } = action.preset;
      const values = { ...state.values };
      for (const [k, v] of Object.entries(nums) as [EstimateNumberField, number][]) values[k] = String(v);
      return { materialCode: materialCode ?? state.materialCode, powderCoat: powderCoat ?? state.powderCoat, values };
    }
    case "reset":
      return INITIAL_QUOTE;
    default: {
      const never: never = action;
      return never;
    }
  }
}

/** Selector: form strings -> typed API input (NaN/blank become 0 and fail validation). */
export function toEstimateInput(s: QuoteFormState): EstimateInput {
  const n = (k: EstimateNumberField) => Number(s.values[k] || 0);
  return {
    materialCode: s.materialCode,
    powderCoat: s.powderCoat,
    thicknessMm: n("thicknessMm"),
    lengthMm: n("lengthMm"),
    widthMm: n("widthMm"),
    cutLengthMm: n("cutLengthMm"),
    pierces: n("pierces"),
    bends: n("bends"),
    quantity: n("quantity"),
  };
}
