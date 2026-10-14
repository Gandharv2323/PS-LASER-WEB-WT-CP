import { memo } from "react";
import { AsyncView } from "@/components/advanced/async-view";
import { SourceBadge } from "@/components/advanced/offline-note";
import { formatINR } from "@/lib/api/estimate";
import { BREAKDOWN_KEYS, type BreakdownKey, type EstimateResult, type RequestState } from "@/lib/api/types";

const LABELS: Readonly<Record<BreakdownKey, string>> = {
  material: "Material",
  cutting: "Laser cutting",
  piercing: "Piercing",
  bending: "CNC bending",
  coating: "Powder coating",
};

/** Pure presenter: no hooks, no fetching — receives everything via props. */
export function BreakdownTable({ estimate }: { estimate: EstimateResult }) {
  return (
    <table className="table table-sm ps-adv-table">
      <caption className="sr-only">Per-part cost breakdown</caption>
      <tbody>
        {BREAKDOWN_KEYS.map((k) => (
          <tr key={k}>
            <th scope="row">{LABELS[k]}</th>
            <td>{formatINR(estimate.breakdown[k])}</td>
          </tr>
        ))}
        <tr className="ps-adv-strong">
          <th scope="row">Per part</th>
          <td>{formatINR(estimate.perPart)}</td>
        </tr>
        <tr>
          <th scope="row">Subtotal × {estimate.quantity}</th>
          <td>{formatINR(estimate.subtotal)}</td>
        </tr>
        <tr>
          <th scope="row">GST</th>
          <td>{formatINR(estimate.gst)}</td>
        </tr>
        <tr className="ps-adv-strong">
          <th scope="row">Total</th>
          <td>{formatINR(estimate.total)}</td>
        </tr>
      </tbody>
    </table>
  );
}

type SummaryProps = {
  state: RequestState<EstimateResult>;
  onShowBreakdown: () => void;
};

/**
 * Presenter for the estimate card. React.memo: the calculator re-renders on every
 * keystroke, but this card only re-renders when `state` (or the stable callback) changes.
 */
export const EstimateSummary = memo(function EstimateSummary({ state, onShowBreakdown }: SummaryProps) {
  const view = (e: EstimateResult, source: "spring" | "offline" | undefined, busy = false) => (
    <div className={`ps-adv-total${busy ? " is-busy" : ""}`} aria-busy={busy}>
      <SourceBadge source={source} what="estimate" />
      <p className="ps-adv-total-label">Indicative total (incl. GST)</p>
      <p className="ps-adv-total-value">{formatINR(e.total)}</p>
      <p className="ps-adv-muted">
        {formatINR(e.perPart)} per part × {e.quantity} + GST {formatINR(e.gst)}
      </p>
      <button type="button" className="btn ps-btn-outline btn-sm" onClick={onShowBreakdown}>
        <i className="bx bx-list-ul" aria-hidden="true" /> View breakdown
      </button>
    </div>
  );

  return (
    <div aria-live="polite">
      <AsyncView
        state={state}
        idle={() => <p className="ps-adv-muted">Enter your part details to see an estimate.</p>}
        loading={(prev) =>
          prev ? (
            view(prev, undefined, true)
          ) : (
            <p className="ps-adv-muted" role="status">
              <i className="bx bx-loader-alt bx-spin" aria-hidden="true" /> Calculating…
            </p>
          )
        }
        error={(msg) => (
          <div className="alert alert-warning mb-0" role="alert">
            {msg}
          </div>
        )}
        success={(e, source) => view(e, source)}
      />
    </div>
  );
});
