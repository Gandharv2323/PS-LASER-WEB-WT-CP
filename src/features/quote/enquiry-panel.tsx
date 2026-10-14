"use client";

import { useActionState, useOptimistic } from "react";
import { QuantityStepper } from "@/components/advanced/quantity-stepper";
import { submitEnquiry, type EnquiryState, type SentEnquiry } from "./actions";

const INITIAL: EnquiryState = { status: "idle", message: "", history: [] };

/**
 * Enquiry form built on React 19 primitives:
 *  - useActionState: runs the Server Action, gives us the returned state + `isPending`.
 *  - useOptimistic: the enquiry appears in "Sent this session" instantly as "sending…",
 *    and is replaced by the server's answer (stored / WhatsApp-only) when the action ends.
 *  - Uncontrolled inputs (defaultValue + FormData): no per-keystroke React state.
 */
export function EnquiryPanel({ estimateSummary }: { estimateSummary: string }) {
  const [state, dispatchAction, isPending] = useActionState(submitEnquiry, INITIAL);
  const [history, addOptimistic] = useOptimistic(state.history, (list: readonly SentEnquiry[], item: SentEnquiry) => [item, ...list]);

  // Form actions run inside a transition, so the optimistic row stays until the
  // dispatched Server Action settles and `state.history` holds the real entry.
  const formAction = (fd: FormData) => {
    const name = String(fd.get("name") ?? "").trim();
    const summary = String(fd.get("message") ?? "").trim().slice(0, 60);
    if (name.length >= 2 && summary.length >= 10) addOptimistic({ key: "optimistic", name, summary, status: "sending" });
    dispatchAction(fd);
  };

  const err = state.status === "invalid" ? state.fieldErrors : undefined;
  const v = state.status === "invalid" ? state.values : undefined;
  // New key after every server round-trip re-mounts the uncontrolled inputs with fresh defaults.
  const formKey = `${state.status}-${state.history.length}`;

  return (
    <div className="row">
      <div className="col-lg-7">
        <form key={formKey} action={formAction} className="ps-enquiry" noValidate>
          <input type="hidden" name="estimate" value={estimateSummary} />
          <div className="form-row">
            <div className="form-group col-md-6">
              <label htmlFor="q-enq-name">Name *</label>
              <input id="q-enq-name" name="name" autoComplete="name" defaultValue={v?.name} className={`form-control${err?.name ? " is-invalid" : ""}`} />
              {err?.name ? <div className="invalid-feedback d-block">{err.name}</div> : null}
            </div>
            <div className="form-group col-md-6">
              <label htmlFor="q-enq-phone">Phone *</label>
              <input id="q-enq-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" defaultValue={v?.phone} className={`form-control${err?.phone ? " is-invalid" : ""}`} />
              {err?.phone ? <div className="invalid-feedback d-block">{err.phone}</div> : null}
            </div>
          </div>
          <div className="form-row">
            <div className="form-group col-md-6">
              <label htmlFor="q-enq-email">
                Email <span className="ps-optional">(optional)</span>
              </label>
              <input id="q-enq-email" name="email" type="email" autoComplete="email" defaultValue={v?.email} className={`form-control${err?.email ? " is-invalid" : ""}`} />
              {err?.email ? <div className="invalid-feedback d-block">{err.email}</div> : null}
            </div>
            <div className="col-md-6">
              <QuantityStepper name="quantity" label="Quantity (uncontrolled)" defaultValue={Number(v?.quantity) || 100} />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="q-enq-message">Your requirement *</label>
            <textarea
              id="q-enq-message"
              name="message"
              rows={4}
              defaultValue={v?.message}
              placeholder="Material, thickness, size, finish, delivery date…"
              className={`form-control${err?.message ? " is-invalid" : ""}`}
            />
            {err?.message ? <div className="invalid-feedback d-block">{err.message}</div> : null}
          </div>
          <p className="ps-adv-muted small">The current estimate is attached automatically: {estimateSummary || "none yet"}.</p>
          <button type="submit" className="btn btn-primary" disabled={isPending}>
            {isPending ? (
              <>
                <i className="bx bx-loader-alt bx-spin" aria-hidden="true" /> Sending…
              </>
            ) : (
              <>
                <i className="bx bx-send" aria-hidden="true" /> Send enquiry
              </>
            )}
          </button>
          <div role="status" aria-live="polite" className="mt-3">
            {state.status !== "idle" && state.message ? (
              <div className={`alert ${state.status === "sent" ? "alert-success" : state.status === "offline" ? "alert-warning" : "alert-danger"} mb-0`}>
                {state.message}
                {state.whatsappUrl ? (
                  <>
                    {" "}
                    <a href={state.whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn ps-wa-btn btn-sm ml-1">
                      <i className="bx bxl-whatsapp" aria-hidden="true" /> Send on WhatsApp
                    </a>
                  </>
                ) : null}
              </div>
            ) : null}
          </div>
        </form>
      </div>
      <div className="col-lg-5 mt-4 mt-lg-0">
        <h5 className="ps-adv-h5">Sent this session</h5>
        {history.length === 0 ? (
          <p className="ps-adv-muted">Nothing sent yet.</p>
        ) : (
          <ul className="list-unstyled ps-adv-history">
            {history.map((h) => (
              <li key={h.key} className={`ps-adv-history-item is-${h.status}`}>
                <strong>{h.name}</strong> — {h.summary}
                <span className="ps-adv-chip">
                  {h.status === "sending" ? "sending…" : h.status === "stored" ? `stored #${h.id}` : "WhatsApp only"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
