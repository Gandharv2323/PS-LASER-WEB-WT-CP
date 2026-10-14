"use client";

import dynamic from "next/dynamic";
import { lazy, Suspense, useCallback, useMemo, useReducer, useState } from "react";
import { DevProfiler } from "@/components/advanced/dev-profiler";
import { ErrorBoundary } from "@/components/advanced/error-boundary";
import { IndicativeNote, SourceBadge } from "@/components/advanced/offline-note";
import { PortalModal } from "@/components/advanced/portal-modal";
import { QuantityStepper } from "@/components/advanced/quantity-stepper";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useEstimate } from "@/hooks/use-estimate";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useMediaQuery, usePrefersReducedMotion } from "@/hooks/use-media-query";
import { formatINR, validateEstimate } from "@/lib/api/estimate";
import type { DataSource, EstimateInput, EstimateResult, Material } from "@/lib/api/types";
import { whatsapp } from "@/lib/pslaser/data";
import { useQuoteStore } from "@/store/quote-store";
import { EnquiryPanel } from "./enquiry-panel";
import { BreakdownTable, EstimateSummary } from "./estimate-summary";
import { Estimator } from "./estimator";
import { PartsList } from "./parts-list";
import { INITIAL_QUOTE, PRESETS, quoteReducer, toEstimateInput } from "./quote-reducer";

/* Code splitting:
 *  - next/dynamic with ssr:false for the canvas preview (browser-only API, own chunk);
 *  - React.lazy for the SVG chart, fetched only when the user opens "Compare materials". */
const SheetPreview = dynamic(() => import("./sheet-preview"), {
  ssr: false,
  loading: () => <div className="ps-adv-skeleton" style={{ aspectRatio: "2 / 1" }} aria-label="Loading nesting preview" />,
});
const MaterialsChart = lazy(() => import("./materials-chart"));

function describe(input: EstimateInput, e: EstimateResult | undefined, materials: readonly Material[]): string {
  const name = materials.find((m) => m.code === input.materialCode)?.name ?? input.materialCode;
  const base = `${name} ${input.thicknessMm} mm, ${input.lengthMm} x ${input.widthMm} mm, cut ${input.cutLengthMm} mm, ${input.pierces} pierces, ${input.bends} bends${input.powderCoat ? ", powder coated" : ""}, qty ${input.quantity}`;
  return e ? `${base} — indicative ${formatINR(e.total)} incl. GST (sample rates)` : base;
}

/**
 * Container: owns state (useReducer), data fetching (useEstimate) and side effects, then
 * hands plain props to presenters (EstimateSummary, BreakdownTable, PartsList).
 */
