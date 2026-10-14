"use client";

import { useId } from "react";
import { useControllableState } from "@/hooks/use-controllable-state";

/**
 * Works both ways:
 *  - controlled:   <QuantityStepper value={q} onChange={setQ} />  (parent owns state)
 *  - uncontrolled: <QuantityStepper name="quantity" defaultValue={10} /> (inside a <form>,
 *    read later through FormData — no React state in the parent at all)
 */
export function QuantityStepper({
  value,
  defaultValue = 1,
  onChange,
  name,
  label = "Quantity",
  min = 1,
  max = 100_000,
}: {
  value?: number;
  defaultValue?: number;
  onChange?: (next: number) => void;
  name?: string;
  label?: string;
  min?: number;
  max?: number;
}) {
  const id = useId();
  const [qty, setQty] = useControllableState({ value, defaultValue, onChange });
  const clamp = (n: number) => Math.min(max, Math.max(min, Number.isFinite(n) ? Math.round(n) : min));

  return (
    <div className="form-group ps-adv-field">
      <label htmlFor={id}>{label}</label>
      <div className="input-group ps-adv-stepper">
        <div className="input-group-prepend">
          <button type="button" className="btn ps-btn-outline" onClick={() => setQty(clamp(qty - 1))} aria-label={`Decrease ${label}`}>
            −
          </button>
        </div>
        <input
          id={id}
          name={name}
          type="number"
          inputMode="numeric"
          className="form-control text-center"
          value={qty}
          min={min}
          max={max}
          onChange={(e) => setQty(clamp(Number(e.target.value)))}
        />
        <div className="input-group-append">
          <button type="button" className="btn ps-btn-outline" onClick={() => setQty(clamp(qty + 1))} aria-label={`Increase ${label}`}>
            +
          </button>
        </div>
      </div>
    </div>
  );
}
