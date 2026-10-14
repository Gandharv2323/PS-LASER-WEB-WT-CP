"use client";

import { createContext, useContext, useId, type Dispatch, type ReactNode } from "react";
import type { EstimateInput, EstimateNumberField, FieldErrors, Material } from "@/lib/api/types";
import type { QuoteAction, QuoteFormState } from "./quote-reducer";

/**
 * Compound component: <Estimator> owns nothing visual; it shares form state through a
 * typed context so children (<Estimator.Number>, <Estimator.Material>, <Estimator.Toggle>)
 * can be composed in any layout without prop drilling.
 */
interface EstimatorContextValue {
  state: QuoteFormState;
  dispatch: Dispatch<QuoteAction>;
  errors: FieldErrors<EstimateInput>;
}

const EstimatorContext = createContext<EstimatorContextValue | null>(null);

function useEstimator(): EstimatorContextValue {
  const ctx = useContext(EstimatorContext);
  if (!ctx) throw new Error("<Estimator.*> must be rendered inside <Estimator>");
  return ctx;
}

function EstimatorRoot({ children, ...value }: EstimatorContextValue & { children: ReactNode }) {
  return (
    <EstimatorContext.Provider value={value}>
      <form className="ps-adv-estimator" onSubmit={(e) => e.preventDefault()} noValidate aria-label="Estimate inputs">
        {children}
      </form>
    </EstimatorContext.Provider>
  );
}

function NumberField({
  field,
  label,
  unit,
  step = 1,
  min = 0,
  max,
  hint,
}: {
  field: EstimateNumberField;
  label: string;
  unit?: string;
  step?: number;
  min?: number;
  max?: number;
  hint?: ReactNode;
}) {
  const { state, dispatch, errors } = useEstimator();
  const id = useId(); // unique + SSR-stable ids for label/aria wiring
  const err = errors[field];
  return (
    <div className="form-group ps-adv-field">
      <label htmlFor={id}>
        {label}
        {unit ? <span className="ps-optional"> ({unit})</span> : null}
      </label>
      <input
        id={id}
        type="number"
        inputMode="decimal"
        className={`form-control${err ? " is-invalid" : ""}`}
        value={state.values[field]}
        step={step}
        min={min}
        max={max}
        onChange={(e) => dispatch({ type: "setField", field, value: e.target.value })}
        aria-invalid={err ? true : undefined}
        aria-describedby={err ? `${id}-err` : hint ? `${id}-hint` : undefined}
      />
      {err ? (
        <div id={`${id}-err`} className="invalid-feedback d-block">
          {err}
        </div>
      ) : hint ? (
        <small id={`${id}-hint`} className="form-text ps-adv-muted">
          {hint}
        </small>
      ) : null}
    </div>
  );
}

function MaterialField({ materials }: { materials: readonly Material[] }) {
  const { state, dispatch, errors } = useEstimator();
  const id = useId();
  return (
    <div className="form-group ps-adv-field">
      <label htmlFor={id}>Material</label>
      <select
        id={id}
        className={`form-control${errors.materialCode ? " is-invalid" : ""}`}
        value={state.materialCode}
        onChange={(e) => {
          const m = materials.find((x) => x.code === e.target.value);
          if (m) dispatch({ type: "setMaterial", material: m });
        }}
      >
        {materials.map((m) => (
          <option key={m.code} value={m.code}>
            {m.name} (up to {m.maxThicknessMm} mm)
          </option>
        ))}
      </select>
    </div>
  );
}

function Toggle({ label }: { label: string }) {
  const { state, dispatch } = useEstimator();
  const id = useId();
  return (
    <div className="custom-control custom-checkbox ps-adv-toggle">
      <input
        id={id}
        type="checkbox"
        className="custom-control-input"
        checked={state.powderCoat}
        onChange={() => dispatch({ type: "togglePowderCoat" })}
      />
      <label className="custom-control-label" htmlFor={id}>
        {label}
      </label>
    </div>
  );
}

function Row({ children }: { children: ReactNode }) {
  return <div className="form-row ps-adv-row">{children}</div>;
}

/** Object.assign keeps `Estimator` callable AND gives it typed static sub-components. */
export const Estimator = Object.assign(EstimatorRoot, {
  Number: NumberField,
  Material: MaterialField,
  Toggle,
  Row,
});
