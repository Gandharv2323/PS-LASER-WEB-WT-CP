"use client";

import { useRouter } from "next/navigation";
import { memo, useDeferredValue, useMemo, useState } from "react";
import { DevProfiler } from "@/components/advanced/dev-profiler";
import { useLiveWorkOrders } from "@/hooks/use-live-work-orders";
import { QueryCacheContext } from "@/hooks/use-query";
import { QueryCache } from "@/lib/api/query-cache";
import { WORK_ORDER_STATUSES, type Session, type WorkOrder, type WorkOrderStatus } from "@/lib/api/types";
import { statusLabel } from "@/features/track/order-timeline";

const Row = memo(function Row({ o }: { o: WorkOrder }) {
  return (
    <tr>
      <th scope="row">{o.orderNo}</th>
      <td>{o.customerName}</td>
      <td className="d-none d-md-table-cell">{o.description}</td>
      <td>{o.quantity}</td>
      <td>
        <span className={`ps-adv-status is-${o.status}`}>{statusLabel(o.status)}</span>
      </td>
      <td className="d-none d-sm-table-cell">{o.dueDate ? new Date(o.dueDate).toLocaleDateString("en-IN") : "—"}</td>
    </tr>
  );
});

function Board({ session }: { session: Session }) {
  const router = useRouter();
  const { state, refetch, live } = useLiveWorkOrders();
  const [search, setSearch] = useState("");
  const deferred = useDeferredValue(search);
  const [status, setStatus] = useState<WorkOrderStatus | "all">("all");

  const orders = useMemo(() => (state.status === "success" ? state.data : state.status === "loading" ? state.previous ?? [] : []), [state]);
  const counts = useMemo(() => {
    const c = Object.fromEntries(WORK_ORDER_STATUSES.map((s) => [s, 0])) as Record<WorkOrderStatus, number>;
    for (const o of orders) c[o.status]++;
    return c;
  }, [orders]);
  const visible = useMemo(() => {
    const q = deferred.trim().toLowerCase();
    return orders.filter((o) => (status === "all" || o.status === status) && (!q || `${o.orderNo} ${o.customerName} ${o.description}`.toLowerCase().includes(q)));
  }, [orders, deferred, status]);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.refresh();
  };

  return (
    <div>
      <div className="ps-adv-card-head mb-3">
        <div>
          <h4 className="mb-1">Production board</h4>
          <span className="ps-adv-muted small">
            Signed in as {session.name} ({session.role})
          </span>
        </div>
        <div className="d-flex align-items-center flex-wrap" style={{ gap: 8 }}>
          <span className={`ps-adv-badge ${live === "live" ? "ps-adv-badge--live" : "ps-adv-badge--offline"}`}>
            <i className={`bx ${live === "live" ? "bx-broadcast" : "bx-time"}`} aria-hidden="true" />{" "}
            {live === "live" ? "Live (STOMP /topic/work-orders)" : "Polling every 15 s"}
          </span>
          <button type="button" className="btn ps-btn-outline btn-sm" onClick={refetch}>
            <i className="bx bx-refresh" aria-hidden="true" /> Refresh
          </button>
          <button type="button" className="btn btn-sm btn-dark" onClick={logout}>
            Log out
          </button>
        </div>
      </div>

      <div className="ps-adv-chips mb-3" role="group" aria-label="Filter by status">
        <button type="button" className={`ps-adv-chip-btn${status === "all" ? " is-active" : ""}`} aria-pressed={status === "all"} onClick={() => setStatus("all")}>
          All ({orders.length})
        </button>
        {WORK_ORDER_STATUSES.map((s) => (
          <button key={s} type="button" className={`ps-adv-chip-btn${status === s ? " is-active" : ""}`} aria-pressed={status === s} onClick={() => setStatus(s)}>
            {statusLabel(s)} ({counts[s]})
          </button>
        ))}
      </div>
      <label htmlFor="wo-search" className="sr-only">
        Search work orders
      </label>
      <input id="wo-search" type="search" className="form-control mb-3" placeholder="Search order no, customer, job" value={search} onChange={(e) => setSearch(e.target.value)} />

      {state.status === "error" ? (
        <div className="alert alert-warning" role="alert">
          Could not load work orders: {state.error}{" "}
          <button type="button" className="btn btn-link p-0" onClick={refetch}>
            Retry
          </button>
        </div>
      ) : state.status === "loading" && orders.length === 0 ? (
        <div className="ps-adv-skeleton" style={{ height: 160 }} aria-label="Loading work orders" />
      ) : visible.length === 0 ? (
        <p className="ps-adv-muted">No work orders match.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-sm ps-adv-table ps-adv-wo">
            <thead>
              <tr>
                <th scope="col">Order</th>
                <th scope="col">Customer</th>
                <th scope="col" className="d-none d-md-table-cell">Job</th>
                <th scope="col">Qty</th>
                <th scope="col">Status</th>
                <th scope="col" className="d-none d-sm-table-cell">Due</th>
              </tr>
            </thead>
            <tbody style={{ opacity: search !== deferred ? 0.6 : 1 }}>
              {visible.map((o) => (
                <Row key={o.orderNo} o={o} />
              ))}
            </tbody>
          </table>
        </div>
      )}
      {state.status !== "idle" && state.updatedAt ? (
        <p className="ps-adv-muted small">
          {state.fetching ? "Refreshing…" : `Updated ${new Date(state.updatedAt).toLocaleTimeString("en-IN")}`}
        </p>
      ) : null}
    </div>
  );
}

/** Provides one QueryCache for the dashboard subtree (typed context). */
export function DashboardBoard({ session }: { session: Session }) {
  const [cache] = useState(() => new QueryCache());
  return (
    <QueryCacheContext.Provider value={cache}>
      <DevProfiler id="DashboardBoard">
        <Board session={session} />
      </DevProfiler>
    </QueryCacheContext.Provider>
  );
}
