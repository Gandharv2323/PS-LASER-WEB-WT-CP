import { WORK_ORDER_STATUSES, type PublicOrder, type WorkOrderStatus } from "@/lib/api/types";
import { machines } from "@/lib/pslaser/data";

const LABEL: Readonly<Record<WorkOrderStatus, string>> = {
  received: "Received",
  cutting: "Laser cutting",
  bending: "CNC bending",
  welding: "Welding",
  coating: "Powder coating",
  inspection: "Inspection",
  dispatched: "Dispatched",
};
const ICON: Readonly<Record<WorkOrderStatus, string>> = {
  received: "bx-receipt",
  cutting: "bx-cut",
  bending: "bx-git-commit",
  welding: "bx-bolt-circle",
  coating: "bx-spray-can",
  inspection: "bx-search-alt",
  dispatched: "bxs-truck",
};

export const statusLabel = (s: string) => LABEL[s as WorkOrderStatus] ?? s;

/** Server-rendered presenter: zero client JS. */
export function OrderTimeline({ order }: { order: PublicOrder }) {
  const current = WORK_ORDER_STATUSES.indexOf(order.status);
  const machine = machines.find((m) => m.slug === order.machineSlug);
  return (
    <div className="ps-adv-card">
      <div className="ps-adv-card-head">
        <h4>Order {order.orderNo}</h4>
        <span className="ps-adv-chip ps-adv-chip--strong">{statusLabel(order.status)}</span>
      </div>
      <dl className="ps-adv-dl">
        <dt>Customer</dt>
        <dd>{order.customerName}</dd>
        <dt>Job</dt>
        <dd>{order.description}</dd>
        <dt>Quantity</dt>
        <dd>{order.quantity}</dd>
        {machine ? (
          <>
            <dt>Machine</dt>
            <dd>{machine.name}</dd>
          </>
        ) : null}
        {order.dueDate ? (
          <>
            <dt>Due</dt>
            <dd>{new Date(order.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</dd>
          </>
        ) : null}
      </dl>
      <ol className="ps-adv-steps" aria-label="Production stages">
        {WORK_ORDER_STATUSES.map((s, i) => (
          <li key={s} className={i < current ? "is-done" : i === current ? "is-current" : ""} aria-current={i === current ? "step" : undefined}>
            <i className={`bx ${ICON[s]}`} aria-hidden="true" />
            <span>{LABEL[s]}</span>
          </li>
        ))}
      </ol>
      {order.events.length > 0 ? (
        <>
          <h5 className="ps-adv-h5 mt-4">History</h5>
          <ul className="ps-adv-events">
            {order.events.map((e, i) => (
              <li key={i}>
                <strong>{statusLabel(e.status)}</strong>
                {e.note ? ` — ${e.note}` : ""}
                {e.createdAt ? <span className="ps-adv-muted"> · {new Date(e.createdAt).toLocaleString("en-IN")}</span> : null}
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </div>
  );
}
