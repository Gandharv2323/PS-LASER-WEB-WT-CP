import { SourceBadge } from "@/components/advanced/offline-note";
import { trackOrder } from "@/lib/api/spring";
import { whatsapp } from "@/lib/pslaser/data";
import { OrderTimeline } from "./order-timeline";

/**
 * Async Server Component: fetches on the server at request time (`cache: "no-store"` in
 * trackOrder), streams into the page through the parent <Suspense> boundary.
 */
export async function TrackResult({ orderNo, phone }: { orderNo: string; phone: string }) {
  const result = await trackOrder(orderNo, phone);

  switch (result.kind) {
    case "found":
      return (
        <>
          <div className="mb-3">
            <SourceBadge source={result.source} what="tracking" />
            {result.source === "offline" ? (
              <p className="ps-adv-muted small mt-2 mb-0">The tracking API is offline, so this is the built-in demo order.</p>
            ) : null}
          </div>
          <OrderTimeline order={result.order} />
        </>
      );
    case "not-found":
      return (
        <div className="alert alert-warning" role="alert">
          No order matches <strong>{orderNo}</strong> with that phone number.{" "}
          {result.source === "offline"
            ? "The tracking API is offline right now; only the demo order PSL-DEMO-001 / 9000000001 works."
            : "Check both values or ask us on WhatsApp."}{" "}
          <a href={whatsapp(`Hi PS Laser, what is the status of my order ${orderNo}?`)} target="_blank" rel="noopener noreferrer">
            Ask on WhatsApp
          </a>
        </div>
      );
    case "invalid":
      return (
        <div className="alert alert-danger" role="alert">
          {result.message}
        </div>
      );
  }
}

export function TrackSkeleton() {
  return (
    <div className="ps-adv-card" aria-busy="true" aria-label="Loading order">
      <div className="ps-adv-skeleton" style={{ height: 28, width: "50%" }} />
      <div className="ps-adv-skeleton mt-3" style={{ height: 90 }} />
      <div className="ps-adv-skeleton mt-3" style={{ height: 56 }} />
    </div>
  );
}