export function QuoteCalculator({ materials, materialsSource }: { materials: readonly Material[]; materialsSource: DataSource }) {
  const [state, dispatch] = useReducer(quoteReducer, INITIAL_QUOTE);
  const input = useMemo(() => toEstimateInput(state), [state]); // stable identity per state
  const debouncedInput = useDebouncedValue(input, 350);
  const estimate = useEstimate(debouncedInput);
  const fieldErrors = useMemo(() => {
    const v = validateEstimate(input, materials);
    return v.ok ? {} : v.fieldErrors;
  }, [input, materials]);

  const [breakdownOpen, setBreakdownOpen] = useState(false);
  const openBreakdown = useCallback(() => setBreakdownOpen(true), []); // stable -> memo(EstimateSummary) holds
  const closeBreakdown = useCallback(() => setBreakdownOpen(false), []);
  const [showChart, setShowChart] = useState(false);
  const [showTips, setShowTips] = useLocalStorage("psl-quote-tips", true);
  const isDesktop = useMediaQuery("(min-width: 992px)", true);
  const reducedMotion = usePrefersReducedMotion();
  const addToCart = useQuoteStore((s) => s.add);
  const [savedFlash, setSavedFlash] = useState(false);

  const latest = estimate.status === "success" ? estimate.data : estimate.status === "loading" ? estimate.previous : undefined;
  const source = estimate.status === "success" ? estimate.source ?? "offline" : undefined;
  const summary = describe(input, latest, materials);
  const material = materials.find((m) => m.code === state.materialCode);

  const save = () => {
    if (estimate.status !== "success") return;
    addToCart({ label: describe(input, undefined, materials), input, estimate: estimate.data, source: estimate.source ?? "offline" });
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2000);
    document.getElementById("cart")?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
  };

  return (
    <DevProfiler id="QuoteCalculator">
      <div className="row">
        <div className="col-lg-7">
          <div className="ps-adv-card">
            <div className="ps-adv-card-head">
              <h4>Part details</h4>
              <SourceBadge source={materialsSource} what="materials" />
            </div>
            <div className="ps-adv-presets" role="group" aria-label="Example parts">
              {PRESETS.map((p) => (
                <button key={p.label} type="button" className="ps-adv-chip-btn" onClick={() => dispatch({ type: "applyPreset", preset: p.preset })}>
                  {p.label}
                </button>
              ))}
              <button type="button" className="ps-adv-chip-btn" onClick={() => dispatch({ type: "reset" })}>
                Reset
              </button>
            </div>

            <Estimator state={state} dispatch={dispatch} errors={fieldErrors}>
              <Estimator.Row>
                <div className="col-sm-7">
                  <Estimator.Material materials={materials} />
                </div>
                <div className="col-sm-5">
                  <Estimator.Number field="thicknessMm" label="Thickness" unit="mm" step={0.5} max={material?.maxThicknessMm} />
                </div>
              </Estimator.Row>
              <Estimator.Row>
                <div className="col-6">
                  <Estimator.Number field="lengthMm" label="Length" unit="mm" max={3000} />
                </div>
                <div className="col-6">
                  <Estimator.Number field="widthMm" label="Width" unit="mm" max={1500} />
                </div>
              </Estimator.Row>
              <Estimator.Row>
                <div className="col-sm-6">
                  <Estimator.Number
                    field="cutLengthMm"
                    label="Total cut length"
                    unit="mm"
                    step={10}
                    hint={showTips ? "Perimeter + all internal cut-outs. A 300 × 200 rectangle = 1000 mm." : undefined}
                  />
                </div>
                <div className="col-6 col-sm-3">
                  <Estimator.Number field="pierces" label="Pierces" hint={showTips ? "1 per cut-out + 1" : undefined} />
                </div>
                <div className="col-6 col-sm-3">
                  <Estimator.Number field="bends" label="Bends" />
                </div>
              </Estimator.Row>
              <Estimator.Row>
                <div className="col-sm-6">
                  {/* Controlled use of the stepper: value lives in the reducer. */}
                  <QuantityStepper
                    label="Quantity"
                    value={Math.max(1, Math.round(input.quantity) || 1)}
                    onChange={(n) => dispatch({ type: "setField", field: "quantity", value: String(n) })}
                  />
                </div>
                <div className="col-sm-6 d-flex align-items-center">
                  <Estimator.Toggle label="Powder coating (both sides)" />
                </div>
              </Estimator.Row>
            </Estimator>
            <button type="button" className="btn btn-link p-0 ps-adv-link" onClick={() => setShowTips(!showTips)}>
              {showTips ? "Hide tips" : "Show tips"}
            </button>
          </div>
        </div>

        <div className="col-lg-5 mt-4 mt-lg-0">
          <div className="ps-adv-card ps-adv-sticky">
            <h4>Your estimate</h4>
            <EstimateSummary state={estimate} onShowBreakdown={openBreakdown} />
            <div className="ps-adv-actions">
              <button type="button" className="btn btn-primary" onClick={save} disabled={estimate.status !== "success"}>
                <i className="bx bx-cart-add" aria-hidden="true" /> {savedFlash ? "Saved!" : "Save estimate"}
              </button>
              <a href={whatsapp(`Hi PS Laser, please quote: ${summary}. I can share the DXF.`)} target="_blank" rel="noopener noreferrer" className="btn ps-wa-btn">
                <i className="bx bxl-whatsapp" aria-hidden="true" /> Get final quote
              </a>
            </div>
            <IndicativeNote />
          </div>
        </div>
      </div>

      {/* Mobile-only sticky total bar; rendered only below lg (useMediaQuery). */}
      {!isDesktop && latest ? (
        <div className="ps-adv-mobilebar" aria-hidden="true">
          <span>{formatINR(latest.total)}</span>
          <small>indicative, incl. GST</small>
        </div>
      ) : null}

      <PortalModal open={breakdownOpen} onClose={closeBreakdown} title="Cost breakdown (sample rates)">
        {latest ? <BreakdownTable estimate={latest} /> : <p>No estimate yet.</p>}
        <IndicativeNote />
        {source ? <SourceBadge source={source} what="estimate" /> : null}
      </PortalModal>

      <div className="row mt-5">
        <div className="col-lg-6">
          <h4 className="ps-adv-h4">Sheet nesting preview</h4>
          <ErrorBoundary
            fallback={(error, reset) => (
              <div className="alert alert-warning">
                Preview unavailable ({error.message}).{" "}
                <button type="button" className="btn btn-link p-0" onClick={reset}>
                  Retry
                </button>
              </div>
            )}
          >
            <SheetPreview lengthMm={debouncedInput.lengthMm} widthMm={debouncedInput.widthMm} quantity={Math.max(1, debouncedInput.quantity)} />
          </ErrorBoundary>
          <div className="mt-3">
            {showChart ? (
              <Suspense fallback={<div className="ps-adv-skeleton" style={{ height: 180 }} aria-label="Loading chart" />}>
                <MaterialsChart input={debouncedInput} materials={materials} />
              </Suspense>
            ) : (
              <button type="button" className="btn ps-btn-outline btn-sm" onClick={() => setShowChart(true)}>
                <i className="bx bx-bar-chart-alt-2" aria-hidden="true" /> Compare materials
              </button>
            )}
          </div>
        </div>
        <div className="col-lg-6 mt-4 mt-lg-0">
          <h4 className="ps-adv-h4">Production parts list</h4>
          <DevProfiler id="PartsList">
            <PartsList
              quantity={debouncedInput.quantity}
              perPart={latest?.perPart ?? 0}
              lengthMm={debouncedInput.lengthMm}
              widthMm={debouncedInput.widthMm}
            />
          </DevProfiler>
        </div>
      </div>

      <section className="ps-adv-subsection" aria-labelledby="enquiry-h">
        <h4 id="enquiry-h" className="ps-adv-h4">
          Send this as an enquiry
        </h4>
        <EnquiryPanel estimateSummary={latest ? summary : ""} />
      </section>
    </DevProfiler>
  );
}
